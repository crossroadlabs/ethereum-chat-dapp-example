import contract from 'truffle-contract'
import UserContract from '../../build/contracts/User.json'
import EventEmitter from 'events'

class User extends EventEmitter {
  static $inject = ['Invitation', '_UserContract()']

  constructor (Invitation, UserContract, userId) {
    super()

    this._userContract = UserContract.at(userId)
    this._Invitation = Invitation
    this.id = userId
    this._userContract.then((user) => {
      user.UserProfileUpdated().watch((err, response) => {
        this._profile = null
        this.emit("profileUpdated")
      })
      user.WhisperInfoUpdated().watch((err, response) => {
        this._pubKey = null
        this._whisperInfo = null
        this.emit("whisperInfoUpdated")
      })
    })
    this._sentInvitations = null
    this._inboxInvitations = null
    this._pubKey = null
    this._profile = null
    this._whisperInfo = null
    this._contacts = null
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
  }

  setProfile(name, avatar) {
    return this._userContract.then((user) => user.setProfileInfo(name, avatar))
  }

  invite(user) {
    return this._userContract
      .then((user) => user.sendInvitation(user.id))
      .then((result) => {
        this._sentInvitations = null
        return result
      })
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
    this.context.addSingletonObject('_UserContract', userContract)
  }
}

export default User