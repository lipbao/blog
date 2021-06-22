
const express = require('express')
const User = require('./models/user')
const md5 = require('blueimp-md5')

const router = express.Router()

router.get('/', function (req, res) {
    // console.log(req.session.user)
    res.render('index.html', {
        user: req.session.user
    })
})

router.get('/login', function (req, res) {
    res.render('login.html')
})

router.post('/login', function (req, res, next) {
    // 1. 获取表单数据
    // 2. 查询数据库用户名密码是否正确
    // 3. 发送响应数据
    var body = req.body

    User.findOne({
        email: body.email,
        password: md5(md5(body.password))
    }).then(result => {

        // console.log(result)
        if (!result) {
            return res.status(200).json({
                err_code: 1,
                message: 'email or pasword is invalid'
            })
        }

        // 用户存在，登陆成功，通过 Session 记录登陆状态
        req.session.user = result

        res.status(200).json({
            err_code: 0,
            message: 'Ok'
        })

    }).catch(error => {
        // console.log(error)
        return res.status(500).json({
            err_code: 500,
            message: error.message
        })
    })

    // User.findOne({
    //     email: body.email,
    //     password: md5(md5(body.password))
    // }, function (err, user) {
    //     if (err) {
    //         // return res.status(500).json({
    //         //   err_code: 500,
    //         //   message: err.message
    //         // })
    //         return next(err)
    //     }

    //     // 如果邮箱和密码匹配，则 user 是查询到的用户对象，否则就是 null
    //     if (!user) {
    //         return res.status(200).json({
    //             err_code: 1,
    //             message: 'Email or password is invalid.'
    //         })
    //     }

    //     // 用户存在，登陆成功，通过 Session 记录登陆状态
    //     req.session.user = user

    //     res.status(200).json({
    //         err_code: 0,
    //         message: 'OK'
    //     })
    // })
})

router.get('/register', function (req, res, next) {
    res.render('register.html')
})

router.post('/register', async function (req, res, next) {
    // 1. 获取表单提交的数据
    //    req.body
    // 2. 操作数据库
    //    判断改用户是否存在
    //    如果已存在，不允许注册
    //    如果不存在，注册新建用户
    // 3. 发送响应
    var body = req.body
    // User.findOne({
    //     $or: [
    //         {
    //             email: body.email
    //         },
    //         {
    //             nickname: body.nickname
    //         }
    //     ]
    // }).then(data => {

    //     if (data) {
    //         // 邮箱或者昵称已存在
    //         return res.status(200).json({
    //             err_code: 1,
    //             message: 'Email or nickname aleady exists.'
    //         })
    //         return res.send(`邮箱或者密码已存在，请重试`)
    //     }

    //     // 对密码进行 md5 重复加密
    //     body.password = md5(md5(body.password))

    //     var user = new User(body)

    //     user.save()
    //         .then(result => {

    //             // 注册成功，使用 Session 记录用户的登陆状态
    //             // req.session.user = user

    //             // Express 提供了一个响应方法：json
    //             // 该方法接收一个对象作为参数，它会自动帮你把对象转为字符串再发送给浏览器
    //             res.status(200).json({
    //                 err_code: 0,
    //                 message: 'OK'
    //             })

    //             // 服务端重定向只针对同步请求才有效，异步请求无效
    //             // res.redirect('/')
    //         })
    //         .catch(err => {
    //             return res.status(500).json({
    //                 err_code: 500,
    //                 message: '服务端错误'
    //             })
    //         })

    // }).catch(err => {
    //     return res.status(500).json({
    //         err_code: 500,
    //         message: '服务端错误'
    //     })
    // })


    try {
        if (await User.findOne({ email: body.email })) {
            return res.status(200).json({
                err_code: 1,
                message: '邮箱已存在'
            })
        }

        if (await User.findOne({ nickname: body.nickname })) {
            return res.status(200).json({
                err_code: 2,
                message: '昵称已存在'
            })
        }
        // console.log('ok')

        body.password = md5(md5(body.password))

        const user = await new User(body).save()

        // 注册成功，使用 Session 记录用户的登陆状态
        req.session.user = user

        res.status(200).json({
            err_code: 0,
            message: 'Ok'
        })
    } catch (error) {
        // console.log(error)
        res.status(500).json({
            err_code: 500,
            message: 'Interval error'
        })
    }

})


router.get('/logout',(req,res)=>{
    res.session.user = null
    
    // 重定向
    res.redirect('/login')
})

module.exports = router