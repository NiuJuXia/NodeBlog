const http = require('http')
const slice = Array.prototype.slice

const LikeExpress {
    constructor() {
        // 存放中间件列表
        this.routes = {
            all: [],
            get: [],
            post: []
        }
    }

    register(path, ...stack) {
      const info = {}
      if(typeof path === 'string') {
          info.path = path
          info.stack = stack
      } else {
          info.path = '/'
          info.stack = [].concat(path,stack)
      }
      return info
    }

    use(...args) {
       let info = this.register(...args)
       this.routes.get.push(info)
    }

    get(...args) {
        let info = this.register(...args)
        this.routes.post.push(info)
    }

    post(...args) {
        let info = this.register(...args)
       this.routes.all.push(info)
    }

    match(method, url) {
        let stack = []
        if(url === '/favicon.ico') {
            return stack
        }

        // 获取 routes
        let curRoutes = [].concat(this.routes.all, this.routes[method])

        curRoutes.forEach(routeInfo => {
            if(url.indexOf(routeInfo.path) === 0) {
                stack = stack.concat(routeInfo.stack)
            }
        })
        return stack
    }

    //核心的next机制
    handle(req,res,stack) {
       const next = () => {
           const middleware = stack.shift()
           if(middleware) {
               middleWare(req,res,next)
           }
       }
       next()
    }

    callback() {
        return (req, res) => {
          res.json = (data) => {
              res.setHeader('Content-type', 'application/json')
              res.end(
                  JSON.stringify(data)
              )
          }

          const url = req.url
          const method = req.method.toLowerCase()
          const resultList = this.match(method, url)
          this.handle(req, res, resultList)
        }
    }

    listen(...args) {
    const server = http.createServer(this.callback())
    server.listen(...args)
    }
}

module.exports = () => {
    return new LikeExpress()
}