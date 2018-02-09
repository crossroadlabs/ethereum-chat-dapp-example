
import promisify from '../utils/promisify'

class Swarm {
  static $inject = ['Web3()']

  constructor(web3) {
    this._bzz = web3.bzz
  }

  uploadFile() {
    return promisify(this._bzz, 'upload')({ pick: 'file' })
  }

  upload(data) {
    return promisify(this._bzz, 'upload')(data)
  }

  download(hash) {
    return promisify(this._bzz, 'download')(hash)
  }
}

 export default Swarm
