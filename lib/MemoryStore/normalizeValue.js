var Key = require("./Key")
var emptyMap = require("./emptyMap")

module.exports = function normalizeValue(val) {
  switch(Object.prototype.toString.call(val)) {
    case "[object Object]":
      var keys = Object.keys(val)
      if (!keys.length) return null

      var map = emptyMap()
      for (var i = keys.length - 1; i >= 0; i--) {
        var child = normalizeValue(val[keys[i]])
        if (child === null) continue
        map.set(new Key(keys[i]), child)
      }

      if (!map.length) return null

      return map
    case "[object Array]":
      if (!val.length) return null

      var map = emptyMap()
      for (var i = val.length - 1; i >= 0; i--) {
        var child = normalizeValue(val[i])
        if (child === null) continue
        map.set(new Key(i), child)
      }

      if (!map.length) return null

      return map
    default:
      if (val === false || val === undefined || val === null)
        return null
      return val
  }
}