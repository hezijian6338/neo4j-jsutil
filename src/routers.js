const Router = require('koa-router')
const Node = require('./controller/node')

const node = new Node()

const nodeR = new Router()
nodeR
  .post('/nodes', node.find)
  .post('/node', node.create)
  .post('/node/list', node.creates)
  .put('/node', node.update)
  .delete('/node', node.delete)
  .post('/relate', node.relate)
  .post('/relate/node', node.findRelate)
  .post('/related/node', node.findRelated)
  .delete('/relation', node.deleteRelation)

module.exports = {
  nodeR,
}
