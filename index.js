'use strict'
function isEmpty (g) {
  for(var k in g) return false
  return true
}


function defined (a, b) {
  return a == null ? b : a
}

function inject (opts) {

  function update (g, max, _hops, hops, j, k) {
    var src = defined(hops[j], _hops[j])
    if(src == undefined) return false
    if(!opts.isExpand(src, max)) return false
    var dst = defined(hops[k], _hops[k])
    var _new = opts.reduce(src, dst, g[j][k])
    if(opts.isUpdate(_new, dst)) {
      hops[k] = _new
      return opts.isExpand(_new, max)
    }
  }

  function traverse (g, max, _hops, hops, start) {
    hops = hops || _hops
    var next = {}
    next[start] = true
    while(!isEmpty(next)) {
      for(var j in next) {
        for(var k in g[j]) {
          if(update(g, max, _hops, hops, j, k))
            next[k] = true
        }
        delete next[j]
      }
    }
    return hops
  }

  function realtime (g, max, _hops, start, j, k) {
    var hops
    if(isEmpty(_hops)) {
      hops = _hops
      _hops[start] = [0, null, 0]
      return hops = traverse(g, max, _hops, hops, start)
    }
    else if(!opts.isRemove(g[j][k])) {
      hops = {}
      //this could be refactored to process many edges in one go, but this works for now.
      if(update(g, max, _hops, hops, j, k))
        hops = traverse(g, max, _hops, hops, k)

      for(var k in hops) //apply "patch" (there should not be any deletes)
        _hops[k] = hops[k]
      return hops
    } else {
      //if there is a block or unfollow, something has been removed
      //it may be there are some peers which were reachable, but now are not
      //to find out, traverse the whole graph then compare with original.
      hops = {}
      hops[start] = opts.initial()
      hops = traverse(g, max, hops, hops, start)

      for(var k in _hops) //check for anything that's been removed.
        if(!hops[k]) hops[k] = null

      for(var k in hops) //apply patch, including deletes.
        if(hops[k]) _hops[k] = hops[k]
        else        delete _hops[k]

      return hops
    }
  }

  return {
    traverse: traverse,
    update: update,
    realtime: realtime
  }

}

module.exports = inject



