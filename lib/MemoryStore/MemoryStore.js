var SortedMap = require("collections/sorted-map")

var Key = require("./Key")
var emptyMap = require("./emptyMap")
var mapToJSON = require("./mapToJSON")
var normalizeValue = require("./normalizeValue")
var nt = require("./nextTick")

var _root = emptyMap()

function pathArray(path) {
  return path.split("/").filter(function(p) {
    return p !== ""
  })
}

var lookupKey = (function() {
  var _key = new Key()
  return function lookupKey(key) {
    _key.key = +key || key
    return _key
  }
})()

function MemoryStore(name) {
  this.name = name || Math.random().toString(36).substring(12)
  _root.set(new Key(this.name), null)
}

MemoryStore.prototype.get = function(path, cb) {
  var ancestors = pathArray(path)
  ancestors.unshift(this.name)
  var key = ancestors.pop()

  var parent = _root
  while (ancestors.length) {
    if (parent instanceof SortedMap) {
      parent = parent.get(lookupKey(ancestors.shift()))
    } else {
      return nt(cb, null, null)
    }
  }

  var val = parent.get(lookupKey(key))
  if (val === undefined) {
    return nt(cb, null, null)
  } else if (val instanceof SortedMap) {
    return nt(cb, null, mapToJSON(val))
  } else {
    return nt(cb, null, val)
  }
}

MemoryStore.prototype.set = function(path, val, priority, cb) {
  val = normalizeValue(val)
  if (val === null) return this.remove(path, cb)

  var ancestors = pathArray(path)
  ancestors.unshift(this.name)
  var key = ancestors.pop()

  var parent = _root
  while (ancestors.length) {
    var ancestor = ancestors.shift()
    var newParent = parent.get(lookupKey(ancestor))
    
    if (newParent instanceof SortedMap) {
      parent = newParent
    } else {
      newParent = emptyMap()
      parent.set(new Key(ancestor), newParent)
      parent = newParent
    }
  }

  parent.set(new Key(key, priority), val)

  nt(cb, null, val)
}

MemoryStore.prototype.remove = function(path, cb) {
  var ancestors = pathArray(path)
  ancestors.unshift(this.name)
  var key = ancestors.pop()

  var stack = [_root]

  var parent = _root, i = 0
  for (var i = 0; i < ancestors.length; i++) {
    var ancestor = ancestors[i]
    var newParent = parent.get(lookupKey(ancestor))
    if (!(newParent instanceof SortedMap)) return nt(cb, null)
    stack.push(newParent)
    parent = newParent
  }

  parent.delete(lookupKey(key))

  stack.pop()
  while (stack.length) {
    if (parent.length) return nt(cb, null)
    parent = stack.pop()
    parent.delete(lookupKey(ancestors[--i]))
  }

  return nt(cb, null)
}

module.exports = MemoryStore