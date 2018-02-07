import contract from 'truffle-contract'
import UserRegistryContract from '../../build/contracts/UserRegistry.json'

const NULL_ID = '0x0000000000000000000000000000000000000000'

class UserRegistry {
  constructor(userRegistryContract, User) {
    this._userRegistryContract = userRegistryContract
    this._me = null
    this._User = User
  }

  meOrRegister() {
    if (this._me) return this._me
    return this._me = this._userRegistryContract
      .then((registry) => registry.me().then((me) => [me, registry]))
      .then(([me, registry]) => (me === NULL_ID) ? registry.register().then(() => registry.me()) : me)
      .then((me) => new this._User(me))
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