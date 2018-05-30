
var traverse = require('../')

var tape = require('tape')

tape('simple', function (t) {

  var hops =
  traverse({
    a: {b: 1},
    b: {c: 1}
  },
  2,
  {a:0},
  {a:0}
  )

  t.deepEqual(hops, {a: 0, b: 1, c:2})
  t.end()

})



