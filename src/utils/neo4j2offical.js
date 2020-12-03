class Neo4j2Offical {
  instance = null

  static getInstance() {
    if (this.instance == null) {
      this.instance = new Neo4j2Offical()
    }
    return this.instance
  }

  constructor() {
    const neo4j = require('neo4j-driver')

    const uri = 'bolt://192.168.1.12:7687'
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
   * TODO: 输出节点类型列表
   * @param {*} onlyProperties
   */
  async findNodeTypeList(onlyProperties = false) {
    let list = await this.find('', {}, onlyProperties)
    let typeList = []
    list.map((n) => {
      const labelType = n.labels[0]
      if (typeList.indexOf(labelType) === -1) {
        typeList.push(labelType)
      }
    })

    return typeList
  }

  async findById(label = '', id = 0, onlyProperties = false) {
    if (onlyProperties === undefined || onlyProperties === null) {
      onlyProperties = false
    }

    const session = this.driver.session()

    try {
      const result = await session.readTransaction((tx) =>
        tx.run(`MATCH (a:${label}) WHERE ID(a)=${id} RETURN a`)
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
      let result = null
      if (label === '') {
        result = await session.readTransaction((tx) =>
          tx.run(`MATCH (a) return a`)
        )
      } else {
        result = await session.readTransaction((tx) =>
          tx.run(
            `MATCH (a:${label} ${Neo4j2Offical.parseJSON(value)}) return a`
          )
        )
      }

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
  async create(
    label = '',
    value = {},
    onlyProperties = false,
    useMerge = false
  ) {
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
   * TODO: 根据 id关联两个节点 (提供关系内容)
   * @param number relateId 
   * @param number relatedId 
   * @param String relationName 
   * @param Object relationValue 
   * @param Boolean onlyProperties 
   */
  async relateById(
    relateId = '',
    relatedId = '',
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
          `match (a), (b) where ID(a)=${relateId} and ID(b)=${relatedId} merge (a)-[r:${relationName} ${Neo4j2Offical.parseJSON(
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
    labelId,
    relationName = '',
    relationValue = {},
    relationId,
    onlyProperties = false
  ) {
    if (onlyProperties === undefined || onlyProperties === null) {
      onlyProperties = false
    }

    const session = this.driver.session()

    if (relationName !== '') {
      relationName = `:${relationName}`
    }

    try {
      let result = ''

      if (relationId !== '' && relationId !== undefined && relationId !== null) {
        result = await session.readTransaction((tx) =>
          tx.run(
            `match (a:${label} ${Neo4j2Offical.parseJSON(
              value
            )})-[r${relationName} ${Neo4j2Offical.parseJSON(
              relationValue
            )}]->(b) where ID(r) = ${relationId} return r,b`
          )
        )
      } else if (labelId !== '' && labelId !== undefined && labelId !== null) {
        result = await session.readTransaction((tx) =>
          tx.run(
            `match (a:${label} ${Neo4j2Offical.parseJSON(
              value
            )})-[r${relationName} ${Neo4j2Offical.parseJSON(
              relationValue
            )}]->(b) where ID(a) = ${labelId} return r,b`
          )
        )
      } else {
        result = await session.readTransaction((tx) =>
          tx.run(
            `match (a:${label} ${Neo4j2Offical.parseJSON(
              value
            )})-[r${relationName} ${Neo4j2Offical.parseJSON(
              relationValue
            )}]->(b) return r,b`
          )
        )
      }

      console.log(result.summary.query.text)

      const nodes = []
      const relations = []

      for (const record of result.records) {
        const relation = record.get(0)
        const node = record.get(1)

        if (onlyProperties) {
          relations.push(relation.properties)
          nodes.push(node.properties)
        } else {
          relations.push(relation)
          nodes.push(node)
        }
      }

      // const singleRecord = result.records[0]
      // const node = singleRecord.get(0)

      return { nodes, relations }
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
    labelId,
    relationName = '',
    relationValue = {},
    relationId,
    onlyProperties = false
  ) {
    if (onlyProperties === undefined || onlyProperties === null) {
      onlyProperties = false
    }

    const session = this.driver.session()

    if (relationName !== '') {
      relationName = `:${relationName}`
    }

    try {
      let result = ''

      if (relationId !== '' && relationId !== undefined && relationId !== null) {
        result = await session.readTransaction((tx) =>
          tx.run(
            `match (a:${label} ${Neo4j2Offical.parseJSON(
              value
            )})<-[r${relationName} ${Neo4j2Offical.parseJSON(
              relationValue
            )}]-(b) where ID(r) = ${relationId} return r,b`
          )
        )
      } else if (labelId !== '' && labelId !== undefined && labelId !== null) {
        result = await session.readTransaction((tx) =>
          tx.run(
            `match (a:${label} ${Neo4j2Offical.parseJSON(
              value
            )})<-[r${relationName} ${Neo4j2Offical.parseJSON(
              relationValue
            )}]-(b) where ID(a) = ${labelId} return r,b`
          )
        )
      } else {
        result = await session.readTransaction((tx) =>
          tx.run(
            `match (a:${label} ${Neo4j2Offical.parseJSON(
              value
            )})<-[r${relationName} ${Neo4j2Offical.parseJSON(
              relationValue
            )}]-(b) return r,b`
          )
        )
      }

      console.log(result.summary.query.text)

      const nodes = []
      const relations = []

      for (const record of result.records) {
        const relation = record.get(0)
        const node = record.get(1)
        if (onlyProperties) {
          relations.push(relation.properties)
          nodes.push(node.properties)
        } else {
          relations.push(relation)
          nodes.push(node)
        }
      }

      // const singleRecord = result.records[0]
      // const node = singleRecord.get(0)

      return { nodes, relations }
    } finally {
      await session.close()
    }
  }

  /**
   * TODO: 根据 id查询关系
   * @param String id 
   * @param Boolean onlyProperties 
   */
  async findRelateById(id, onlyProperties = false) {
    const session = this.driver.session()

    if (relationId !== '' && relationId !== undefined && relationId !== null) {
      return {}
    }

    try {
      const result = await session.readTransaction((tx) =>
      tx.run(
        `match ()-[r]->() where ID(r) = ${id} return r`
        )
      )

      console.log(result.summary.query.text)

      const record = result.records[0]

      const relation = record.get(0)
        if (onlyProperties) {
          return relation.properties
        } else {
          return relation
      }

    } finally {
      await session.close()
    }
  }

  /**
   * TODO: 根据属性查找节点 (有则返回, 无则空)
   * @param String property 
   * @param String onlyProperties 
   */
  async findPropertie2Node(property = 'name', onlyProperties = false) {
    const session = this.driver.session()

    if (property === '') {
      property = 'name'
    }

    try {
      const result = await session.readTransaction((tx) =>
        tx.run(
          `MATCH (n) where EXISTS(n.${property}) return n`
        ))

        console.log(result.summary.query.text)

        const singleRecord = result.records[0]
        if (singleRecord === undefined) {
          return {}
        }

        const nodes = []

        if (onlyProperties) {
          for (let record of result.records) {
            nodes.push(record.get(0).properties)
          }
          return nodes
        } else {
          for (let record of result.records) {
            nodes.push(record.get(0))
          }
          return nodes
        }
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
   * TODO: 根据 id删除
   * @param String lable 
   * @param String id 
   */
  async deleteById(lable = '', id = '') {
    const session = this.driver.session()

    const result = await session.writeTransaction((tx) => {
      tx.run(`match (a:${lable}) where ID(a)=${id} delete a`)
    })

    // const singleRecord = result.records[0]
    // const node = singleRecord.get(0)

    return result
  }

  /**
   * TODO: 批量删除接口
   * @param Array list
   */
  async deletes(list = [{ label: '', value: {} }]) {
    const session = this.driver.session()

    let nodes = []

    for (let single of list) {
      const result = await session.writeTransaction((tx) =>
        tx.run(
          `match (a:${single.lable} ${Neo4j2Offical.reuseJSON(
            single.value
          )}) delete a`,
          single.value
        )
      )

      console.log(result.summary.query.text)

      nodes.push(result.records)
    }

    return nodes
  }

  /**
   * TODO: 删除节点属性
   * @param String label 
   * @param Object value 
   * @param List deleteValues 
   */
  async deleteProperties(label = '', value = {}, deleteValues = []) {
    const session = this.driver.session()

    let removeStr = ''

    if (deleteValues.length !== 0) {
      deleteValues.forEach(v => {
        if (removeStr.length !== 0) {
          removeStr = `${removeStr}, `
        }
        removeStr = `${removeStr} n.${v.replace(/\//g,'').trim()}`
      })
    }

    try {
      await session.writeTransaction((tx) => {
        tx.run(`match (n:${label} ${Neo4j2Offical.parseJSON(value)}) remove ${removeStr} return n`)
      })

      console.log(`match (n:${label} ${Neo4j2Offical.parseJSON(value)}) remove ${removeStr} return n`)

      return []
    } finally {
      await session.close()
    }
  }

  /**
   * TODO: 根据节点 id删除属性
   * @param String label 
   * @param String id 
   * @param List deleteValues 
   */
  async deletePropertiesById(label = '', id = '', deleteValues = []) {
    const session = this.driver.session()

    let removeStr = ''

    if (deleteValues.length !== 0) {
      deleteValues.forEach(v => {
        if (removeStr.length !== 0) {
          removeStr = `${removeStr}, `
        }
        removeStr = `${removeStr} n.${v.replace(/\//g,'').trim()}`
      })
    }

    try {
      await session.writeTransaction((tx) => {
        tx.run(`match (n:${label}) where ID(n)=${id} remove ${removeStr} return n`)
      })

      console.log(`match (n:${label}) where ID(n)=${id} remove ${removeStr} return n`)

      return []
    } finally {
      await session.close()
    }
  }

  /**
   * TODO: 删除节点间关联的关系
   * @param String relateId 
   * @param String relatedId 
   */
  async deleteRelationB2Node(relateId, relatedId) {
    if (relateId === undefined || relatedId === undefined || relateId === '' || relatedId === '' || relateId === null || relatedId === null) {
      return {}
    }

    const session = this.driver.session()

    try {
      await session.writeTransaction((tx) => {
        tx.run(`match (a) - [r] -> (b) where ID(a)=${relateId} and ID(b)=${relatedId} delete r`)
      })

      console.log(`match (a) - [r] -> (b) where ID(a)=${relateId} and ID(b)=${relatedId} delete r`)

      return {}
    } finally {
      await session.close()
    }
  }

  /**
   * TODO: 删除关系 (所有)
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

  async updateRelation(
    nodeLabel = '',
    nodeValue = {},
    relateNodeLabel = '',
    relateNodeValue = {},
    relationName = '',
    relationValue = {},
    updateValue = {},
    onlyProperties = false
  ) {
    if (onlyProperties === undefined || onlyProperties === null) {
      onlyProperties = false
    }

    if (relationName !== '') {
      relationName = `:${relationName}`
    }

    const session = this.driver.session()

    const result = await session.writeTransaction((tx) =>
      tx.run(
        `match (a:${nodeLabel} ${Neo4j2Offical.parseJSON(
          nodeValue
        )})-[r${relationName} ${Neo4j2Offical.parseJSON(
          relationValue
        )}]->(b:${relateNodeLabel} ${Neo4j2Offical.parseJSON(
          relateNodeValue
        )}) set r += ${Neo4j2Offical.parseJSON(updateValue)} return r`
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

  /**
   * TODO: 根据 两个节点 ID更新定点关系属性
   * @param number relateId 主动关系节点 Id
   * @param number relatedId 被动关系节点 Id
   * @param String relationId 关系 Id
   * @param Object updateValue 更新的属性内容
   * @param Boolean onlyProperties 
   */
  async updateRelationById(relateId, relatedId, relationId, updateValue = {}, onlyProperties = false) {
    if (onlyProperties === undefined || onlyProperties === null) {
      onlyProperties = false
    }

    if (relateId === undefined || relatedId === undefined || relateId === '' || relatedId === '' || relateId === null || relatedId === null) {
      return {}
    }

    const session = this.driver.session()

    try {
      const result = await session.writeTransaction((tx) =>
        tx.run(
          `match (a) - [r] -> (b) where ID(a)=${relateId} and ID(b)=${relatedId} and ID(r)=${relationId} set r = ${Neo4j2Offical.parseJSON(
            updateValue
          )} return r`
        )
      )

      console.log(result.summary.query.text)

      const singleRecord = result.records[0]
      const relation = singleRecord.get(0)

      if (onlyProperties) {
        return relation.properties
      } else {
        return relation
      }
  
    } finally {
      await session.close()
    }
  }

  /**
   * TODO: 更新全部关系属性内容
   * @param String label 
   * @param Object updateValue 
   * @param Boolean onlyProperties 
   */
  async updateRelation2All(label, updateValue, onlyProperties = false) {
    if (label === null || label === undefined || label === '') {
      return []
    }

    if (onlyProperties === undefined || onlyProperties === null) {
      onlyProperties = false
    }

    const session = this.driver.session()

    try {
      const result = await session.writeTransaction((tx) =>
        tx.run(
          `match () - [r:${label}] -> () set r = ${Neo4j2Offical.parseJSON(
            updateValue
          )} return r`
        )
      )

      console.log(result.summary.query.text)

      const relations = []

      for (const record of result.records) {
        const relation = record.get(0)
        if (onlyProperties) {
          relations.push(relation.properties)
        } else {
          relations.push(relation)
        }
      }

      return relations
    } finally {
      await session.close()
    }
  }

  /**
   * TODO: 查询节点的所有属性名字 (并且基准去重了)
   */
  async findNodesKeys() {
    const session = this.driver.session()

    try {
      const result = await session.writeTransaction((tx) =>
        tx.run(
          `match (n) return DISTINCT keys(n)`
        )
      )

      console.log(result.summary.query.text)

      const keys = new Map()

      for (const record of result.records) {
        const key = record.get(0)
        for (let k of key) {
          if (!keys.has(k)) {
            const l = await this.findKeysValue(k, 1)
            keys.set(k, l)
          }
        }
      }

      return keys
    } finally {
      await session.close()
    }
  }

  /**
   * TODO: 查询关系的所有属性名字 (并且基准去重了)
   */
  async findRelationsKeys() {
    const session = this.driver.session()

    try {
      const result = await session.writeTransaction((tx) =>
        tx.run(
          `match () - [r] -> () return keys(r)`
        )
      )

      console.log(result.summary.query.text)

      const keys = new Map()

      for (const record of result.records) {
        const key = record.get(0)
        for (let k of key) {
          if (!keys.has(k)) {
            const l = await this.findKeysValue(k, 2)
            keys.set(k, l)
          }
        }
      }

      return keys
    } finally {
      await session.close()
    }
  }

  /**
   * 根据类型查找 key值. 1 --> node; 2 --> relation;
   * @param String key 
   * @param number type 
   */
  async findKeysValue(key, type) {
    const session = this.driver.session()

    try {
      let result = ''
      if (type === 1) {
        result = await session.writeTransaction((tx) =>
          tx.run(
            `MATCH (n) WHERE EXISTS(n.${key}) RETURN DISTINCT "node" as entity, n.${key} as ${key}`
          )
        )
      }
      if (type === 2) {
        result = await session.writeTransaction((tx) =>
          tx.run(
            `MATCH ()-[r]-() WHERE EXISTS(r.${key}) RETURN DISTINCT "relationship" AS entity, r.${key} AS ${key}`
          )
        )
      }


      console.log(result.summary.query.text)

      const values = []

      for (const record of result.records) {
        const v = record.get(1)
        // console.log(record)
        values.push(v)
      }

      // console.log(values)

      return values
    } finally {
      await session.close()
    }
  }
}

module.exports = { n2o: Neo4j2Offical.getInstance() }
