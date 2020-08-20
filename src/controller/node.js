const { n2o } = require('../utils/neo4j2offical')

class Node {
  constructor() {
    // console.log(n2o)

    this.n2o = n2o
  }

  async create(ctx) {
    const { label, value, onlyProperties, userMerge } = ctx.request.body

    try {
      const result = await n2o.create(label, value, onlyProperties, userMerge)

      ctx.body = result
    } catch (error) {
      ctx.throw(500, error)
    }
  }

  async creates(ctx) {
    const { list, onlyProperties, oldApi, userMerge } = ctx.request.body

    try {
      const result = await n2o.creates(list, onlyProperties, oldApi, userMerge)

      ctx.body = result
    } catch (error) {
      ctx.throw(500, error)
    }
  }

  async relate(ctx) {
    const {
      nodeLabel,
      nodeValue,
      relateNodeLabel,
      relateNodeValue,
      relationName,
      relationValue,
      onlyProperties,
    } = ctx.request.body

    const result = await n2o.relate(
      nodeLabel,
      nodeValue,
      relateNodeLabel,
      relateNodeValue,
      relationName,
      relationValue,
      onlyProperties
    )

    ctx.body = result
  }

  async find(ctx) {
    const { label, value, onlyProperties } = ctx.request.body

    try {
      const result = await n2o.find(label, value, onlyProperties)

      ctx.body = result
    } catch (error) {
      ctx.throw(500, error)
    }
  }

  async findRelate(ctx) {
    const {
      label,
      value,
      relationName,
      relationValue,
      onlyProperties,
    } = ctx.request.body

    const result = await n2o.findRelate(
      label,
      value,
      relationName,
      relationValue,
      onlyProperties
    )

    ctx.body = result
  }

  async findRelated(ctx) {
    const {
      label,
      value,
      relationName,
      relationValue,
      onlyProperties,
    } = ctx.request.body

    const result = await n2o.findRelated(
      label,
      value,
      relationName,
      relationValue,
      onlyProperties
    )

    ctx.body = result
  }

  async update(ctx) {
    const { label, value, update } = ctx.request.body

    const result = await n2o.update(label, value, update)

    ctx.body = result
  }

  async delete(ctx) {
    const { label, value } = ctx.request.body

    let result = await n2o.delete(label, value)

    if (result === undefined) {
      result = {}
    }

    ctx.body = result
  }

  async deletes(ctx) {
    const { list } = ctx.request.body

    const result = await n2o.deletes(list)

    // for (const r of result) {
    // }

    ctx.body = result
  }

  async deleteRelation(ctx) {
    const { relationName, relationValue } = ctx.request.body

    let result = await n2o.deleteRelation(relationName, relationValue)

    if (result === undefined) {
      result = {}
    }

    ctx.body = result
  }
}

module.exports = Node
