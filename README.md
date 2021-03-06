# reach

This is a reimplementation of the logic used by ssb-friends.

Turns out the idea in ssb-friends@2 was basically right,
but the code was too ugly to really be sure of that,
and it wasn't obviously easy to add support for new ideas
that were needed by [ssb-same-as](https://github.com/ssbc/ssb-same-as) or [user-invites](https://github.com/dominictarr/user-invites).

## hops

The core idea is that this library calculates a portion of a graph
that is reachable according to certain rules. Currently, it's
assumed that the basic idea determining reachability is the shortest
path distance from a starting point (i.e. your identity) to another
peer, which can be calculated efficiently via a width first expansion
of the graph. The approach used can also represent the removal of
edges (or the addition of "negative edges" such as "unfollow" or
"block") but it has to recalculate the whole traversal in this situation.
(however, in practice, we see that adding edges is very common
but removing edges significantly less so)

## api

## createReachable({reduce, isUpdate, isExpand, initial, isRemove) => {traverse, update, realtime}

construct a `traverser` given a set of options (`reduce`, `isUpdate`, `isExpand`, `initial`, and `isRemove`)
functions.

### traverser.realtime (graph, max, hops, start, j, k) => new_hops

for a `graph`, a `max` setting, a `hops` object, the `start` and `j`->`k` of a just-added
edge. returns `hops` that are now accessible with the addition of `j->k`.
mutates `hops`, so when this returns `hops` will include `new_hops`

### traverser.traverse (graph, max, old_hops, new_hops, start)

beginning at `start`, traverse `graph` expanding `old_hops`
up until `max`. The output is mutated `new_hops`.

### traverser.update(graph, max, old_hops, new_hops, from, to) => boolean

Expand a single edge `from`->`to` into `new_hops`. Returns true
if an update was made and there are thus more edges to expand.
if so, call `traverser(graph, max, old_hops, new_hops, start=to)`



## options

The way that traverser works is defined by an options object.
Two options are provided: `reach/simple` which uses a positive
integer to track hop distance. And `reach/block` which can represent blocks,
same-as and follow but not follow foafs, using a 3-tuple of `[in_hop_dist, out_hop_dist, block_dist]`

### reduce (src_state, dest_state, change) => new_state

Applies a `change` edge from a `src_state` to a destination
returning a `new_state`. the `new_state` may or may not supercede
the `dest_state`, because the path through this source might
not be the shortest.

### isUpdate (new_state, old_state) => boolean

Returns true if `new_state` should supercede `old_state`,
that is, if `new_state` represents a shorter path than `old_state`.
This is called by the traverser on the output of `reduce`.

### isExpand (new_state, max) => boolean

If `new_state` is considered less than `max` return true,
which causes the traverser continue expanding
paths from this node.

### isRemove (change)

returns true if this `change` will remove an edge.

### initial ()

returns the representation for `start`.

## License

MIT









