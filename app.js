const express = require('express');
const path = require('path');
const router = require('./router')
const session = require('express-session')

const app = express();

app.use('/node_modules/', express.static(path.join(__dirname, './node_modules/')));
app.use('/public/', express.static(path.join(__dirname, './public/')));

app.engine('.html', require('express-art-template'))

app.set('views', path.join(__dirname, './views'))

app.use(express.urlencoded({ extended: false }))
app.use(express.json())


/**
 * 在 Express 这个框架中，默认不支持 Session 和 Cookie
 * 但是我们可以使用第三方中间件：express-session 来解决
 * 1. npm i express-session
 * 2. 配置（一定要在 app.use(router) 之前）
 * 3. 使用
 *    当把这个插件配置好之后，我们就可以通过 req.session 来访问和设置 Session 成员
 *    添加 Session 数据：req.session.foo = 'bar'
 *    访问 Session 数据：req.session.foo
 */
app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true
}))

app.use(router)



app.listen(3000, () => {
    console.log('app is running...')
})