var SortedMap = require("collections/sorted-map")

var Key = require("./Key")
var emptyMap = require("./emptyMap")
var valToJSON = require("./valToJSON")
var normalizeValue = require("./normalizeValue")
var nt = require("./nextTick")

var _root = emptyMap()

function pathArray(path) {
  return path.split("/").filter(function(p) {
    return p !== ""
  })
}

var pathPriority = require("./pathPriority")
var lookupKey = (function() {
  var _key = new Key()
  return function lookupKey(key, path) {
    _key.key = +key || key
    _key.priority = pathPriority.get(path)
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
  var currentPath = ""
  while (ancestors.length) {
    if (parent instanceof SortedMap) {
      var currentKey = ancestors.shift()
      currentPath += ("/" + currentKey)
      parent = parent.get(lookupKey(currentKey, currentPath))
    } else {
      return nt(cb, null, null)
    }
  }

  var lk = lookupKey(key, "/" + this.name + path)
  var val = parent.get(lk)
  if (val === undefined) {
    return nt(cb, null, null)
  } else if (val instanceof SortedMap) {
    return nt(cb, null, valToJSON(val))
  } else {
    var ret = {value: val}
    if (lk.priority !== undefined) ret.priority = lk.priority
    return nt(cb, null, ret)
  }
}

MemoryStore.prototype.set = function(path, val, priority, cb) {
  val = normalizeValue(val)
  if (val === null) return this.remove(path, cb)

  var ancestors = pathArray(path)
  ancestors.unshift(this.name)
  var key = ancestors.pop()

  var parent = _root
  var currentPath = ""
  while (ancestors.length) {
    var ancestor = ancestors.shift()
    currentPath += ("/" + ancestor)
    var newParent = parent.get(lookupKey(ancestor, currentPath))
    
    if (newParent instanceof SortedMap) {
      parent = newParent
    } else {
      newParent = emptyMap()
      parent.set(new Key(ancestor, pathPriority.get(currentPath)), newParent)
      parent = newParent
    }
  }

  parent.set(new Key(key, priority), val)
  pathPriority.set("/" + this.name + path, priority)

  if (val instanceof SortedMap) {
    return nt(cb, null, valToJSON(val))
  } else {
    return nt(cb, null, {value: val, priority: null})
  }
}

MemoryStore.prototype.remove = function(path, cb) {
  var ancestors = pathArray(path)
  ancestors.unshift(this.name)
  var key = ancestors.pop()

  var stack = [_root]

  var parent = _root
  var currentPath = ""
  for (var i = 0; i < ancestors.length; i++) {
    var ancestor = ancestors[i]
    currentPath += ("/" + ancestor)
    var newParent = parent.get(lookupKey(ancestor, currentPath))
    if (!(newParent instanceof SortedMap)) return nt(cb, null)
    stack.push(newParent)
    parent = newParent
  }

  currentPath += ("/" + key)
  parent.delete(lookupKey(key, currentPath))

  stack.pop()
  currentPath = currentPath.split("/")
  currentPath.pop()
  while (stack.length) {
    if (parent.length) return nt(cb, null)
    parent = stack.pop()
    parent.delete(lookupKey(ancestors[--i]))
    pathPriority.remove(currentPath.join("/"))
    currentPath.pop()
  }

  return nt(cb, null)
}

module.exports = MemoryStore