
// mocks for now!
module.exports = function() {
  function Validator() {
  }
  Validator.prototype.canWrite = function(user, key, val, cb) {
    cb(null, true)
  }
  Validator.prototype.canRead = function(user, key, cb) {
    cb(null, true)
  }
  // error will be true if a bad username or pass
  Validator.prototype.loadUser = function(username, password, cb) {
    cb()
  }
  Validator.prototype.middleware = function() {
    var self = this
    return function (req, res, next) {
      self.loadUser(req.username, self.password, function(err, user) {
        if (err) return next(err)
        req.user = user
        next()
      })
    }
  }

  return Validator
}
