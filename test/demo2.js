class test{
  constructor(json) {
    this.json = json
  }

  test1() {
    const fields = Reflect.ownKeys(this.json)
    for (let field of fields) {
      field = field.replace(/'/gi, '')
      const value = Reflect.get(this.json, field)
      console.log(`{${field}: $${field}}`)
      console.log(`${field}: '${value}'`)
      console.log(field, value)
    }
    
  }
}

const json = {
  'name': 'hezijian',
  'sex': 1
}

const test2 = new test(json)

test2.test1()