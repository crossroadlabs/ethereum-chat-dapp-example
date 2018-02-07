import UserRegistry from './UserRegistry'
import User from './User'
import Invitation from './Invitation'
import Swarm from './Swarm'
import Whisper from './WhisperSocket'

export default (web3) => {
  let InvitationBootstrapped = Invitation.bootstrap(web3)
  let UserBootstrapped = User.bootstrap(web3, InvitationBootstrapped)
  return {
    Registry: UserRegistry.bootstrap(web3, UserBootstrapped),
    User: UserBootstrapped,
    Invitation: InvitationBootstrapped,
    Swarm: Swarm.bootstrap(web3),
    Whisper: Whisper.bootstrap(web3)
  }
}