
import promisify from '../utils/promisify'

class Swarm {
  constructor(bzz) {
    this._bzz = bzz
  }

  uploadFile() {
    return promisify(this._bzz, 'upload')({ pick: 'file' })
  }

  download(hash) {
    return promisify(this._bzz, 'download')(hash)
  }
}

Swarm.bootstrap = function(web3) {
  class SwarmBootstrapped extends this {
    constructor() {
      super(web3.bzz)
    }
  }

  var instance = null

  SwarmBootstrapped.instance = function() {
    if (instance) return instance
    return instance = new this()
  }

  return SwarmBootstrapped
}

 export default Swarm
