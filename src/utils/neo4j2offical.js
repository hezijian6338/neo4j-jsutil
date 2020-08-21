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

  /**
   * TODO: 输出一个 key无 ""的结构
   * @param {*} Object
   */
  static parseJSON(Object) {
    return JSON.stringify(Object)
      .replace(/"([^(")"]+)":/g, '$1:')
      .trim()
  }

  /**
   * TODO: 输出一个可复用的结构
   * @param {*} Object
   */
  static reuseJSON(Object) {
    const fields = Reflect.ownKeys(Object)
    let result = '{'
    let count = 0
    for (let field of fields) {
      field = field.replace(/'/gi, '')
      result += `${field}: $${field}`
      if (++count <= fields.length - 1) {
        result += ', '
      }
    }
    return (result += '}')
  }

  async close() {
    await this.driver.close()
  }

  /**
   *  TODO: 查询接口
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

      console.log(result.summary.query.text)

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
   * TODO: 添加接口
   * @param String label
   * @param Object value
   */
  async create(label = '', value = {}, onlyProperties = false, useMerge = false) {
    if (onlyProperties === undefined || onlyProperties === null) {
      onlyProperties = false
    }

    const session = this.driver.session()

    try {
      
      const keyword = useMerge ? 'MERGE' : 'CREATE'

      const result = await session.writeTransaction((tx) =>
        tx.run(
          `${keyword} (p:${label} ${Neo4j2Offical.reuseJSON(value)}) return p`,
          value
        )
      )

      console.log(result.summary.query.text)

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
   * TODO: 批量添加接口
   * @param Array list
   * @param Boolean onlyProperties
   * @param Boolean oldApi
   */
  async creates(
    list = [{ label: '', value: {} }],
    onlyProperties = false,
    oldApi = false,
    useMerge = false
  ) {
    if (onlyProperties === undefined || onlyProperties === null) {
      onlyProperties = false
    }

    const session = this.driver.session()

    const nodes = []

    try {
      for (let single of list) {
        let result = null

        const keyword = useMerge ? 'MERGE' : 'CREATE'

        if (oldApi) {
          result = await session.writeTransaction((tx) =>
            tx.run(
              `${keyword} (p:${single.label} ${Neo4j2Offical.parseJSON(
                single.value
              )}) return p`,
              single.value
            )
          )
        } else {
          result = await session.writeTransaction((tx) =>
            tx.run(
              `${keyword} (p:${single.label} ${Neo4j2Offical.reuseJSON(
                single.value
              )}) return p`,
              single.value
            )
          )
        }

        console.log(result.summary.query.text)

        const singleRecord = result.records[0]
        const node = singleRecord.get(0)

        if (onlyProperties) {
          nodes.push(node.properties)
        } else {
          nodes.push(node)
        }
      }

      return nodes
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

      console.log(result.summary.query.text)

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

    if (relationName !== '') {
      relationName += `:${relationName}`
    }

    try {
      const result = await session.readTransaction((tx) =>
        tx.run(
          `match (a:${label} ${Neo4j2Offical.parseJSON(
            value
          )})-[r${relationName} ${Neo4j2Offical.parseJSON(
            relationValue
          )}]->(b) return r,b`
        )
      )

      console.log(result.summary.query.text)

      const nodes = []

      for (const record of result.records) {
        const relation = record.get(0)
        const node = record.get(1)
        
        if (onlyProperties) {
          nodes.push(relation.properties)
          nodes.push(node.properties)
        } else {
          nodes.push(relation)
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

    if (relationName !== '') {
      relationName += `:${relationName}`
    }

    try {
      const result = await session.readTransaction((tx) =>
        tx.run(
          `match (a:${label} ${Neo4j2Offical.parseJSON(
            value
          )})<-[r${relationName} ${Neo4j2Offical.parseJSON(
            relationValue
          )}]-(b) return r,b`
        )
      )

      console.log(result.summary.query.text)

      const nodes = []

      for (const record of result.records) {
        const relation = record.get(0)
        const node = record.get(1)
        if (onlyProperties) {
          nodes.push(relation.properties)
          nodes.push(node.properties)
        } else {
          nodes.push(relation)
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
   * TODO: 批量删除接口
   * @param Array list 
   */
  async deletes(list = [{ label:'', value:{} }]) {
    const session = this.driver.session()

    let nodes = []

    for (let single of list) {
      const result = await session.writeTransaction((tx) =>
        tx.run(`match (a:${single.lable} ${Neo4j2Offical.reuseJSON(single.value)}) delete a`, single.value)
      )

      console.log(result.summary.query.text)

      nodes.push(result.records)
    }

    return nodes
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
        `match ()-[r:${label} ${Neo4j2Offical.parseJSON(value)}]-() delete r`
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
  async update(label, value, updateValue, onlyProperties = false) {
    if (onlyProperties === undefined || onlyProperties === null) {
      onlyProperties = false
    }

    const session = this.driver.session()

    const result = await session.writeTransaction((tx) =>
      tx.run(
        `merge (a:${label} ${Neo4j2Offical.parseJSON(
          value
        )}) set a += ${Neo4j2Offical.parseJSON(updateValue)} return a`
      )
    )

    const singleRecord = result.records[0]
    const node = singleRecord.get(0)

    console.log(result.summary.query.text)

    if (onlyProperties) {
      return node.properties
    } else {
      return node
    }
  }
}

module.exports = { n2o: new Neo4j2Offical() }
