
import promisify from '../utils/promisify'

class Accounts {
  constructor(web3, userRegistry) {
    this._web3 = web3
    this._userRegistry = userRegistry
  }

  getAccounts() {
    return promisify(this._web3.eth, 'getAccounts')().then((accounts) => {
      return Promise.all(accounts.map((account) => {
        return this._userRegistry.me(account).then((user) => { return { id: account, user: user } })
      }))
    })
  }

  get currentAccount() {
    return this._web3.eth.defaultAccount
  }

  set currentAccount(walledAccountId) {
    this._web3.eth.defaultAccount = walledAccountId;
  }
}

Accounts.bootstrap = function(web3, userRegistry) {
  class AccountsBootstrapped extends this {
    constructor() {
      super(web3, userRegistry)
    }
  }

  var instance = null

  AccountsBootstrapped.instance = function() {
    if (instance) return instance
    return instance = new this()
  }

  return AccountsBootstrapped
}

export default Accounts