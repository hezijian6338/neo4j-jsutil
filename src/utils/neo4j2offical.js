class Neo4j2Offical {
  constructor() {
    const neo4j = require('neo4j-driver')

    const uri = 'bolt://localhost:7687'
    const user = 'neo4j'
    const password = '0000'

    this.driver = neo4j.driver(uri, neo4j.auth.basic(user, password))

    console.log('Init neo4j Database...')
    // this.session = this.driver.session()
  }

  static parseJSON(Object) {
    return JSON.stringify(Object)
      .replace(/"([^(")"]+)":/g, '$1:')
      .trim()
  }

  async close() {
    await this.driver.close()
  }

  /**
   *
   * @param String label
   * @param Object value
   */
  async find(label = '', value = {}, onlyProperties = false) {
    if (onlyProperties === undefined || onlyProperties === null) {
      onlyProperties = false
    }

    const session = this.driver.session()

    try {
      const result = await session.readTransaction((tx) =>
        tx.run(`MATCH (a:${label} ${Neo4j2Offical.parseJSON(value)}) return a`)
      )

      let nodes = []

      for (const record of result.records) {
        const node = record.get(0)
        if (onlyProperties) {
          nodes.push(node.properties)
        } else {
          nodes.push(node)
        }
      }

      // const Records = result.records[0]

      // const node = singleRecord.get(0)

      // console.log(result)

      return nodes
    } finally {
      await session.close()
    }
  }

  /**
   *
   * @param String label
   * @param Object value
   */
  async create(label = '', value = {}, onlyProperties = false) {
    if (onlyProperties === undefined || onlyProperties === null) {
      onlyProperties = false
    }

    const session = this.driver.session()

    try {
      const result = await session.writeTransaction((tx) =>
        tx.run(`CREATE (p:${label} ${Neo4j2Offical.parseJSON(value)}) return p`)
      )

      const singleRecord = result.records[0]
      const node = singleRecord.get(0)

      if (onlyProperties) {
        return node.properties
      } else {
        return node
      }
    } finally {
      await session.close()
    }
  }

  /**
   *
   * @param String nodeLabel
   * @param Object nodeValue
   * @param String relateNodeLabel
   * @param Object relateNodeValue
   * @param String relationName
   * @param Object relationValue
   */
  async relate(
    nodeLabel = '',
    nodeValue = {},
    relateNodeLabel = '',
    relateNodeValue = {},
    relationName = '',
    relationValue = {},
    onlyProperties = false
  ) {
    if (onlyProperties === undefined || onlyProperties === null) {
      onlyProperties = false
    }

    const session = this.driver.session()

    try {
      const result = await session.writeTransaction((tx) =>
        tx.run(
          `match (a:${nodeLabel} ${Neo4j2Offical.parseJSON(
            nodeValue
          )}), (b:${relateNodeLabel} ${Neo4j2Offical.parseJSON(
            relateNodeValue
          )}) merge (a)-[r:${relationName} ${Neo4j2Offical.parseJSON(
            relationValue
          )}]->(b) return a,r,b`
        )
      )

      const singleRecord = result.records[0]
      const node = {}
      const nodeA = singleRecord.get(0)
      const nodeR = singleRecord.get(1)
      const nodeB = singleRecord.get(2)

      if (onlyProperties) {
        Reflect.set(node, 'node', nodeA.properties)
        Reflect.set(node, 'relation', nodeR.properties)
        Reflect.set(node, 'relatedNode', nodeB.properties)
      } else {
        Reflect.set(node, 'node', nodeA)
        Reflect.set(node, 'relation', nodeR)
        Reflect.set(node, 'relatedNode', nodeB)
      }

      return node
    } finally {
      await session.close()
    }
  }

  /**
   *
   * @param String label
   * @param Object value
   * @param String relationName
   * @param Object relationValue
   */
  async findRelate(
    label = '',
    value = {},
    relationName = '',
    relationValue = {},
    onlyProperties = false
  ) {
    if (onlyProperties === undefined || onlyProperties === null) {
      onlyProperties = false
    }

    const session = this.driver.session()

    try {
      const result = await session.readTransaction((tx) =>
        tx.run(
          `match (a:${label} ${Neo4j2Offical.parseJSON(
            value
          )})-[${relationName} ${Neo4j2Offical.parseJSON(
            relationValue
          )}]->(b) return b`
        )
      )

      const nodes = []

      for (const record of result.records) {
        const node = record.get(0)
        if (onlyProperties) {
          nodes.push(node.properties)
        } else {
          nodes.push(node)
        }
      }

      // const singleRecord = result.records[0]
      // const node = singleRecord.get(0)

      return nodes
    } finally {
      await session.close()
    }
  }

  /**
   * 
   * @param String label
   * @param Object value
   * @param String relationName
   * @param Object relationValue
   * @param Boolean onlyProperties 
   */
  async findRelated(
    label = '',
    value = {},
    relationName = '',
    relationValue = {},
    onlyProperties = false
  ) {
    if (onlyProperties === undefined || onlyProperties === null) {
      onlyProperties = false
    }

    const session = this.driver.session()

    try {
      const result = await session.readTransaction((tx) =>
        tx.run(
          `match (a:${label} ${Neo4j2Offical.parseJSON(
            value
          )})<-[${relationName} ${Neo4j2Offical.parseJSON(
            relationValue
          )}]-(b) return b`
        )
      )

      const nodes = []

      for (const record of result.records) {
        const node = record.get(0)
        if (onlyProperties) {
          nodes.push(node.properties)
        } else {
          nodes.push(node)
        }
      }

      // const singleRecord = result.records[0]
      // const node = singleRecord.get(0)

      return nodes
    } finally {
      await session.close()
    }
  }

  /**
   *
   * @param String lable
   * @param Object value
   */
  async delete(lable = '', value = {}) {
    const session = this.driver.session()

    const result = await session.writeTransaction((tx) => {
      tx.run(`match (a:${lable} ${Neo4j2Offical.parseJSON(value)}) delete a`)
    })

    // const singleRecord = result.records[0]
    // const node = singleRecord.get(0)

    return result
  }

  /**
   *
   * @param String label
   * @param Object value
   */
  async deleteRelation(label = '', value = {}) {
    const session = this.driver.session()

    const result = session.writeTransaction((tx) => {
      tx.run(
        `match ()-[:r${label} ${Neo4j2Offical.parseJSON(value)}]->() delete r`
      )
    })

    // const singleRecord = result.records[0]
    // const node = singleRecord.get(0)

    return result
  }

  /**
   *
   * @param String label
   * @param Object value
   * @param Object updateValue
   */
  async update(label, value, updateValue) {
    const session = this.driver.session()

    const result = await session.writeTransaction((tx) => {
      tx.run(
        `merge (a:${label} ${Neo4j2Offical.parseJSON(
          value
        )}) set a += ${Neo4j2Offical.parseJSON(updateValue)} return  a`
      )
    })

    const singleRecord = result.records[0]
    const node = singleRecord.get(0)

    return node
  }
}

module.exports = { n2o: new Neo4j2Offical() }
