const { User } = require('./models');
const bcrpyt = require('bcrypt');
const express = require('express');
const session = require('express-session');
const mongoStore = require('connect-mongo')(session);
const jwt = require('jsonwebtoken');
const SECERT_KEY = 'secretKey';
const app = express();
app.use(express.json());
app.use(require('cors')());
app.use(session({
    secret: SECERT_KEY,
    store: new mongoStore({
        url: 'mongodb://localhost:27017/againstViolence',
        collection: 'sessions'
    })
}))
const auth = async (req, res, next) => {
    const raw = String(req.headers.authorization).split(' ').pop();
    const { id } = jwt.verify(raw, SECERT_KEY);
    req.user = await User.findById(id);
    next();
}

app.get('/api/users', async (req, res) => {
    const users = await User.find();
    res.send(users);
})

app.post('/api/register', async (req, res) => {
    const user = await User.findOne({
        username: req.body.username
    })
    if (user) {
        return res.status(422).send({
            message: "用户已存在"
        })
    } else {
        const user = await User.create({
            username: req.body.username,
            password: req.body.password,
        })
        if (user._id && user.username) {
            return res.status(200).send({
                message: "注册成功",
                username: user.username
            })
        } else {
            return res.status(500).send({
                message: "服务器内部错误，注册失败"
            })
        }
    }



})

app.post('/api/login', async (req, res) => {
    const user = await User.findOne({
        username: req.body.username
    })
    if (!user) {
        return res.status(422).send({
            message: "用户名不存在"
        })
    }
    const isValidPassword = bcrpyt.compareSync(
        req.body.password,
        user.password
    )
    if (!isValidPassword) {
        return res.status(422).send({
            message: "密码错误"
        })
    }
    const token = jwt.sign({ id: String(user._id) }, SECERT_KEY) //之后存env里
    req.session.user = {
        username: user.username,
        uid: user._id
    }
    return res.status(200).send({
        message: "登录成功",
        username: user.username,
        token
    })
})

app.get('/api/logout', async (req, res) => {
    if (!req.session.user) {
        return res.status(401).send({
            message: "用户未登录"
        })
    }
    const username = req.session.user.username;
    delete req.session.user
    console.log(req.session);
    return res.status(200).send({
        message: "注销成功",
        username
    })
})

// 后续接口
app.get('/api/profile', auth, async (req, res) => {
    res.send(req.user.username);
    // const profile = Profile.find().where({
    //     user: req.user.username
    // })
})

app.listen(4000, '0.0.0.0', () => {
    console.log(`app started in port ${4000}`);
})