

var tape = require('tape')

var traverse = require('../')

tape('simple', function (t) {
  var h = {a: 0}
  var a = traverse({
    a: {b: 1}
  }, 3, h, h, 'a')
  t.deepEqual(h, {a: 0, b: 1})
  t.end()
})

function random (N, K) {
  var g = {}
  for(var i = 0; i < N;i++) {
    g[i] = {}
    g[~~(Math.random()*i)][i] = 1
    for(var j = 1; j < K; j++)
      g[i][~~(Math.random()*N)] = 1
  }
  return g
}

function counts (hops) {
  var counts = {}
  for(var k in hops)
      counts[hops[k]] = (counts[hops[k]] || 0) + 1
  return counts
}

tape('bench', function (t) {
  var g = random(10000, 350)
  var start = Date.now()
  var h = {"0": 0}
  var hops = traverse(g, 10, h, h, '0')
  console.log(Date.now()-start)
  console.log(counts(hops))
  t.end()
})

tape('bench', function (t) {
  var g = random(100000, 5)
  var start = Date.now()
  var h = {"0": 0}
  var hops = traverse(g, 10, h, h, '0')
  console.log(Date.now()-start)
  console.log(counts(hops))
  t.end()
})

