'use strict'
function isEmpty (g) {
  for(var k in g) return false
  return true
}

function min (a, b) {
  return a == null ? b : b == null ? a : a < b ? a : b
}

function reduce (from, to, value) {
  if(to == null) return from + value
  return min(from+value, to)
}

function update (_new, dst) {
  if(dst == null) return true
  return _new < dst
}

function defined (a, b) {
  return a == null ? b : a
}

function expand (value, max) {
  return value <= max
}

function inject (reduce, update, expand) {

  function _update (g, max, hops, _hops, j, k) {
    var src = defined(hops[j], _hops[j])
    if(!expand(src, max)) return false
    var dst = defined(hops[k], _hops[k])
    var _new = reduce(src, dst, g[j][k])
    if(update(_new, dst)) {
      hops[k] = _new
      return expand(_new, max)
    }
  }

  function alg (g, max, _hops, hops, start) {
    hops = hops || _hops
    var next = {}
    next[start] = true
    while(!isEmpty(next)) {
      for(var j in next) {
        for(var k in g[j]) {
          if(_update(g, max, hops, _hops, j, k))
            next[k] = true
        }
        delete next[j]
      }
    }
    return hops
  }

  alg.update = _update

  return alg

  //I also tried this with various random graphs and especially on very very large graphs
  //the above was faster. (but is only feasibly on recent node were delete is fast!)

  function alg2 (g, max, _hops, next, hops) {
    hops = hops || _hops
    var queue = Object.keys(next)
    var l = 0
    while(l < queue.length) {
      var j = queue[l++]
      if(hops[j] == null)
        hops[k] = next[j]
      for(var k in g[j]) {
        if(_update(g, max, hops, _hops, j, k))
          queue.push(k)
      }
    }
    return hops
  }

}

module.exports = inject(reduce, update, expand)
module.exports.inject = inject

