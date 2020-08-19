module.exports = function () {
  return async function (ctx, next) {
    try {
      console.log(ctx.method, ctx.header.host + ctx.url)
      if (ctx.method === 'POST' || ctx.method === 'DELETE') {
        console.log(ctx.request.body)
      }
      if (ctx.method === 'GET') {
        console.log(ctx.params)
      }
      await next()
    } catch (error) {
      console.log('系统出现错误: ')
      console.log(error)
      const data = {
        code: 500,
        message: error,
      }
      ctx.body = data
    }
  }
}
