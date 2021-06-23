const mongoose = require('mongoose')

// 连接数据库
mongoose.connect('mongodb://localhost/blog', { useFindAndModify: true, useNewUrlParser: true, useUnifiedTopology: true })

module.exports = mongoose