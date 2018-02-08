import contract from 'truffle-contract'
import InvitationContract from '../../build/contracts/Invitation.json'

class Invitation {
  static $inject = ['User', '_InvitationContract()']

  constructor(User, Contract, invitationId, fromMe) {
    this.id = invitationId
    this.fromMe = fromMe
    this._invitationContract = Contract.at(invitationId)
    this._User = User
    this._user = null
  }

  getUser() {
    if (this._user) return this._user
    return this._user = this._invitationContract
      .then((invitation) => this.fromMe ? invitation.invitee() : invitation.inviter())
      .then((userId) => new this._User(userId))
  }

  accept() {
    return this._invitationContract.then((invitation) => invitation.accept())
  }

  reject() {
    return this._invitationContract.then((invitation) => invitation.reject())
  }

  static injected(context) {
    const invitationContract = contract(InvitationContract)
    invitationContract.setProvider(this.context.injected('Web3()').currentProvider)
    this.context.addSingletonObject('_InvitationContract', invitationContract)
  }
}

export default Invitation