const { login } = require('../controller/user')
const { SuccessModel, ErrorModel } = require('../model/resModel')
const { set } = require('../db/redis')

const handleUserRouter = (req, res) => {
    const method = req.method // GET POST
    const url = req.url
    const path = url.split('?')[0]

    // 登录
    if(method === 'POST' && path === '/api/user/login'){
        const { username, password } = req.body
        const result = login(username, password)
        return result.then(data => {
            if(data.username) {
                req.session.username = data.username
                req.session.realname = data.realname
                // 同步到 redis
                set(req.sessionId, req.session)
                return new SuccessModel()
            } else {
                return new ErrorModel('登录失败')
            }
        })
    }

    // 登录验证的测试
    if(method === 'GET' && path === '/api/user/login-test'){
        console.log('进入测试')
        if(req.session) {
            return Promise.resolve(new SuccessModel({
                session: req.session
            }))
        }
        return  Promise.resolve(new ErrorModel('登录测试失败'))
    }
}

module.exports = handleUserRouter