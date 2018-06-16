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
    g[a] = g[a] || {}
    for(var j = 0; j < f; j++) {
      var b = letters[~~(randomFloat() * n)]
      if(b != a)
        g[a][b] = relations[~~(Math.pow(randomFloat(), 2)*relations.length)]
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
function test (t, g, g_) {
  var g2 = {}, hops = {}
//  console.log(r.traverse(g, 3, {}, {a: [0, null, 0]}, 'a'))
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
      g[j] = g[j] || {}
      g[j][k] = g_[j][k]

      r.realtime(g2, 3, hops, 'a', j, k, v)
      t.deepEqual(hops, r.traverse(g2, 3, {}, {a: [0, null, 0]}, 'a'))
    })
  console.log(hops)
  t.deepEqual(hops, r.traverse(g, 3, {}, {a: [0, null, 0]}, 'a'))
  }
}

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






