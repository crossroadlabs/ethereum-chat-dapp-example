import React, { Component } from 'react'
import API from './api'
import getWeb3 from './utils/getWeb3'

import './css/oswald.css'
import './css/open-sans.css'
import './css/pure-min.css'
import './App.css'

class App extends Component {
  constructor(props) {
    super(props)

    this.state = {
      web3: null,
      userRegistry: null,
      user: null,
      chatSocket: null,
      userId: ""
    }
  }

  componentWillMount() {
    // Get network provider and web3 instance.
    // See utils/getWeb3 for more info.
    getWeb3.then((web3) => {

      let api = API(web3)
      this.setState(() => {
        return {
          web3: web3,
          userRegistry: api.UserRegistry.instance()
        }
      })

      api.Accounts.instance().getAccounts()
        .then((accounts) => { // Search for account with registered user. If not found - register with 0 account
          let found = accounts.find((value) => value.user != null)
          if (found) {
            api.Accounts.instance().currentAccount = found.id
            return found
          } else {
            let account = accounts[0]
            return api.UserRegistry.instance().register().then((user) => {
              account.user = user
              return account
            })
          }
        })
        .then((account) => {
          console.log("Account", account)
          let socket = new api.Whisper(account.user)
          this.setState(() => {
            return {
              user: account.user,
              chatSocket: socket,
              userId: account.user.id
            }
          })

          socket.on('error', (err) => {
            console.error('Socket error', err)
          })

          socket.on('message', (message) => {
            console.log('New message', message)
          })

          socket.on('started', () => {
            console.log('Socket started')
            socket.sendMessage(account.user, "TEST MESSAGE")
          })

          socket.start()
        })
        .catch((err) => {
          console.error("Error", err)
        })
    })
  }

  render() {
    return (
      <div className="App">
        <nav className="navbar pure-menu pure-menu-horizontal">
            <a href="#" className="pure-menu-heading pure-menu-link">Truffle Box</a>
        </nav>

        <main className="container">
          <div className="pure-g">
            <div className="pure-u-1-1">
              <h1>Good to Go!</h1>
              <p>Your Truffle Box is installed and ready.</p>
              <h2>Smart Contract Example</h2>
              <p>If your contracts compiled and migrated successfully, below will show a stored value of 5 (by default).</p>
              <p>Try changing the value stored on <strong>line 59</strong> of App.js.</p>
              <p>The stored value is: {this.state.userId}</p>
            </div>
          </div>
        </main>
      </div>
    );
  }
}

export default App
