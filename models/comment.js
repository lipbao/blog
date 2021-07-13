const mongoose = require('../connectSQL')

const Shema = mongoose.Schema

const commentShema = new Shema({})

module.exports = mongoose.model('Comment',commentShema)