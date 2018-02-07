import contract from 'truffle-contract'
import UserRegistryContract from '../../build/contracts/UserRegistry.json'

const NULL_ID = '0x0000000000000000000000000000000000000000'

class UserRegistry {
  constructor(userRegistryContract, User) {
    this._userRegistryContract = userRegistryContract
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
      .then((registry) => registry.register().then(() => registry.me()))
      .then((userId) => {
        if (userId === NULL_ID) throw new Error("Registration failed")
        return new this._User(userId)
      })
  }

  getUser(walletId) {
    return this._userRegistryContract
      .then((registry) => registry.getUser(walletId))
      .then((userId) => {
        if (userId === NULL_ID) throw new Error('User not found')
        return new this._User(userId)
      })
  }
}

UserRegistry.bootstrap = function(web3, User) {
  const userRegistryContract = contract(UserRegistryContract)
  userRegistryContract.setProvider(web3.currentProvider)

  class UserRegistryBootstrapped extends this {
    constructor() {
      super(userRegistryContract.deployed(), User)
    }
  }

  var instance = null

  UserRegistryBootstrapped.instance = function() {
    if (instance) return instance
    return instance = new this()
  }

  return UserRegistryBootstrapped
}

export default UserRegistry