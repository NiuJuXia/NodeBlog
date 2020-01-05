const http = require('http')

// 组合中间件
function compose(middlewareLiat) {
    return function (ctx) {
        //中间件调用
        function dispatch(i) {
          const fn = middlewareLiat[i]
          try {
            return Promise.resolve(
                fn(ctx,dispatch.bind(null, i+1))
            )
          }catch(err){
             return Promise.reject(err)
          }
        }
        return dispatch(0)
    }
}

class LikeKoa2 {
    constructor() {
        this.middlewareLiat = []
    }

    use(fn) {
        this.middlewareList.push(fn)
        return this
    }

    createContext(req, res) {
        const ctx = {
            req,
            res
        }
        return ctx
    }

    callback() {
        return (req, res) => {
            const fn = compose(this.middlewareLiat)
            const ctx = this.createContext(req, res)
            return fn(ctx)

        }
    }

    listen(...args) {
        const server = http.createServer(this.callback())
        server.listen(...args)
    }
}

module.exports = LikeKoa2