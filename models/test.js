const mongoose = require('../connectSQL')

const Schema = mongoose.Schema

const testSchema = new Schema({
    avatar: {
        type: String,
        default: 'public/img/avatar-default.png'
    }
})

module.exports = mongoose.model('Test', testSchema)