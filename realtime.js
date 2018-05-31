var block = require('./block')
var inject = require('./').inject
var reachable = inject(block.reduce, block.update, block.expand)

function isEmpty (e) {
  for(var k in e) return false
  return true
}

module.exports = function (g, max, _hops, start, j, k) {
  var hops
  if(isEmpty(_hops)) {
    hops = _hops
    _hops[start] = [0, null, 0]
    return hops = reachable(g, max, _hops, hops, start)
  }
  else if(g[j][k] >= 0) {
    hops = {}
    //this could be refactored to process many edges in one go, but this works for now.
    if(reachable.update(g, max, _hops, hops, j, k))
      hops = reachable(g, max, _hops, hops, k)

    for(var k in hops)
      _hops[k] = hops[k]
    return hops
  } else {
    //if there is a block or unfollow, something has been removed
    //it may be there are some peers which were reachable, but now are not
    //to find out, traverse the whole graph then compare with original.
    hops = {}
    hops[start] = [0, null, 0]
    hops = reachable(g, max, hops, hops, start)

    for(var k in _hops)
      if(!hops[k]) hops[k] = null

    for(var k in hops)
      if(hops[k]) _hops[k] = hops[k]
      else        delete _hops[k]

    return hops
  }
}








