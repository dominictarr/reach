module.exports = [
  {
    name: 'single follow',
    graph: {
      a: {b: 1}
    },
    hops: {
      a: [0,null,0], //should a[2] be 0?
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
      a: [0,null,0],
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
      a: [0,null,0],
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
      a: [0,null,0],
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
      a: [0,null,0],
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
      a: [0,null,0],
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
      a: [0,null,0],
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
      a: [0,null,0],
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
      a: [0,null,0],
      b: [1,null,1],
      c: [1,1,1],
      d: [2, null, 2]
    }
  },
  {
    name: 'clique',
    graph: {
      a: {b: 1, c:1, a:1},
      b: {a: 1, c: 1},
      c: {a: 1, b: 1},
    },
    max: 3,
    hops: {
      a: [0,null,0],
      b: [1,null,1],
      c: [1,null,1],
    }
  },
  {
    name: 'empty',
    graph: {},
    max: 3,
    hops: {
      a: [0, null, 0]
    }
  },
  {
    name: 'other',
    graph: {b: {a: 1}},
    max: 3,
    hops: {
      a: [0, null, 0]
    }
  },
  {
    name: 'other2',
    graph: {b: {a: 1, b: 1}, a: {b: 1}},
    max: 3,
    hops: {
      a: [0, null, 0],
      b: [1, null, 1]
    }
  },
  {
    name: 'random',
    graph: {"a":{"e":2,"c":1},"b":{"e":1,"b":2},"c":{"f":1},"d":{"e":2,"a":1},"e":{"f":1,"a":2},"f":{"b":2,"d":2}},
    max: 3,
    hops:
      {"a":[0,null,0],"e":[2,null,2],"c":[1,null,1],"f":[2,null,2],"b":[4,null,4],"d":[4,null,4]}

  }
]




