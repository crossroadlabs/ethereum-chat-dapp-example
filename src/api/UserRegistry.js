import contract from 'truffle-contract'
import UserRegistryContract from '../../build/contracts/UserRegistry.json'
import getWeb3 from '../utils/getWeb3'
import User from './User'

const userRegistryContract = contract(UserRegistryContract)

var userRegistry = null;

class UserRegistry {
  constructor(userRegistryContract) {
    this._userRegistryContract = userRegistryContract
    this._me = null
  }

  meOrRegister() {
    if (this._me) return this._me
    return this._me = this._userRegistryContract
      .then((registry) => registry.me().then((me) => [me, registry]))
      .then(([me, registry]) => (me === '0x00000000000000000000') ? registry.register().then(() => registry.me()) : me)
      .then((me) => User(me))
  }

  getUser(walletId) {
    return this._userRegistryContract
      .then((registry) => registry.getUser(walletId))
      .then((userId) => {
        if (userId === '0x00000000000000000000') throw new Error('User not found')
        return User(userId)
      })
  }
}

export default () => {
  if (userRegistry) return Promise.resolve(userRegistry)
  return getWeb3().then((result) => {
    if (userRegistryContract.getProvider() !== result.web3.currentProvider) {
      userRegistryContract.setProvider(result.web3.currentProvider)
    }
    userRegistry = new UserRegistry(userRegistryContract.deployed())
    return userRegistry
  })
}