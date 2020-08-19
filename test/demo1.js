class Demo1 {
  constructor() {
    this.Neo4j2Offical = require('../src/utils/neo4j2offical')
  }

  async test() {
    const neo4j = new this.Neo4j2Offical()

    const node = await neo4j.findRelate('Person', { name:'Joe' }, 'FRIENDS', {})
    neo4j.close()
    
    console.log(node)
  }

  async test1() {
    const neo4j = new this.Neo4j2Offical()

    const node = await neo4j.create('Person', { name:'cwh' })
    neo4j.close()
    
    console.log(node)
  }

  async test2() {
    const neo4j = new this.Neo4j2Offical()

    const node = await neo4j.delete('Person', { name:'cwh' })

    neo4j.close()
    
    console.log(node)
  }

  async test3() {
    const neo4j = new this.Neo4j2Offical()

    const Liz = await neo4j.find('Person', { name:'Liz' })
    const Mike = await neo4j.find('Person', { name:'Mike' })

    console.log(Liz)
    console.log(Mike.properties.age.low)

    neo4j.close()
  }
}

const demo1 = new Demo1()
// demo1.test1()
// demo1.test2()
demo1.test3()


