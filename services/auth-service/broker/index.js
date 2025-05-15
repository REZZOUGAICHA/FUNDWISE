 
const { initBroker } = require('../../../message-broker/src/lib/broker');

const consumer = require('./consumer');

async function startBroker() {
  await initBroker();
  consumer.listen(); // start consuming
}

module.exports = startBroker;
