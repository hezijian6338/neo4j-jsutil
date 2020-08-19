const Router = require('koa-router')
const Node = require('./controller/node')

const node = new Node()

const nodeR = new Router()
nodeR.post('/nodes', node.find)
  .post('/node', node.create)
  .post('/relate', node.relate)
  .delete('/node', node.delete)

module.exports = {
  nodeR
}