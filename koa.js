const Koa = require('koa')
const bodyParser = require('koa-bodyparser')
const router = require('./src/routers')

const loggerAsync = require('./src/middleware/logger-async')

const app = new Koa()

app.use(bodyParser())
app.use(loggerAsync())

app.use(router.nodeR.routes(), router.nodeR.allowedMethods())

app.listen(3000)
console.log('the server is starting at port 3000')