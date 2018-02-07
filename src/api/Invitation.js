import contract from 'truffle-contract'
import InvitationContract from '../../build/contracts/Invitation.json'

class Invitation {
  constructor(invitationId, fromMe, invitationContract) {
    this.id = invitationId
    this.fromMe = fromMe
    this._invitationContract = invitationContract.at(invitationId)
    this._user = null
  }

  getUser() {
    if (this._user) return this._user
    return this._user = this._invitationContract.then((invitation) => this.fromMe ? invitation.invitee() : invitation.inviter())
  }

  accept() {
    return this._invitationContract.then((invitation) => invitation.accept())
  }

  reject() {
    return this._invitationContract.then((invitation) => invitation.reject())
  }
}

Invitation.bootstrap = function(web3) {
  const invitationContract = contract(InvitationContract)
  invitationContract.setProvider(web3.currentProvider)

  class InvitationBootstrapped extends this {
    constructor(invitationId, fromMe) {
      super(invitationId, fromMe, invitationContract)
    }
  }

  return InvitationBootstrapped
}

export default Invitation