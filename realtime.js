var inject = require('./').inject

function isEmpty (e) {
  for(var k in e) return false
  return true
}

module.exports = function (opts) {
  var reachable = inject(opts.reduce, opts.update, opts.expand)
  return function (g, max, _hops, start, j, k) {
    var hops
    if(isEmpty(_hops)) {
      hops = _hops
      _hops[start] = [0, null, 0]
      return hops = reachable(g, max, _hops, hops, start)
    }
    else if(!opts.isRemove(g[j][k])) {
      hops = {}
      //this could be refactored to process many edges in one go, but this works for now.
      if(reachable.update(g, max, _hops, hops, j, k))
        hops = reachable(g, max, _hops, hops, k)

      for(var k in hops) //apply "patch" (there should not be any deletes)
        _hops[k] = hops[k]
      return hops
    } else {
      //if there is a block or unfollow, something has been removed
      //it may be there are some peers which were reachable, but now are not
      //to find out, traverse the whole graph then compare with original.
      hops = {}
      hops[start] = opts.initial()
      hops = reachable(g, max, hops, hops, start)

      for(var k in _hops) //check for anything that's been removed.
        if(!hops[k]) hops[k] = null

      for(var k in hops) //apply patch, including deletes.
        if(hops[k]) _hops[k] = hops[k]
        else        delete _hops[k]

      return hops
    }
  }
}

