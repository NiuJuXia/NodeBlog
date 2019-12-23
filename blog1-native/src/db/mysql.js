const{ MYSQL_CONF } = require('../conf/db')
const mysql = require('mysql')

// 创建连接对象
const con = mysql.createConnection(MYSQL_CONF)

// 开始连接
con.connect()

// 统一执行sql的函数
function exec(sql) {
    let promise = new Promise((resolve,reject) => {
        con.query(sql, (err, result) => {
            if(err){
                console.log('qwer');
                reject(err)
                return  
            }
            resolve(result)
        })
    })
    return promise
}

module.exports = {
    exec
}