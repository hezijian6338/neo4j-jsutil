class test {
  constructor() {
    const { n2o } = require('../src/utils/neo4j2offical')
    this.n2o = n2o
    this.skill = require('./skill.json')
  }

  async test() {
    const entities = this.skill.entities
    const types = []
    for (let e of entities) {
      console.log('++++++++++++++++++++++++')
      // console.log(e.entity)
      const typeOfGarbage = {
        label: 'TypeOfGarbage',
        value: {
          name: e.entity,
        }
      }
      const typeOfGarbage2 = {
        relateNodeLabel: 'TypeOfGarbage',
        relateNodeValue: {
          name: e.entity,
        }
      }
      types.push(typeOfGarbage)
      console.log(typeOfGarbage)
      console.log('++++++++++++++++++++++++')
      const typeOfValues = []
      const values = e.values
      for (const value of values) {
        const garbage = {
          label: 'Garbage',
          value: {
            name: value.value,
          },
        }
        const garbage1 = {
          nodeLabel: 'Garbage',
          nodeValue: {
            name: value.value,
          },
        }
        typeOfValues.push(garbage)
        // console.log(garbage)
        this.relate(garbage1, typeOfGarbage2)
      }
      console.log('------------------------')
      // console.log(typeOfValues)
      // this.typeCreate(typeOfValues)
    }
    console.log(types)

    // typeCreate(types)

    // this.n2o.close()
  }

  async typeCreate(types) {
    console.log(types)

    const onlyProperties = true
    const oldApi = false
    const useMerge = true
    const result = await this.n2o.creates(
      types,
      onlyProperties,
      oldApi,
      useMerge
    )

    console.log(result)
  }

  async relate(node1, node2) {
    const onlyProperties = true
    const relation = {
      relationName: 'BELONG_TO',
      relationValue: {
        operate: 'direct'
      }
    }
    const result = await this.n2o.relate(node1.nodeLabel, node1.nodeValue, node2.relateNodeLabel, node2.relateNodeValue, relation.relationName, relation.relationValue, onlyProperties)
    
    console.log(result)
  }
}

const t = new test()

t.test()
