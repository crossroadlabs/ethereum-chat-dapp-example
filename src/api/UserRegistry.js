import contract from 'truffle-contract'
import UserRegistryContract from '../../build/contracts/UserRegistry.json'

const NULL_ID = '0x0000000000000000000000000000000000000000'

class UserRegistry {

  static $inject = ['User', '_UserRegistryContract()']

  constructor(User, userRegistryContract) {
    this._userRegistryContract = userRegistryContract.deployed()
    this._User = User
  }

  meOrRegister() {
    return this.me().then((user) => user ? user : this.register())
  }

  me(walletId) {
    return this._userRegistryContract
      .then((registry) => registry.me(walletId ? { from: walletId } : undefined))
      .then((userId) => (userId === NULL_ID) ? null : new this._User(userId))
  }

  register() {
    return this._userRegistryContract
      .then((registry) => registry.register()).then((result) => (!result.logs[0]) ? null : result.logs[0].args.user)
      .then((userId) => {
        if (!userId || userId === NULL_ID) throw new Error("Registration failed")
        return new this._User(userId)
      })
  }

  getUser(walletId) {
    return this._userRegistryContract
      .then((registry) => registry.getUser(walletId))
      .then((userId) => {
        if (userId === NULL_ID || userId === '0x') throw new Error('User not found')
        return new this._User(userId)
      })
  }

  static injected(context) {
    const userRegistryContract = contract(UserRegistryContract)
    userRegistryContract.setProvider(this.context.injected('Web3()').currentProvider)
    let defaults = userRegistryContract.defaults()
    if (!defaults.gas) {
      defaults.gas = this.context.injected('GAS')
      userRegistryContract.defaults(defaults)
    }
    this.context.addSingletonObject('_UserRegistryContract', userRegistryContract)
  }
}

export default UserRegistry