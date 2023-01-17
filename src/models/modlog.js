const { Schema, model } = require('mongoose');

const data = new Schema({
  userId: String,
  executorId: String,
  action: String,
  reason: String,
  timestamp: {
    required: true,
    type: Date,
    default: new Date(),
  },
});

module.exports = new model('modlog', data);
