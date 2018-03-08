import contract from 'truffle-contract'
import UserContract from '../../build/contracts/User.json'
import EventEmitter from 'events'

const NULL_ID = '0x0000000000000000000000000000000000000000'

class User extends EventEmitter {
  static $inject = ['Invitation', '_UserContract()']

  constructor (Invitation, UserContract, userId) {
    super()
    this._userContract = UserContract.at(userId)
    this._Invitation = Invitation
    this.id = userId
    this._sentInvitations = null
    this._inboxInvitations = null
    this._pubKey = null
    this._profile = null
    this._whisperInfo = null
    this._contacts = null
    this.__setupEvents()
  }

  __setupEvents() {
    this._userContract.then((user) => {
      user.UserProfileUpdated().watch((err, event) => {
        this._profile = null
        this.emit("profileUpdated")
      })
      user.WhisperInfoUpdated().watch((err, event) => {
        this._pubKey = null
        this._whisperInfo = null
        this.emit("whisperInfoUpdated")
      })
      user.ContactAdded().watch((err, event) => {
        this.emit('contactAdded', new this.constructor(event.args.contact))
      })
      user.ContactRemoved().watch((err, event) => {
        this.emit('contactRemoved', new this.constructor(event.args.contact))
      })
      user.OwnerChanged().watch((err, event) => {
        this.emit('ownerChanged', event.to)
      })
      user.InvitationReceived().watch((err, event) => {
        this.emit('invitationReceived', new this._Invitation(event.invitation, false))
      })
    })
  }

  getWhisperInfo() {
    if (this._whisperInfo) return this._whisperInfo
    return this._whisperInfo = this._userContract.then((user) => user.getWhisperInfo())
  }

  setWhisperInfo(pubKey, key) {
    return this._userContract.then((user) => user.setWhisperInfo(pubKey, key))
  }

  getPubKey() {
    if (this._pubKey) return this._pubKey
    return this._pubKey = this._userContract.then((user) => user.getWhisperPubKey())
  }

  getProfile() {
    if (this._profile) return this._profile
    return this._profile = this._userContract.then((user) => user.getProfileInfo())
      .then(([name, avatar]) => [name, avatar.slice(2)])
  }

  setProfile(name, avatar) {
    return this._userContract.then((user) => user.setProfileInfo(name, (avatar && avatar !== '') ? '0x'+avatar : avatar))
  }

  invite(user) {
    return this._userContract
      .then((contract) => contract.sendInvitation(user.id).then((result) => !result.logs[0] ? null: result.logs[0].args.invitation))
      .then((invitationId) => {
        if (!invitationId || invitationId === NULL_ID) throw new Error("Invitation failed")
        this._sentInvitations = null
        return new this._Invitation(invitationId, true)
      })
  }

  acceptInvitation(invitation) {
    return this._userContract
      .then((user) => user.acceptInvitation(invitation.id))
      .then(() => undefined)
  }

  rejectInvitation(invitation) {
    return this._userContract
      .then((user) => user.rejectInvitation(invitation.id))
      .then(() => undefined)
  }

  getSentInvitations() {
    if (this._sentInvitations) return this._sentInvitations
    return this._sentInvitations = this._userContract
      .then((user) => user.getSentInvitations())
      .then((invitations) => invitations.map((i) => new this._Invitation(i, true)))
  }

  getInboxInvitations() {
    if (this._inboxInvitations) return this._inboxInvitations
    return this._inboxInvitations = this._userContract
      .then((user) => user.getInboxInvitations())
      .then((invitations) => invitations.map((i) => new this._Invitation(i, false)))
  }

  getContacts() {
    if (this._contacts) return this._contacts
    return this._contacts = this._userContract
      .then((user) => user.getContacts())
      .then((contacts) => contacts.map((c) => new this.constructor(c)))
  }

  static injected() {
    const userContract = contract(UserContract)
    userContract.setProvider(this.context.injected('Web3()').currentProvider)
    let defaults = userContract.defaults()
    if (!defaults.gas) {
      defaults.gas = this.context.injected('GAS')
      userContract.defaults(defaults)
    }
    this.context.addSingletonObject('_UserContract', userContract)
  }
}

export default User