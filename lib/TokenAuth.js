var jwt = require("jsonwebtoken")

module.exports = function() {
  function TokenAuth(secret) {
    this.secret = secret
  }
  //take an object and validate, returns cb(err, userObj), where userObj is null
  // if no user can be found
  TokenAuth.prototype.loadUser = function(token, cb) {
    if (token == null || token.length === 1) {
      return cb()
    }
    var userObj = jwt.verify(token, this.secret, function(err, userObj) {
      // swallow errors, userObj will be undefined if wrong
      cb(null, !!userObj, userObj)
    })
  }
  TokenAuth.prototype.middleware = function() {
    var self = this
    return function (req, res, next) {
      self.loadUser(req.query.auth, function(err, isValid, user) {
        if (err) return next(err)
        req.user = user
        next()
      })
    }
  }

  return TokenAuth
}
