const router = require('koa-router')()
const { getList, getDetail, newBlog, updateBlog,
  delBlog } = require('../controller/blog')
const { SuccessModel, ErrorModel } = require('../model/resModel')
const  loginCheck  = require('../middleware/loginCheck')

router.prefix('/api/blog')

router.get('/list', async function (ctx, next) {
  let author = ctx.query.author || ''
  const keyword = ctx.query.keyword || ''
  if(ctx.query.isadmin) {
      // 管理员界面
      if(ctx.session.username == null) {
        ctx.body = new ErrorModel('未登录')
        return
      }
   author = ctx.session.username
  }
  const listData = await getList(author, keyword)
  ctx.body = new SuccessModel(listData)
  
});

router.get('/detail', async function(ctx, next) {
  const data = await getDetail(ctx.query.id)
  ctx.body = new SuccessModel(data)
});

router.post('/new',loginCheck, async function(ctx, next) {
 
  const author = ctx.session.username
  ctx.request.body.author = author
  const result = await newBlog(ctx.request.body)
  ctx.body = new SuccessModel(result)
})

router.post('/update',loginCheck, async function(ctx, next)  {
  const result = await updateBlog(ctx.query.id, ctx.request.body)
  if(result) {
    ctx.body = new SuccessModel()
} else {
    ctx.body = new ErrorModel('更新失败')
}
})

router.post('/del',loginCheck, async function(ctx, next)  {
  const author = ctx.session.username
        const result = await delBlog(req.query.id, author)
        if(result) {
          ctx.body = new SuccessModel()
      } else {
          ctx.body = new ErrorModel('更新失败')
      }
})

module.exports = router
