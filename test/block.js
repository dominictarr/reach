

var tape = require('tape')
var block = require('../block')
var inject = require('../').inject
var reachable = inject(block.reduce, block.update, block.expand)

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
  t.equal(block.expand([1,1,1], 2), true)
  t.equal(block.expand([1,0,1], 2), false)
  t.end()
})

tape('reachable', function (t) {
  t.deepEqual(reachable({
      a: {b: 1},
    },
    2,
    {a:[0,null,null]},
    {},
    'a'
    ), {b: [1,null, 1]})
  t.end()
})

var inputs = [
  {
    name: 'single follow',
    graph: {
      a: {b: 1}
    },
    hops: {
      a: [0,null,null], //should a[2] be 0?
      b: [1,null,1]
    }
  },
  {
    name: 'foaf',
    graph: {
      a: {b: 1},
      b: {c: 1}
    },
    max: 3,
    hops: {
      a: [0,null,null],
      b: [1,null,1],
      c: [2,null,2]
    }
  },
  {
    name: 'foaf+boaf',
    graph: {
      a: {b: 1},
      b: {c: -1},
      c: {d: 1}
    },
    max: 3,
    hops: {
      a: [0,null,null],
      b: [1,null,1],
      c: [null,1,null]
    }
  },
  {
    name: 'do not traverse from boaf',
    graph: {
      a: {b: 1},
      b: {c: -1},
      c: {d: 1}
    },
    max: 3,
    hops: {
      a: [0,null,null],
      b: [1,null,1],
      c: [null,1,null]
    }
  },
  {
    name: 'do not traverse from block',
    graph: {
      a: {b: 1, c: -1},
      b: {c: 1},
      c: {d: 1}
    },
    max: 3,
    hops: {
      a: [0,null,null],
      b: [1,null,1],
      c: [2,0,2]
    }
  },
  {
    name: 'do not traverse from block',
    graph: {
      a: {b: 1, c: -1},
      b: {c: 1},
      c: {d: 1}
    },
    max: 3,
    hops: {
      a: [0,null,null],
      b: [1,null,1],
      c: [2,0,2]
    }
  },
  {
    name: 'gets to c without block',
    graph: {
      a: {b: 1},
      b: {c: 1},
      c: {d: 1}
    },
    max: 3,
    hops: {
      a: [0,null,null],
      b: [1,null,1],
      c: [2,null,2],
      d: [3,null, 3]
    }
  },
  {
    name: 'dist is minimum',
    graph: {
      a: {b: 1, c: 1},
      b: {c: 1},
      c: {d: 1}
    },
    max: 3,
    hops: {
      a: [0,null,null],
      b: [1,null,1],
      c: [1,null,1],
      d: [2,null,2],
    }
  },
  {
    name: 'follow beats boaf',
    graph: {
      a: {b: 1, c: 1},
      b: {c: -1},
      c: {d: 1},
    },
    max: 3,
    hops: {
      a: [0,null,null],
      b: [1,null,1],
      c: [1,1,1],
      d: [2, null, 2]
    }
  },
]

inputs.forEach(function (e) {
  if(e)
    tape('traverse:'+(e.name || JSON.stringify(e.graph)), function (t) {
      console.log(e.graph)
      var h =
        {a: [0,null,null]}
      var output = reachable(
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

inputs.forEach(function (e) {
  if(e)
    tape('traverse partial:'+e.name, function (t) {
      var g = e.graph
      var full = {a: [0,null,null]}
      full = reachable(e.graph, e.max || 2, full, full, 'a')
      console.log('full:', full)
      for(var j in g) {
        for(var k in g[j]) {
          console.log('---')
          console.log(g)
          var _g = JSON.parse(JSON.stringify(g))
          delete _g[j][k]
          var h = {a:[0,null,null]}
          var _hops = reachable(_g, e.max || 2, h, h, 'a')
          console.log('part:', _hops)
          console.log('edge:', j,k,g[j][k])
          t.deepEqual(h.a, [0,null, null])
          _g[j][k]=g[j][k]
          var hops = {}
          if(g[j][k] >= 0 && reachable.update(_g, e.max||2, hops, _hops, j, k)) {
            hops = reachable(_g, e.max||2, _hops, hops, k)
          }
          else if (false) {
            /*
              I had thought that maybe I could recalculate
              just the paths to K, when someone blocked K,
              but we'd need to recalculate the paths out of K too.
              If we had two way links on our graph structure
              something like this would work. but not one way.
            */
            //console.log("REFLOW", j, k, g[j][k])
            delete hops[k]
            for(var i in g) {
              if(g[i][k] != null) {
                reachable.update(_g, e.max||2, hops, _hops, i, k)
              }
            }
          }
          else {
            next = {a:true}
            var hops2 = _hops
            hops = {a:[0,null, null]}
            hops = reachable(_g, e.max||2, hops, hops, 'a')
            //diff
            for(var k in _hops)
              if(!hops[k])
                hops[k] = null
          }

          console.log('patch', hops)
          t.deepEqual(merge(hops, _hops), e.hops)
        }
      }
      t.end()
    })
})



