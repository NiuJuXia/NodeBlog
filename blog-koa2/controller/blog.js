const { exec } = require('../db/mysql')

const getList = async (author, keyword) => {
    let sql = `select * from blogs where 1=1 `
    if(author) {
        sql += `and author='${author}' `
    }
    if(keyword) {
        sql += `and title like '%${keyword}%' `
    }
    sql += `order by createtime desc;`
    return await exec(sql)
}

const getDetail = async (id) => {
    const sql = `select * from blogs where id='${id}'`
    const getdetail = await exec(sql)
    return getdetail[0]
}

const newBlog = async (blogData = {}) => {
    //blogData是一个博客对象，包含title content 属性
    const {title, content, author} = blogData
    const createTime = Date.now()
    const sql = `
        insert into blogs (title, content, createtime, author)
        values ('${title}', '${content}', ${createTime}, '${author}')
    `
    const newblog = await exec(sql)
        return {
            id:newblog.insertId
        }
    
}

const updateBlog = async (id, blogData = {}) => {  
    const {title, content} = blogData
    const sql = `
      update blogs set title='${title}', content='${content}' where id=${id}
    `
    const updateblog = await exec(sql)
    if(updateblog.affectedRows > 0) {
        return true
    }
    return false
}

const delBlog = async (id, author) => {
    const sql = `delete from blogs where id='${id}' and author='${author}'`
    const delblog = await exec(sql)
    if(delblog.affectedRows > 0) {
        return true
    }
    return false
}

module.exports = {
    getList,
    getDetail,
    newBlog,
    updateBlog,
    delBlog
}