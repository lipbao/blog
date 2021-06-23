const mongoose = require('../connectSQL')

const Schema = mongoose.Schema

const topicSchema = new Schema({
    email: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    create_time: {
        type: Date,
        default: Date.now
    },
    last_modified_time: {
        type: Date,
        default: Date.now
    },
    
})

module.exports = mongoose.model('Topic', topicSchema)