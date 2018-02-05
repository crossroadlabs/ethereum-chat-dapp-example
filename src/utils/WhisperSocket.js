
import getWeb3 from './getWeb3'

class WhisperSocket {
  constructor(user) {
    this.user = user;
    this.onmessage = null;
    this.onerror = null;

    this.user.whisperInfoUpdated = () => {
      this.initialize().catch((err) => {
        console.error(err)
        if (this.onerror) this.onerror(err)
      })
    }
  }

  initialize() {
    return this._updateIdentity()
    .then(([id, pubKey]) => {
      return this._listen(id, pubKey).then(() => this)
    })
  }

  _listen(pkId, pubKey) {
    return this._getShh().then((shh) => {
      shh.clearSubscriptions();
      shh.subscribe('mesages', {
        privateKeyID: pkId,
        pubKey: pubKey
      })
      .on('data', (message) => {
        console.debug('Message arrived', message)
        if (this.onmessage) {
          this.onmessage({
            from: message.sig,
            message: message.payload
          })
        }
      })
      .on('error', (err) => {
        console.error(err)
        if (this.onerror) this.onerror(err)
      })
    })
  }

  _updateIdentity() {
    this.user.getWhisperInfo()
    .then((info) => this._getShh().then((shh) => [info, shh]))
    .then(([info, shh]) => {
      return info.identity ? shh.hasKeyPair(info.identity).then((has) => [info.identity, has, shh]) : [info.identity, false, shh]
    })
    .then(([identity, has, shh]) => {
      return has ? [identity, false, shh] : shh.newKeyPair().then((id) => [id, true, shh])
    })
    .then(([id, created, shh]) => {
      shh.getPublicKey(id).then((key) => {
        if (created) {
          return this.user.setWhisperInfo(id, key).then(() => [id, key])
        }
        return [id, key]
      })
    })
  }

  _getShh() {
    return getWeb3().then((result) => result.web3.shh);
  }

  sendMessage(to, message) {
    return to.getPubKey().then((pubKey) => {
      return this.user.getWhisperInfo().then((info) => [info.identity, pubKey])
    }).then(([keyId, pubKey]) => {
      return this._getShh().then((shh) => {
        shh.post({
          sig: keyId,
          pubKey: pubKey,
          payload: message,
          ttl: 10,
          powTime: 3,
          powTarget: 0.5
        }).then((sent) => {
          if (!sent) throw new Error("Error while sending message")
        })
      })
    })
  }
}

export default (user) => { 
  return (new WhisperSocket(user)).initialize()
}