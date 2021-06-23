
const express = require('express')
const User = require('./models/user')
const md5 = require('blueimp-md5')
const formidable = require('formidable')

const router = express.Router()

router.get('/', function (req, res) {
    // console.log(req.session.user)
    // res.render('settings/profile.html', {
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
        // return res.status(500).json({
        //     err_code: 500,
        //     message: error.message
        // })

        return next(error)
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
        // console.log(user)

        console.log()

        res.status(200).json({
            err_code: 0,
            message: 'Ok'
        })
    } catch (error) {
        // console.log(error)
        // res.status(500).json({
        //     err_code: 500,
        //     message: 'Interval error'
        // })
        return next(error)
    }

})


router.get('/logout', (req, res) => {
    req.session.user = null

    // 重定向
    res.redirect('/login')
})


router.get('/topics/new', (req, res, next) => {
    // console.log(req.session.user)
    res.render('topic/new.html', {
        user: req.session.user
    })
})

router.get('/topics/123', (req, res, next) => {
    // console.log(req.session.user)
    res.render('topic/show.html', {
        user: req.session.user
    })
})

router.get('/settings/profile', (req, res, next) => {
    res.render('settings/profile.html', {
        user: req.session.user
    })
})

router.post('/settings/profile', async (req, res, next) => {
    const body = req.body
    const sessionUserId = req.session.user._id
    console.log(body)
    console.log(req)
    // console.log(typeof body.birthday)

    // body._id = sessionUserId

    // body.birthday = dateForm(body.birthday)
    // console.log(sessionUserId)
    // console.log('node 内部')
    // console.log(body)
    try {

        await User.findByIdAndUpdate(sessionUserId, body)
        const user = await User.findById(sessionUserId)

        // console.log('node 运行结束  ')
        req.session.user = user
        // res.render('setting/profile.html',{
        //     user:req.session.user
        // })
        // console.log(user.birthday)
        return res.status(200).json({
            err_code: 0,
            message: 'Ok'
        })
    } catch (error) {
        return next(error)
    }
})
router.get('/settings/admin', (req, res, next) => {
    res.render('settings/admin.html', {
        user: req.session.user
    })
    // next()
})

router.post('/settings/admin', async (req, res, next) => {
    var body = req.body
    var sessionUser = req.session.user
    // console.log(sessionUser)
    // console.log(sessionUser.id)
    // console.log(body.newPassword)
    try {

        if (md5(md5(body.password)) !== sessionUser.password) {
            return res.status(200).json({
                err_code: 1,
                message: '密码错误,请重新输入!'
            })
        }

        // console.log(sessionUser)
        // console.log(body.newPassword)
        await User.findByIdAndUpdate(sessionUser._id, { password: md5(md5(body.newPassword)) })

        return res.status(200).json({
            err_code: 0,
            message: 'Ok'
        })

        req.json.session.user = null


    } catch (error) {
        return next(error)
    }

})

module.exports = router

// new Date().getFullYear

function dateForm(time) {
    let year = time.getFullYear(),
        month = getTenNum(time.getMonth() + 1),
        day = getTenNum(time.getDate());

    return year + '/' + month + '/' + day
}

function getTenNum(num) {
    if (num < 10) {
        return '0' + num
    } else {
        return num
    }
}