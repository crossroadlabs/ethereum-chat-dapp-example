
import getWeb3 from './getWeb3'
import promisify from './promisify'

class Swarm {
  constructor(bzz) {
    this._bzz = bzz
  }

  uploadFile() {
    return promisify(this._bzz.upload)({ pick: 'file' })
  }

  download(hash) {
    return promisify(this._bzz.download)(hash)
  }
}

var swarm = null

export default () => {
  if (swarm) return Promise.resolve(swarm)
  return getWeb3().then((result) => {
    swarm = new Swarm(result.web3.bzz)
    return swarm
  })
}
