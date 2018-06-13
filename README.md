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

## Inject(reduce, isUpdate, isExpand) => traverser

construct a `traverser` given a `reduce` `isUpdate` and `isExpand` function.

the `traverser` takes a graph, and some parameters such as
a `max` and a `start` point, and calculates (or updates)
a `hops` object. The hops object is a mapping from node ids to hop
states.

The simplest design would be for hop state to be a integer
which defined the shortest path distance from the start to that node,
however to represent same-as and block, the hop state is a
3-tuple of `[in_hop_dist, out_hop_dist, block_dist]`

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

## traverser (graph, max, old_hops, new_hops, start)

beginning at `start`, traverse `graph` expanding `old_hops`
up until `max`. The output is mutated `new_hops`.

## traverser.update(graph, max, old_hops, new_hops, from, to) => boolean

Expand a single edge `from`->`to` into `new_hops`. Returns true
if an update was made and there are thus more edges to expand.
if so, call `traverser(graph, max, old_hops, new_hops, start=to)`



## License

MIT


