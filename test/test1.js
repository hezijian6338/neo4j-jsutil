class test {
  async t1() {
    return [1, 2, 3, 4, 5, 6]
  }
}

async function aa() {
  const t = new test()
let r = await t.t1()
let r1 = []
for (let v in r) {
  r1.push(v)
}

console.log(r1)
}

aa()

