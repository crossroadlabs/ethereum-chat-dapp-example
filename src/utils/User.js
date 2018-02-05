import contract from 'truffle-contract'
import UserContract from '../../build/contracts/User.json'
import getWeb3 from './getWeb3'
import Invitation from './Invitation'

const userContract = contract(UserContract)

class User {
  constructor (userId) {
    this._userContract = userContract.at(userId)
    this.id = userId
    this._userContract.then((user) => {
      user.UserProfileUpdated().watch((err, response) => {
        this._profile = null
      })
      user.WhisperInfoUpdated().watch((err, response) => {
        this._pubKey = null
        this._whisperInfo = null
        if (this.whisperInfoUpdated) this.whisperInfoUpdated()
      })
    })
    this._sentInvitations = null
    this._inboxInvitations = null
    this.whisperInfoUpdated = null
    this._pubKey = null
    this._profile = null
    this._whisperInfo = null
    this._contacts = null
  }

  getWhisperInfo() {
    if (this._whisperInfo) return this._whisperInfo
    return this._whisperInfo = this._userContract.then((user) => user.getWhisperInfo())
  }

  setWhisperInfo(id, pubKey) {
    return this._userContract.then((user) => user.setWhisperInfo(id, pubKey))
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
      .then((invitations) => invitations.map((i) => Invitation(i, true)))
  }

  getInboxInvitations() {
    if (this._inboxInvitations) return this._inboxInvitations
    return this._inboxInvitations = this._userContract
      .then((user) => user.getInboxInvitations())
      .then((invitations) => invitations.map((i) => Invitation(i, false)))
  }

  getContacts() {
    if (this._contacts) return this._contacts
    return this._contacts = this._userContract
      .then((user) => user.getContacts())
      .then((contacts) => contacts.map((c) => new User(c)))
  }
}

export default (userId) => {
  return getWeb3().then((result) => {
    if (userContract.getProvider() !== result.web3.currentProvider) {
      userContract.setProvider(result.web3.currentProvider)
    }
    return new User(userId)
  })
}