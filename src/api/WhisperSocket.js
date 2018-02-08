
import EventEmitter from 'events'
import promisify from '../utils/promisify'

class WhisperSocket extends EventEmitter {
  static $inject = ['Web3()']

  constructor(web3, user) {
    super()

    this._user = user
    this._shh = web3.shh
    this._web3 = web3
    this._filter = null

    user.on('whisperInfoUpdated', () => {
      this._infoUpdated()
    })
  }

  start() {
    if (this._timer) {
      this.emit("error", new Error("Already started"))
      return
    }
    this._updateIdentity()
      .then(([pubKey, key]) => this._listen(pubKey, key))
      .then(() => {
        this.emit("started")
      })
      .catch((err) => {
        this.emit("error", err)
      })
  }

  stop() {
    if (this._filter) {
      this._filter.stopWatching((err) => {
        if (err) {
          this.emit('error', err)
        }
        this.emit('stopped')
      })
      this._filter = null
    }
  }

  _infoUpdated() {
    if (this._filter) {
      this.stop()
      this.start()
    }
  }

  _listen(pubKey, key) {
    console.log("Listen")
    if (this._filter) throw new Error("Already listening" )

    this._filter = this._shh.newMessageFilter({
      privateKeyID: key
    })

    this._filter.watch((err, message) => {
      if (err) {
        console.error(err)
        this.emit("error", err)
      } else {
        console.debug('New messages arrived', message)
        this.emit("message", {
          from: message.sig,
          message: this._web3.toUtf8(message.payload),
          sent: new Date(message.timestamp*1000)
        })
      }
    })
  }

  _updateIdentity() {
    return this._user.getWhisperInfo()
      .then(([pubKey, key]) => {
        return key !== '' ? promisify(this._shh, 'hasKeyPair')(key).then((has) => [key, pubKey, has]) : [key, pubKey, false]
      })
      .then(([key, pubKey, has]) => {
        return has ? [key, pubKey, false] : promisify(this._shh, 'newKeyPair')().then((id) => [id, pubKey, true])
      })
      .then(([id, pubKey, created]) => {
        if (created) {
          return promisify(this._shh, 'getPublicKey')(id).then((pubKey) => {
            return this._user.setWhisperInfo(pubKey, id).then(() => [pubKey, id])
          })
        }
        return [pubKey, id]
      })
  }

  sendMessage(to, message) {
    return to.getPubKey().then((pubKey) => {
      return this._user.getWhisperInfo().then(([ownPubKey, ownKey]) => [ownKey, pubKey])
    }).then(([key, pubKey]) => {
      return promisify(this._shh, 'post')({
          sig: key,
          pubKey: pubKey,
          payload: this._web3.fromUtf8(message),
          ttl: 100,
          powTarget: 0.5,
          powTime: 2
        })
      })
  }
}

export default WhisperSocket