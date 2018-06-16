var inputs = require('./data/block')
var permutations = require('get-permutations')

var tape = require('tape')
var block = require('../block')
var r = require('../')(block)
//var realtime = require('../realtime')(block)

tape('add', function (t) {
  var equal = t.deepEqual
  equal(block.add([0, null, 0], 1), [1, null, 1])
  equal(block.add([1, null, 1], 1), [2, null, 2])
  //blockHops is the hops of the blocker.
  equal(block.add([0, null, 0], -1), [null, 0, null])
  equal(block.add([1, null, 1], -1), [null, 1, null])
  equal(block.add([1, null, 1], -2), [2, null, -1])
  equal(block.add([1, null, 1], 2), [3, null, 3])

  t.end()
})

tape('reduce', function (t) {
  var equal = t.deepEqual
  equal(block.reduce([0, null, 0], [1, null, 1], -1), [1, 0, 1])
  equal(block.reduce([0, null, 0], [2, 0, 2], 1), [1, 0, 1])

  t.end()

})

tape('min', function (t) {
  var equal = t.deepEqual
  equal(block.min([0, null, 0], [1, null, 1]), [0, null, 0])
  equal(block.min([null, 0, null], [1, null, 1]), [1, 0, 1])
  equal(block.min([null, 0, null], [1, null, 1]), [1, 0, 1])
  //foaf & boaf, then we follow
  equal(block.min([2, 1, null], [1, null, 1]), [1, 1, 1])
  t.end()
})

tape('expand', function (t) {
  t.equal(block.isExpand([1,1,1], 2), true)
  t.equal(block.isExpand([1,0,1], 2), false)
  t.end()
})

tape('reachable', function (t) {
  t.deepEqual(r.traverse({
      a: {b: 1},
    },
    2,
    {a:[0,null,0]},
    {},
    'a'
    ), {b: [1,null, 1]})
  t.end()
})


function clone (obj) {
  return JSON.parse(JSON.stringify(obj))
}

inputs.forEach(function (e) {
  if(e)
    tape('traverse:'+(e.name || JSON.stringify(e.graph)), function (t) {
      var h = {a: block.initial()}
      var output = r.traverse(
        e.graph, e.max || 2, h, h, 'a'
      )
      t.deepEqual(output, e.hops)
      t.end()
    })
})

function merge (a, b) {
  for(var k in a)
    if(!a[k]) delete b[k]
    else b[k] = a[k]
  return b
}

//this test was for getting realtime.js right,
//but now just use realtime.
inputs.forEach(function (e) {
  if(e)
    tape('traverse partial:'+e.name, function (t) {
      var g = e.graph
      var full = {a: [0,null,0]}
      full = r.traverse(e.graph, e.max || 2, full, full, 'a')
      for(var j in g) {
        for(var k in g[j]) {
          var _g = clone(g)
          delete _g[j][k]
          var h = {a:block.initial()}

          var _hops = r.traverse(_g, e.max || 2, h, h, 'a')
          t.deepEqual(h.a, block.initial())
          _g[j][k]=g[j][k]

          var hops = {}
          if(g[j][k] >= 0 && r.update(_g, e.max||2, _hops, hops, j, k)) {
            hops = r.traverse(_g, e.max||2, _hops, hops, k)
          }
          else if (false) {
            /*
              I had thought that maybe I could recalculate
              just the paths to K, when someone blocked K,
              but we'd need to recalculate the paths out of K too.
              If we had two way links on our graph structure
              something like this would work. but not one way.
            */
            delete hops[k]
            for(var i in g) {
              if(g[i][k] != null) {
                r.update(_g, e.max||2, _hops, hops, i, k)
              }
            }
          }
          else {
            next = {a:true}
            var hops2 = _hops
            hops = {a:[0,null, 0]}
            hops = r.traverse(_g, e.max||2, hops, hops, 'a')
            //diff
            for(var k in _hops)
              if(!hops[k])
                hops[k] = null
          }

          t.deepEqual(merge(hops, _hops), e.hops)
        }
      }
      t.end()
    })
})

//test readding a single edge back to the graph
inputs.forEach(function (e) {
  if(e)
    tape('realtime partial:'+e.name, function (t) {
      var g = e.graph
      var full = {a: [0,null,0]}
      var start = 'a'
      full = r.traverse(e.graph, e.max || 2, full, full, start)
      var edges = []
      for(var j in g) {
        for(var k in g[j]) {
          var _g = clone(g)
          edges.push({from: j, to: k, value: g[j][k]})
          delete _g[j][k]
          //calculate the hops before adding edge jk
          var _hops = clone(r.realtime(_g, e.max || 2, {}, start))
          var __hops = clone(_hops)

          //check that _hops.a contains the start.
          t.deepEqual(_hops.a, block.initial())

          //add jk to the test copy of the graph.
          console.log('add:', j,k,g[j][k])
//          _g[j][k]=g[j][k]

          //calculate the change in hops
          var hops = r.realtime(_g, e.max || 2, _hops, start, j, k, g[j][k])

          t.deepEqual(_hops, e.hops) //mutates old_hops
          console.log('patch', hops) //returns a patch.
          //merging the patch into the copy of the original
          //gives us the expected output.
          t.deepEqual(merge(hops, __hops), e.hops)
        }
      }
      console.log(edges, edges.length)
      t.end()
    })
})


inputs.forEach(function (data) {
  var edges = []
  var g = data.graph
  for(var j in g) {
    for(var k in g[j]) {
      edges.push({from: j, to: k, value: g[j][k]})
    }
  }

  tape('permutations of:'+data.name, function (t) {
    var e = edges
    //permutations(edges).forEach(function (e) {
      //rebuild the graph, and check it has the same result from each order edges are added.
      //the output hops should be the same irrespective of the order edges are traversed.
      var g = {}
      var hops = {a: block.initial()}

      e.forEach(function (edge) {
        r.realtime(g, data.max || 2, hops, 'a', edge.from, edge.to, edge.value)
        //realtime hops should match full traversal done at this point in time
        t.deepEqual(hops, r.traverse(g, data.max || 2, {}, {a: block.initial()}, 'a'))
      })

      t.deepEqual(g, data.graph, 'graphs should be equal')
      t.deepEqual(r.traverse(g, data.max || 2, {}, {a: block.initial()}, 'a'), data.hops)
      t.deepEqual(hops, data.hops)
    //})
    t.end()
  })
})

//TODO: test adding all edges in different orders



