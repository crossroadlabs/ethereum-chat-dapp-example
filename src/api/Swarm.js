
import promisify from '../utils/promisify'
import swarm from 'swarm-js'

class Swarm {
  static $inject = ['Web3()', 'SWARM_API_URL']

  constructor(web3, url) {
    if (web3.bzz) {
      this._bzz = web3.bzz
      this._emulated = false
    } else {
      this._bzz = swarm.at(url)
      this._emulated = true
    }
  }

  uploadFile() {
    return this._emulated ? this._bzz.upload({ pick: 'file' }) : promisify(this._bzz, 'upload')({ pick: 'file' })
  }

  upload(data) {
    return this._emulated ? this._bzz.upload(data) : promisify(this._bzz, 'upload')(data)
  }

  download(hash) {
    return this._emulated ? this._bzz.download(hash) : promisify(this._bzz, 'download')(hash)
  }
}

 export default Swarm
