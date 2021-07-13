const mongoose = require('../connectSQL')

const Schema = mongoose.Schema

const topicSchema = new Schema({
    title: {
        type: String, // 标题
        required: true
    },
    content: {
        type: String, // 内容
        required: true
    },
    plate: {
        type: Number, // 选择板块  0：分享，1：问答，2：招聘，3：客户端测试
        required: true
    },
    user_id: {
        type: String, // 发布者的id
        required: true
    },
    // replier_id: {
    //     type: String, // 回复者的id
    //     default:null
    // },
    // reply_content:{ // 回复内容
    //     type:String,
    //     default:null
    // },
    create_time: {
        type: Date, // 创建时间
        default: Date.now
    },
    last_modified_time: {
        type: Date, // 最后修改时间
        default: Date.now
    },

})

module.exports = mongoose.model('Topic', topicSchema)