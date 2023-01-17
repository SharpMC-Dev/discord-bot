const { Schema, model } = require('mongoose');

const data = new Schema({
  id: String,
  ticketMessageId: String,
  verifyMessageId: String,
});

module.exports = new model('guild', data);
