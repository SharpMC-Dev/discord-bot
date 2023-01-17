const { Schema, model } = require('mongoose');

const data = new Schema({
  id: String,
  infractions: {
    type: Number,
    default: 0,
  },
  level: {
    type: Number,
    default: 1,
  },
  xp: {
    type: Number,
    default: 0,
  },
  ticket: {
    type: Boolean,
    default: false,
  },
  nextShout: String,
  nextGame: String,
});

module.exports = new model('user', data);
