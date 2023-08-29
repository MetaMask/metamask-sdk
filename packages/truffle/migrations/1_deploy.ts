const Simple = artifacts.require('Simple')

const migration: Truffle.Migration = function (deployer, network, accounts) {
  deployer.deploy(Simple)
}

module.exports = migration

// because of https://stackoverflow.com/questions/40900791/cannot-redeclare-block-scoped-variable-in-unrelated-files
export {}
