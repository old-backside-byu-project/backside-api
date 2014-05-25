var SortedMap = require("collections/sorted-map")

function comparePriorities(p1, p2) {
  var t1 = typeof p1
  var t2 = typeof p2

  if (t1 === "number" && t2 === "string") {
    return -Infinity
  } else if (t1 === "string" && t2 === "number") {
    return Infinity
  } else if (t1 === "number" && t2 === "number") {
    return p1-p2
  } else if (t1 === "string" && t2 === "string") {
    if      (p1 < p2) return -Infinity
    else if (p1 > p2) return Infinity
    else              return 0
  }
}

function compare(a, b) {
  switch (true) {
    case a.hasPriority() && !b.hasPriority():
      return Infinity
    case !a.hasPriority() && b.hasPriority():
      return -Infinity
    case a.hasPriority() && b.hasPriority():
      var comparison = comparePriorities(a.priority, b.priority)
      if (comparison !== 0) return comparison
    default:
      return comparePriorities(a.key, b.key)
  }
}

function equals(a, b) {
  return a.key === b.key
}

function emptyMap() {
  return new SortedMap([], equals, compare)
}

module.exports = emptyMap