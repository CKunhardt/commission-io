# Commission.io

## About

Commission.io is an open-source demonstration project, designed to facilitate commissions for working artists. It is based on the Ethereum blockchain, and is primarily a demonstration of basic DApp principles. Due to security concerns, it is currently non-functional, although many of the basic concepts are in place.

## Usage

To run, you must have Node.js with ganache-cli installed globally. Run

`npm install`

`truffle migrate`

and then copy the deployed address to the contract-config.js file. Server can be started with

`node server.js`

## Future Features

Contract is currently kept very lightweight to avoid gas charges. In the future, it might be a good idea to demonstrate storage vs memory variables, mappings, and other concepts fundamental to Solidity programming. Eventually, funds will be held in escrow, until an artist's project is complete.
