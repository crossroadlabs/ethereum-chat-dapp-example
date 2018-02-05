import contract from 'truffle-contract'
import InvitationContract from '../../build/contracts/Invitation.json'
import getWeb3 from './getWeb3'

const invitationContract = contract(InvitationContract)

class Invitation {
  constructor(invitationId, fromMe) {
    this.id = invitationId
    this._fromMe = fromMe
    this._invitationContract = invitationContract.at(invitationId)
    this._user = null
  }

  getUser() {
    if (this._user) return this._user
    return this._user = this._invitationContract.then((invitation) => this._fromMe ? invitation.invitee() : invitation.inviter())
  }

  accept() {
    return this._invitationContract.then((invitation) => invitation.accept())
  }

  reject() {
    return this._invitationContract.then((invitation) => invitation.reject())
  }
}

export default (invitationId, fromMe) => {
  return getWeb3().then((result) => {
    if (invitationContract.getProvider() !== result.web3.currentProvider) {
      invitationContract.setProvider(result.web3.currentProvider);
    }
    return new Invitation(invitationId, fromMe)
  })
}