// import Neode from 'neode'
class Neo4j {
  constructor() {
    const Neode = require('neode')
    const instance = new Neode('bolt://localhost:7687', 'neo4j', '0000')
    instance.withDirectory(__dirname+'/models')

    this.instance = instance
  }

  async createModel(modelName = 'Person', value = {}) {
    const res = await this.instance.create(modelName, value)
    return res
  }

  async getModel(modelName = 'Person', value = null) {
    let res = null
    if (value === null) {
      res = await this.instance.all(modelName)
    } else {
      res = await this.instance.all(modelName, value)
    }
    return res
  }

  async relateTo(model1 = { name: 'Person', value: { name: '' } }, relation = { name: 'BORN_IN', value: { since: 1996 } }, model2 = { name: 'Person', value: { name: '' } }) {
    const m1 = await this.instance.first(model1.name, model1.value)
    const m2 = await this.instance.first(model2.name, model2.value)
    
    console.log(m1)

    const res = m1.relateTo(m2, relation.name, relation.value)

    return res
  }
}

module.exports = Neo4j

// instance.cypher('MATCH (p:Person {name: $name}) RETURN p', {name: "Todd"})
//     .then(res => {
//       console.log(res)
//     })

// instance.cypher('MATCH (a:Person)-[:BORN_IN]->(b:Location {city:$city}) RETURN a,b', {city: 'Boston'})
//     .then(res => {
//       console.log(res)
//     })


