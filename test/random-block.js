var tape = require('tape')
var r = require('../')(require('../block'))

var letters = 'abcdefghijklmnopqrstuvwxyz'

var relations = [1, 2, 1, -1]

function random (n, f) {
  var g = {}
  for(var i = 0; i < n; i++) {
    var a = letters[i]
    g[a] = g[a] || {}
    for(var j = 0; j < f; j++) {
      var b = letters[~~(Math.random() * n)]
      if(b != a)
        g[a][b] = relations[~~(Math.pow(Math.random(), 2)*relations.length)]
    }
  }
  return g
}

var g = random(5, 3)
console.log(g)
console.log(r.traverse(g, 3, {}, {a: [0, null, 0]}, 'a'))

function eachEdge(g, iter) {
  for(var j in g)
    for(var k in g[j])
      iter(j, k, g[j][k])
}

var Update = require('../update')

for(var i = 0; i < 10;i ++) {
  tape('each edge',function (t) {
    var g = {}, hops = {a: [0, null, 0]}
    var _g = random(7, 5)
    console.log(_g)
    eachEdge(_g, function (j, k, v) {
      r.realtime(g, 3, hops, 'a', j,k, v)
      t.deepEqual(hops, r.traverse(g, 3, {}, {a: [0,null,0]}, 'a'))
    })
    t.end()

  })
}

tape('function all orders', function (t) {
  var g = random (2, 2)
  var _g = g
  var _hops = r.traverse(g, 3, {}, {a: [0, null, 0]}, 'a')
  var edges = []
  eachEdge(g, function (j,k,v) {
    edges.push({from:j, to:k, value:v})
  })

  function all_orders (a, pre, out) {
    pre = pre || []
    out = out || []

    if(a.length === 0) return out.push(pre)
    a.forEach(function (v, i) {
      var _a = a.slice()
      _a.splice(i, 1)
      all_orders(_a, pre.concat(v), out)
    })
    return out
  }

  function factorial (f) {
    f = ~~f
    if(f === 0) return 1
    return f * factorial(f-1)
  }

  var tests = edges //all_orders(edges)
  console.log(tests, tests.length, factorial(tests.length))
  var orders = all_orders(edges, [], [])
  console.log(orders.length, tests.length)

  orders.forEach(function (a) {
    var g = {}
    var hops = {a: [0, null, 0]}
    a.forEach(function (edge) {
      g[edge.from] = g[edge.from] || {}
      g[edge.from][edge.to] = edge.value //add all edges

      console.log(a, g)

      r.realtime(g, 3, hops, 'a', edge.from, edge.to, edge.value)
      t.deepEqual(
        hops,
        r.traverse(g, 3, {}, {a: [0, null, 0]}, 'a'),
        'hops are equal to realtime point-in-time traverse'
      )

    })

    t.deepEqual(
      r.traverse(g, 3, {}, {a: [0, null, 0]}, 'a'),
      _hops
    )
  })

  t.end()
})

function merge (ary) {
  var g = {}
  return ary.reduce(function (g, _g) {
    for(var j in _g) {
      g[j] = g[j] || {}
      for(var k in _g[j])
        g[j][k] = _g[j][k]
    }
    return g
  }, g)
}

for(var i = 0; i < 10; i++) {
  var u = Update(require('../block'))

  tape('test random:'+i, function (t) {
    var state = u.initialize('a', 3)
    var g2 = random(3, 2)
    var g1 = random(4, 5)
    var _g = {}
    var graphs = [g1, _g]

    u.addGraph(state, g1)
    u.addGraph(state, _g)
    var index = 1 //state.subgraphs.length-1

    console.log("GRAPH", JSON.stringify(merge(graphs)))
    console.log("HOPS", JSON.stringify(r.traverse(merge(graphs), 3, {}, {a:[0,null,0]}, 'a')))


    t.deepEqual(state.hops, r.traverse(merge(graphs), 3, {}, {a: [0, null, 0]}, 'a'))
    var rHops = r.traverse(merge(graphs), 3, {}, {a: [0, null, 0]}, 'a')

    eachEdge(g2, function (j, k, v) {
      console.log('ADD', index, j,k,v)
      var G = merge(graphs)
      r.realtime(G, 3, rHops, 'a', j, k, v)
      console.log('CHANGED?', [g1, g2], G)
      console.log('GRAPHS', graphs)
      console.log('COMPOSITE', G, graphs)

      var hops = r.traverse(G, 3, {}, {a:[0,null,0]}, 'a')
      t.deepEqual(rHops, hops, 'incremental hops equal')
    })

    t.end()
  })
}


