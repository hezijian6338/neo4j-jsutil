const Neo4j = require('../neo4j')

class Model {
  constructor() {
    this.neo4j = new Neo4j()
  }

  async createModel(ctx) {
    const neo4j = new Neo4j()

    const { modelName, value } = ctx.request.body

    const res = await neo4j.createModel(modelName, value)

    const newModel = {}

    for (const fieldName of Reflect.ownKeys(value)) {
      const fieldValue = res.get(fieldName)
      if (fieldValue !== null) {
        Reflect.set(newModel, fieldName, fieldValue)
      }
    }

    ctx.body = newModel
  }

  async getModel(ctx) {
    console.log(this.neo4j)

    const neo4j = new Neo4j()

    const { modelName, value } = ctx.request.body

    const res = await neo4j.getModel(modelName, value)

    const node = require('../models/' + modelName + '.js')

    let models = []
    for (let model of res) {
      let m = {}
      for (const field of Reflect.ownKeys(node)) {
        const v = await model.get(field)
        if (v !== null) {
          Reflect.set(m, field, v)
        }
         
      }
      await models.push(m)
    }

    ctx.body = models
  }

  async relateTo(ctx) {
    const { model1, relation, model2 } = ctx.request.body

    const neo4j = new Neo4j()

    const rel = await neo4j.relateTo(model1, relation, model2)

    return `${rel.from().get('name')} has known ${rel.to().get('name')} since ${rel.get('since')}`
  }
}

module.exports = Model