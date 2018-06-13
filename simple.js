function min (a, b) {
  return a == null ? b : b == null ? a : a < b ? a : b
}

module.exports = {
  reduce: function (from, to, value) {
    if(to == null) return from + value
    return min(from+value, to)
  },
  isUpdate: function (_new, dst) {
    if(dst == null) return true
    return _new < dst
  },
  isExpand: function (value, max) {
    return value <= max
  },
  initial: function () { return 0 },
  isRemove: function (v) {
    //javascript wtf: (null >= 0) !== (null > 0 || null == 0)
    return v > 0 || v == 0
  }
}

