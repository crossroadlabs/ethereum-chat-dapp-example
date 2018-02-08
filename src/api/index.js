import UserRegistry from './UserRegistry'
import User from './User'
import Invitation from './Invitation'
import Swarm from './Swarm'
import Whisper from './WhisperSocket'
import Accounts from './Accounts'
import Context from '../utils/di'

export default (web3) => {
  let context = new Context()
  context.addSingletonObject('Web3', web3)

  context.addClass('Invitation', Invitation)
  context.addClass('User', User)
  context.addClass('Accounts', Accounts, true)
  context.addClass('UserRegistry', UserRegistry, true)
  context.addClass('Swarm', Swarm, true)
  context.addClass('Whisper', Whisper)

  return context.storage
}