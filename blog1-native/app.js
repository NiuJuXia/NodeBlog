const handleBlogRouter = require('./src/router/blog')
const handleUserRouter = require('./src/router/user')
const querystring = require('querystring')
const { get, set } = require('./src/db/redis')
const { access } = require('./src/utils/log')

// session 数据
// const SESSION_DATA = {}

// 用于处理 post data
const getPostData = (req) => {
    console.log(Buffer.from("Hello Node"));
    
    const promise = new Promise((resolve, reject) => {
        if(req.method !== 'POST') {
            resolve({})
            return
        }
        if(req.headers['content-type'] !== 'application/json') {
            resolve({})
            return
        }
        let  postData = ''
        req.on('data', chunk => {
            postData += chunk.toString()
        })
        req.on('end', () => {
            if(!postData){
                resolve({})
                return
            }else{
                resolve(
                    JSON.parse(postData)
                )
            }
        })
    })
    return promise
}

const serverHandle = (req, res) => {
  // 记录 access log
  access(`${req.method} -- ${req.url} -- ${req.headers['user-agent']} -- ${Date.now()}`)

  // 设置返回格式 JSON
  res.setHeader('Content-type', 'application/json')
  
  // 解析query
  req.query = querystring.parse(req.url.split('?')[1])

  // 解析cookie
  req.cookie = {}
  const cookieStr = req.headers.cookie || ''
  console.log(req.headers.cookie) 
  cookieStr.split(';').forEach(item => {
      if(!item) {
          return
      }
      const arr = item.split('=')
      const key = arr[0].trim()
      const val = arr[1]
      req.cookie[key] = val
  })

// 解析session
//   let needSetCookie = false
//   let userId = req.cookie.userid
//   if(userId) {
//       if(!SESSION_DATA[userId]) {
//           SESSION_DATA[userId] = {}
//       }
//   }else{
//       needSetCookie = true
//       userId = `${Date.now()}_${Math.random()}`
//       SESSION_DATA[userId] = {}
//   }
//   req.session = SESSION_DATA[userId]

// 解析session 使用redis
  let needSetCookie = false
  let userId = req.cookie.userid
  if(!userId) {
      needSetCookie = true
      userId = `${Date.now()}_${Math.random()}`
      // 初始化 redis 中的 session 值
      set(userId, {})
  }
  // 获取 session
  req.sessionId = userId
  get(req.sessionId).then(sessionData => {
      if(sessionData == null) {
          // 初始化 redis 中的session值
          set(req.sessionId, {})
          // 设置 session
          req.session = {}
          console.log('不可能打印')
      }else{
          req.session = sessionData
      }
      console.log('req.session', req.session)
      return getPostData(req)
      // 处理postData
  }).then(postData => {
      req.body = postData
      
      // 处理blog路由

        const blogResult = handleBlogRouter(req, res)
        if(blogResult) {
            blogResult.then(blogData => {
                if(needSetCookie) {
                    res.setHeader('Set-Cookie', `userid=${userId}; path=/; httpOnly`)
                }
                res.end(
                    JSON.stringify(blogData)
                )
            })
            return
        }

     // 处理user路由
        const userData = handleUserRouter(req, res)
        if(userData) {
            userData.then(userData => {
                if(needSetCookie) {
                    res.setHeader('Set-Cookie', `userid=${userId}; path=/; httpOnly`)
                }
                res.end(
                    JSON.stringify(userData)
                )
            })
            return
        }
    // 404
        res.writeHead(404, {'Content-type': 'text/plain'})
        res.write('404 Not Found')
        res.end()
      
  })
  
}

module.exports = serverHandle

//process.env.NODE_ENV