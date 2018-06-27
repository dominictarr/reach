var mt = new (require('rng').MT)(0)
function randomFloat () {
  return mt.random()
}
var tape = require('tape')

var letters = 'abcdefghijklmnopqrstuvwxyz'

var relations = [1, 2, 1, -1]

function random (n, f, relations) {
  var g = {}
  for(var i = 0; i < n; i++) {
    var a = letters[i]
    for(var j = 0; j < f; j++) {
      var b = letters[~~(randomFloat() * n)]
      if(b != a) {
        g[a] = g[a] || {} //don't create empty nodes
        g[a][b] = relations[~~(Math.pow(randomFloat(), 2)*relations.length)]
      }
    }
  }
  return g
}

var g = random(10, 4, relations)
var r = require('../')(require('../block'))

function eachEdge(g, iter) {
  for(var j in g)
    for(var k in g[j])
      iter(j, k, g[j][k])
}

function Graph (start, max) {
  var g = {}
  var hops = {}
  g[start] = {}
  hops[start] = r.initial()
  return {
    graph: g,
    hops: hops,
    add: function (j, k, v) {
      return r.realtime(g, max, hops, start, j, k, v)
    }
  }
}
function test (t, g, g_) {
  var g2 = {}, hops = {}
  var _g = JSON.parse(JSON.stringify(g))
  console.log(JSON.stringify(g))
  //add each edge, and check that it's consistent with the incremental hops
  eachEdge(g, function (j, k, v) {
    r.realtime(g2, 3, hops, 'a', j, k, v)
    t.deepEqual(hops, r.traverse(g2, 3, {}, {a: [0, null, 0]}, 'a'))
  })

  t.deepEqual(hops, r.traverse(g, 3, {}, {a: [0, null, 0]}, 'a'))

  if(g_) {
    //merge in a second graph, because we need to test updates!
    console.log(JSON.stringify(g_))
    eachEdge(g_, function (j, k, v) {
      _g[j] = _g[j] || {} //merge into copy of g
      _g[j][k] = v

      r.realtime(g2, 3, hops, 'a', j, k, v)
      t.deepEqual(g2, _g)
      t.deepEqual(hops, r.traverse(_g, 3, {}, {a: [0, null, 0]}, 'a'))
    })
    t.deepEqual(hops, r.traverse(_g, 3, {}, {a: [0, null, 0]}, 'a'))
  }
}

function test2 (t, g, g_) {
  var g2 = {}
  var G = Graph('a', 3)
  //add each edge, and check that it's consistent with the incremental hops
  eachEdge(g, function (j, k, v) {
    g2[j] = g2[j] || {}
    g2[j][k] = v
    G.add(j, k, v)
    t.deepEqual(G.graph, g2)
    t.deepEqual(G.hops, r.traverse(g2, 3, {}, {a: [0, null, 0]}, 'a'))
  })

  t.deepEqual(G.hops, r.traverse(g, 3, {}, {a: [0, null, 0]}, 'a'))
//  return
  if(g_) {
    //merge in a second graph, because we need to test updates!
    eachEdge(g_, function (j, k, v) {
      g2[j] = g2[j] || {}
      g2[j][k] = v
      G.add(j, k, v)
      t.deepEqual(G.graph, g2, 'graphs match')
      t.deepEqual(G.hops, r.traverse(g2, 3, {}, {a: [0, null, 0]}, 'a'), 'incremental matches traversal')
    })
    t.deepEqual(G.hops, r.traverse(g2, 3, {}, {a: [0, null, 0]}, 'a'))
  }
}


module.exports = function (test) {

tape('simple, follow only', function (t) {
  test(t, random(3, 2, [1]))
  test(t, random(4, 3, [1]))
  test(t, random(5, 2, [1]))
  test(t, random(5, 4, [1]))
  test(t, random(5, 5, [1]))
  t.end()
})


tape('simple, follow, same-as, distant follow', function (t) {
  test(t, random(3, 2, [1,0]))
  test(t, random(4, 3, [1,2, 0]))
  test(t, random(5, 2, [1,2,0]))
  test(t, random(5, 4, [1,2,0]))
  test(t, random(5, 5, [1,2,0]))
  t.end()
})

tape('simple, follow becoming closer', function (t) {
  test(t, random(4, 3, [2]), random(3, 3, [1]))
  test(t, random(4, 3, [1]), random(3, 3, [0]))
  test(t, random(4, 3, [-1]), random(3, 3, [2]))
  test(t, random(4, 3, [-2, -1]), random(3, 3, [2]))
  t.end()
})


tape('follow becoming further', function (t) {
  test(t, random(4, 3, [1]), random(3, 3, [2]))
  test(t, random(4, 3, [0]), random(3, 3, [1]))
  test(t, random(4, 3, [2]), random(3, 3, [-1]))
  test(t, random(4, 3, [2]), random(3, 3, [-2, -1]))
  test(t, random(4, 3, [1, -1]), random(3, [1, null]))
  test(t, random(6, 3, [1, -1]), random(3, [1, null]))
  test(t, random(10, 5, [1, -1]), random(3, [1, null]))
  t.end()
})


tape('everything', function (t) {
  test(t, random(10, 3, [0, 1, 2, -1, -2]), random(5, 3, [0, 1, 2, -1, -2]))
  t.end()
})

tape('unfollow', function (t) {
  test(t, random(10, 3, [0, 1, 2, -1, -2]), random(5, 3, [null]))
  t.end()
})


}

module.exports(test)
//module.exports(test2)


