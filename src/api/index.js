import UserRegistry from './UserRegistry'
import User from './User'
import Invitation from './Invitation'
import Swarm from './Swarm'
import Whisper from './WhisperSocket'
import Accounts from './Accounts'

export default (web3) => {
  let InvitationBootstrapped = Invitation.bootstrap(web3)
  let UserBootstrapped = User.bootstrap(web3, InvitationBootstrapped)
  let UserRegistryBootstrapped = UserRegistry.bootstrap(web3, UserBootstrapped)
  return {
    Registry: UserRegistryBootstrapped,
    User: UserBootstrapped,
    Invitation: InvitationBootstrapped,
    Swarm: Swarm.bootstrap(web3),
    Whisper: Whisper.bootstrap(web3),
    Accounts: Accounts.bootstrap(web3, UserRegistryBootstrapped.instance())
  }
}