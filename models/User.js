const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    username: { type: String, unique: true, required: true },
    chatId: { type: String, unique: true, required: true },
    wallet: { type: Number, required: true, default: 0 },
    income: [{
      sum: Number,
      forWhat: String,
    }],
    outcome: [{
      sum: Number,
      forWhat: String,
    }],
});

module.exports = mongoose.model('Users', userSchema);
