const { Schema, model } = require('mongoose');

const data = new Schema({
  id: String,
  userId: String,
  staffId: String,
});

module.exports = new model('ticket', data);
