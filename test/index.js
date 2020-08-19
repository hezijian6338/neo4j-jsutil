class Tester {
  constructor() {
    const Neode = require('neode')
    const instance = new Neode('bolt://localhost:7687', 'neo4j', '0000')
    instance.withDirectory(__dirname + '/models')
    this.instance = instance
  }

  async relateTo(model1, relation, model2) {
    const m1 = await this.instance.first(model1.name, model1.value)
    const m2 = await this.instance.first(model2.name, model2.value)

    console.log(m1)

    const rel = m2.relateTo(m1, relation.name, relation.value)
    
    console.log(`${rel.from().get('name')} has known ${rel.to().get('name')} since ${rel.get('since')}`)
  }
}


const model1 = {
  name: 'Person',
  value: {
    name: 'Adam'
  }
}

const model2 = {
  name: 'Person',
  value: {
    name: 'Joe'
  }
}

const relation = {
  name: 'FRIENDS',
  value: {
    
  }
}

const test = new Tester()
test.relateTo(model1, relation, model2)


