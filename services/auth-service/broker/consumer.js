const { consumeMessages } = require('../../../message-broker/src/lib/broker');

function listen() {
  consumeMessages((msg) => {
    if (msg.type === 'USER_REGISTERED') {
      console.log('Auth service received USER_REGISTERED:', msg);
      // handle accordingly
    }
  });
}

module.exports = {
  listen,
};
