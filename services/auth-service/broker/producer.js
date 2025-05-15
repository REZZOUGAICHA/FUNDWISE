const { publishMessage } = require('../../../message-broker/src/lib/broker');

function userRegistered(data) {
  publishMessage({ type: 'USER_REGISTERED', payload: data });
}

module.exports = {
  userRegistered,
};
