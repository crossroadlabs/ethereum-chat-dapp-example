import UserRegistry from './UserRegistry'
import User from './User'
import Invitation from './Invitation'
import Swarm from './Swarm'
import Whisper from './WhisperSocket'
import Accounts from './Accounts'
import Context from '../utils/di'

export default (web3, swarm_api_url = 'http://swarm-gateways.net') => {
  let context = new Context()
  context.addConstant('GAS',  3141592)
  context.addConstant('SWARM_API_URL', swarm_api_url)
  
  context.addSingletonObject('Web3', web3)

  context.addClass('Invitation', Invitation)
  context.addClass('User', User)
  context.addClass('Accounts', Accounts, true)
  context.addClass('UserRegistry', UserRegistry, true)
  context.addClass('Swarm', Swarm, true)
  context.addClass('Whisper', Whisper)

  return context.storage
}