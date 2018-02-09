module.exports = {
  // See <http://truffleframework.com/docs/advanced/configuration>
  // to customize your Truffle configuration!
  networks: {
    "rinkeby": {
      network_id: 4,
      host: "127.0.0.1",
      port: 8546
    },
    "development": {
      host: "localhost",
      port: 9545,
      network_id: "*" // Match any network id
     }
  },
  rpc: {
    host: "127.0.0.1",
    port: 8545
  }
};
