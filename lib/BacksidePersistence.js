function BacksidePersistence(store) {
  if (!store) throw new Error("missing required store parameter")
  this.store = store
}

/*

https://www.firebase.com/docs/creating-references.html#firebase-location-limitations
The Firebase Name may contain any unicode characters except:

. (period)
$ (dollar sign)
[ (left square bracket)
] (right square bracket)
# (hash or pound sign)
/ (forward slash)
ASCII Controll Characters (0-31 and 127)
The Child Path has the same character restrictions, with the exception of / (forward slash). The / is allowed and is used to specify a child path (for example: /user/first/name). A Child Path can not be more than 768 characters long and no more than 32 levels deep (the path /user/first/name is 3 levels deep).

*/

//var KEY_VALIDATOR = /[]/
BacksidePersistence.prototype.get = function(key, cb) {
  var keyError = this.validateKey(key)
  if (keyError) return cb(keyError)
  this.store.get.apply(this.store, arguments)
}

BacksidePersistence.prototype.set = function(key, val, priority, cb) {
  var keyError = this.validateKey(key)
  if (keyError) return cb(keyError)
  if (typeof priority === "function") {
    cb = priority
    priority = null
  }

  this.store.set(key, val, priority, cb)
}

BacksidePersistence.prototype.remove = function(key, cb) {
  var keyError = this.validateKey(key)
  if (keyError) return cb(keyError)
  this.store.remove.apply(this.store, arguments)
}
BacksidePersistence.prototype.privateGet = function(key, cb) {
  var keyError = this.validateKey(key)
  if (keyError) return cb(keyError)
  this.store.privateGet(key, cb)
}

BacksidePersistence.prototype.privateSet = function(key, val, priority, cb) {
  var keyError = this.validateKey(key)
  if (keyError) return cb(keyError)
  if (typeof priority === "function") {
    cb = priority
    priority = null
  }
  this.store.privateSet(key, val, priority, cb)
}

BacksidePersistence.prototype.privateRemove = function(key, cb) {
  var keyError = this.validateKey(key)
  if (keyError) return cb(keyError)
  this.store.privateRemove(key, cb)
}

BacksidePersistence.prototype.validateKey = function(key, val) {
  if (key.length > 768) return new Error("key path too long (greater than 768)")
  if (key.split("/").length > 32) return new Error("key path too deep (greater than 32)")
  return null
}

BacksidePersistence.prototype.getStore = function() {
  return this.store
}

module.exports = function() {
  return BacksidePersistence
}
