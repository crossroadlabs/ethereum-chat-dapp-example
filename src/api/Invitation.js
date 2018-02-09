import contract from 'truffle-contract'
import InvitationContract from '../../build/contracts/Invitation.json'
import EventEmitter from 'events'

class Invitation extends EventEmitter {
  static $inject = ['User', '_InvitationContract()']

  constructor(User, Contract, invitationId, fromMe) {
    super()
    this.id = invitationId
    this.fromMe = fromMe
    this._invitationContract = Contract.at(invitationId)
    this._User = User
    this._user = null
    this.__setupEvents()
  }

  __setupEvents() {
    this._invitationContract.then((inv) => {
      inv.InvitationAccepted().watch((err, response) => {
        this.emit('accepted')
      })
      inv.InvitationRejected().watch((err, response) => {
        this.emit('rejected')
      })
    })
  }

  getUser() {
    if (this._user) return this._user
    return this._user = this._invitationContract
      .then((invitation) => this.fromMe ? invitation.invitee() : invitation.inviter())
      .then((userId) => new this._User(userId))
  }

  static injected(context) {
    const invitationContract = contract(InvitationContract)
    invitationContract.setProvider(this.context.injected('Web3()').currentProvider)
    let defaults = invitationContract.defaults()
    if (!defaults.gas) {
      defaults.gas = this.context.injected('GAS')
      invitationContract.defaults(defaults)
    }
    this.context.addSingletonObject('_InvitationContract', invitationContract)
  }
}

export default Invitation