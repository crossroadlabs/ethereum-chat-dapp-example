
import EventEmitter from 'events'
import promisify from '../utils/promisify'

class WhisperSocket extends EventEmitter {
  constructor(user, shh) {
    super()

    this._user = user
    this._shh = shh
    this._filter = null
    this._timer = null

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
    if (this._timer) {
      clearInterval(this._timer)
      this.emit("stopped")
    }
    this._timer = null
  }

  _infoUpdated() {
    if (this._filter) {
      this.stop()
      this._shh.deleteMessageFilter(this._filter, (err) => {
        if (err) {
          this.emit('error', err)
        }
        this._filter = null
        this.start()
      })
    } else if (this._timer) {
      this.stop()
      this.start()
    }
  }

  _listen(pubKey, key) {
    console.log("Listen")
    if (this._timer) return Promise.reject(new Error("Already listening" ))

    var filter = this._filter ? Promise.resolve(this._filter) : promisify(this._shh, 'newMessageFilter')({
      key: key,
      sig: pubKey
    })

    return filter.then((filterId) => {
      this._filter = filterId

      this._timer = setInterval(() => {
        this._shh.getFilterMessages(filterId, (err, messages) => {
          if (err) {
            console.error(err)
            this.emit("error", err)
          } else {
            console.debug('New messages arrived', messages)
            messages.forEach((message) => {
              this.emit("message", {
                from: message.sig,
                message: message.payload,
                sent: new Date(message.timestamp)
              })
            })
          }
        })
      }, 2000)
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
      return this._user.getWhisperInfo().then((info) => [info.key, pubKey])
    }).then(([key, pubKey]) => {
      return promisify(this._shh, 'post')({
          sig: key,
          pubKey: pubKey,
          payload: message,
          ttl: 100,
          powTarget: 0.5,
          powTime: 2
        })
      })
  }
}

WhisperSocket.bootstrap = function(web3) {
  class WhisperSocketBootstrapped extends this {
    constructor(user) {
      super(user, web3.shh)
    }
  }
  return WhisperSocketBootstrapped
}

export default WhisperSocket