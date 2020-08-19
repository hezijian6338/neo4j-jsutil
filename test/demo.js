class Demo {
  constructor() {
    const neo4j = require("neo4j-driver");

    const uri = "bolt://localhost:7687";
    const user = "neo4j";
    const password = "0000";

    this.driver = neo4j.driver(uri, neo4j.auth.basic(user, password));
    this.session = this.driver.session();
  }

  async test() {
    const session = this.driver.session()
    const personName = "hezijian";

    try {
      // await session.writeTransaction(tx =>
      //   tx.run('CREATE (a:Person {name: $name})', { name: personName })
      // )
    
      const result = await session.readTransaction(tx =>
        tx.run('MATCH (a:Person {name: $name}) RETURN a', {
          name: personName
        })
        
      )

      

      console.log(result)
    
      const singleRecord = result.records[0]
      const createdNodeId = singleRecord.get(0)

      console.log('Matched created node with name: ' + createdNodeId.properties.name)
    
      // console.log('Matched created node with id: ' + createdNodeId)
    } finally {
      await session.close()
    }

    await this.driver.close();
  }

  async test1() {
    const personName = "Sally";

    try {
      const result = await this.session.run(
        "match (p:Person {name: $name})-[:FRIENDS]->(n) return p,n",
        { name: personName }
      );
      
      const singleRecord = result.records[0];
      console.log(singleRecord.get(0))
      console.log(singleRecord.get(1))
      const node = singleRecord.get(0);

      console.log(node.properties.name);

    } finally {
      await this.session.close();
    }

    // on application exit:
    await this.driver.close();
  }

  async test2() {

    const nodeLabel = "Person";
    const nodeValue = {
      name: 'Joe'
    }

    const relateNodeLabel = "Person";
    const relateNodeValue = {
      name: 'Adam'
    }

    const relationName = "FRIENDS";
    const relationValue = {
    }

    const q = `match (a:${nodeLabel} ${JSON.stringify(nodeValue).replace(/"([^(")"]+)":/g,"$1:")}), (b:${relateNodeLabel} ${JSON.stringify(relateNodeValue).replace(/"([^(")"]+)":/g,"$1:")}) merge (a)-[r:${relationName} ${JSON.stringify(relationValue).replace(/"([^(")"]+)":/g,"$1:")}]->(b) return a,r,b`

    try {
      const result = await this.session.run(
        q
      );
      
      const singleRecord = result.records[0];
      console.log(singleRecord.get(0))
      console.log(singleRecord.get(1))
      console.log(singleRecord.get(2))
      const node = singleRecord.get(0);

      console.log(node.properties.name);

    } finally {
      await this.session.close();
    }

    // on application exit:
    await this.driver.close();
  }

}

const demo = new Demo()

demo.test()
