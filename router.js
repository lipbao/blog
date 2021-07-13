const express = require('express')
const User = require('./models/user')
const Test = require("./models/test")

const md5 = require('blueimp-md5')
const formidable = require('formidable')
const multiparty = require('multiparty')

const router = express.Router()

router.get('/test', (req, res) => {
    res.render('test.html')
})

router.post('/test', (req, res, next) => {
    var form = new multiparty.Form()

    form.parse(req, (err, fields, files) => {
        // console.log(fields)
        const avatar = { avatar: fields['avatar'][0] }

        console.log(avatar)
        var test = new Test(avatar)

        console.log(test)
        test.save()
            .then(results => {
                console.log(results)
            })
            .catch(err => {
                return next(err)
            })
    })
})

router.get('/', function(req, res) {
    // console.log(req.session.user)
    // res.render('settings/profile.html', {
    res.render('index.html', {
        user: req.session.user
    })
})

router.get('/login', function(req, res) {
    res.render('login.html')
})

router.post('/login', function(req, res, next) {
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

router.get('/register', function(req, res, next) {
    res.render('register.html')
})

router.post('/register', async function(req, res, next) {
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
        user: req.session.user,
        profileoradmin: 0
    })
})

router.post('/settings/profile', async(req, res, next) => {
    const body = req.body
        // console.log(body)
    const sessionUserId = req.session.user._id
    try {

        const user = await User.findByIdAndUpdate(sessionUserId, body)
            // console.log(user)
            // const user = await User.findById(sessionUserId)
        req.session.user = user
        return res.status(200).json({
            err_code: 0,
            message: 'Ok'
        })
    } catch (error) {
        return next(error)
    }
})

router.post('/settings/profile/upload', async(req, res, next) => {
    var form = new multiparty.Form()
    const sessionUserId = req.session.user._id

    form.parse(req, async(err, fields, files) => {
        // console.log(fields) // 保存的是data:img编码
        // console.log(files) // 保存的是图片的文件
        const avatar = { avatar: fields['avatar'][0] }
        try {

            const user = await User.findByIdAndUpdate(sessionUserId, avatar)
                // const user = await User.findById(sessionUserId)
            req.session.user = user
            return res.status(200).json({
                err_code: 0,
                message: 'Ok'
            })
        } catch (error) {
            return next(error)
        }
    })


})

router.get('/settings/admin/del', (req, res, next) => {
    const sessionUserID = req.session.user._id;

    User.findByIdAndRemove(sessionUserID)
        .then((result) => {
            // console.log(result)
            req.session.user = null
            return res.status(200).json({
                err_code: 0,
                message: "Ok"
            })
        }).catch(err => {
            return next(err)
        })
})
router.get('/settings/admin', (req, res, next) => {
    res.render('settings/admin.html', {
            user: req.session.user,
            profileoradmin: 1
        })
        // next()
})

router.post('/settings/admin', async(req, res, next) => {
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