function Key(key, priority) {
  this.key = +key || key
  this.priority = +priority || priority
}

Key.prototype.hasPriority = function hasPriority() {
  return this.priority !== undefined
}

Key.prototype.toString = function toString() {
  return "KEY: " + this.key + (this.priority ? " (" + this.priority + ")" : "")
}

module.exports = Key