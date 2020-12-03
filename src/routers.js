const Router = require('koa-router')
const Node = require('./controller/node')

const node = new Node()

const nodeR = new Router()
nodeR
  .post('/nodes', node.find)
  .post('/node/id', node.findById)
  .post('/nodes/type', node.findNodeTypeList)
  .post('/node/q/property', node.findPropertie2Node)
  .post('/node', node.create)
  .post('/node/list', node.creates)
  .put('/node', node.update)
  .delete('/node', node.delete)
  .delete('/node/id', node.deleteById)
  .delete('/node/list', node.deletes)
  .delete('/node/properties', node.deleteProperties)
  .delete('/node/id/properties', node.deletePropertiesById)
  .post('/relate', node.relate)
  .post('/relate/Id', node.relateById)
  .put('/relation', node.updateRelation)
  .put('/relation/id', node.updateRelationById)
  .put('/relation/2/all', node.updateRelation2All)
  .post('/relate/node', node.findRelate)
  .post('/related/node', node.findRelated)
  .post('/relation/id', node.findRelateById)
  .delete('/relation/node/2/node', node.deleteRelationB2Node)
  .delete('/relation', node.deleteRelation)
  .get('/keys', node.findKeysAndValues)

module.exports = {
  nodeR,
}
