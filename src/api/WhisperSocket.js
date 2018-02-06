
import getWeb3 from '../utils/getWeb3'
import promisify from '../utils/promisify'

class WhisperSocket {
  constructor(user) {
    this.user = user;
    this.onmessage = null;
    this.onerror = null;
    this._listening = null;

    this.user.whisperInfoUpdated = () => {
      this.initialize().catch((err) => {
        console.error(err)
        if (this.onerror) this.onerror(err)
      })
    }
  }

  initialize() {
    return this._updateIdentity()
    .then(([pubKey, key]) => {
      return this._listen(pubKey, key).then(() => this)
    })
  }

  _listen(pubKey, key) {
    return this._getShh().then((shh) => {
      if (this._listening) this._listening.stopWatching()
      this._listening = shh.filter({ to: key })
      this._listening.watch((err, message) => {
        if (err) {
          console.error(err)
          if (this.onerror) this.onerror(err)
        } else {
          console.debug('Message arrived', message)
          if (this.onmessage) {
            this.onmessage({
              from: message.from,
              message: message.payload,
              sent: message.sent
            })
          }
        }
      })
    })
  }

  _updateIdentity() {
    this.user.getWhisperInfo()
    .then((info) => this._getShh().then((shh) => [info, shh]))
    .then(([info, shh]) => {
      return info.key ? promisify(shh.hasIdentity)(info.key).then((has) => [info.key, has, shh]) : [info.key, false, shh]
    })
    .then(([key, has, shh]) => {
      return has ? [key, false, shh] : promisify(shh.newIdentity)().then((id) => [id, true, shh])
    })
    .then(([id, created, shh]) => {
      // This part for new web3 1.0 API
      // shh.getPublicKey(id).then((pubKey) => {
      //   if (created) {
      //     return this.user.setWhisperInfo(pubKey, id).then(() => [pubKey, id])
      //   }
      //   return [pubKey, id]
      // })
      if (created) {
        return this.user.setWhisperInfo(id, id).then(() => [id, id])
      }
      return [id, id]
    })
  }

  _getShh() {
    return getWeb3().then((result) => result.web3.shh);
  }

  sendMessage(to, message) {
    return to.getPubKey().then((pubKey) => {
      return this.user.getWhisperInfo().then((info) => [info.key, pubKey])
    }).then(([key, pubKey]) => {
      return this._getShh().then((shh) => {
        return promisify(shh.post)({
          from: key,
          payload: message,
          ttl: 100,
          workToProve: 10
        })
      })
    })
  }
}

export default (user) => { 
  return (new WhisperSocket(user)).initialize()
}