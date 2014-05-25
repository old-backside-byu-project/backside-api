module.exports = function nextTick(fn) {
  if (!fn) return
  var args = Array.prototype.slice.call(arguments, 1)
  process.nextTick(function() {
    fn.apply(this, args)
  })
}