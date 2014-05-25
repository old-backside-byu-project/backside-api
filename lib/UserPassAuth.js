var bcrypt = require("bcrypt")
var jwt = require("jsonwebtoken")

module.exports = function(logger, treeUtils) {
  function UserPassAuth(persistence, opts) {
    opts = opts || {}
    this.persistence = persistence
    this.userKey = opts.userPath || "/_users/"
    this.saltIter = opts.saltIterations || 4
    this.expire = opts.expire || 1440
    this.secret = opts.secret || (function() {
      logger.log("warn", "using default encyption secret! don't do this in prod!")
      return "really bad default token, please don't user this in prod"
    })()
  }

  UserPassAuth.prototype.loadUser = function(username, password, cb) {
    this.getUser(username, function(err, userObj) {
      if (err) return cb(err)
      if (!userObj) return cb(null, false)
      bcrypt.compare(password, userObj.hash, function(err, isValid) {
        if (err) return cb(err)
        if (!isValid) return cb(null, false)
        cb(null, true, userObj.user)
      })
    })
  }

  //take an object and validate, returns cb(err, userObj), where userObj is null
  // if no user can be found
  UserPassAuth.prototype.addUser = function(username, password, details, cb) {
    var self = this
    details = details || {}
    details.username = username
    // salt is stored as part of hash
    bcrypt.hash(password, this.saltIter, function(err, encrypted) {
      if (err) return cb(err)
      var payload = {
        hash: encrypted,
        method: "bcrypt",
        user: details
      }
      self.persistence.privateSet(self.userKey + username, payload, function(err) {
        if (err) return cb(err)
        cb(null, details)
      })
    })
  }

  UserPassAuth.prototype.userExists = function(username, cb) {
    this.getUser(username, function(err, obj) {
      cb(err, !!obj)
    })
  }


  UserPassAuth.prototype.getUser = function(username, cb) {
    this.persistence.privateGet(this.userKey + username, function(err, userObj) {
      cb(null, treeUtils.collapseTree(userObj))
    })
  }

  UserPassAuth.prototype.genToken = function(userObj) {
    return jwt.sign(userObj, this.secret, {expireInMinutes: this.expire})
  }

  UserPassAuth.prototype.decodeToken = function(token, cb) {
    jwt.verify(token, this.secret, function(err, decoded) {
      if (err) return cb(false)
      cb(!!decoded, decoded)
    })
  }

  // middleware is added to the top of the express routing chain
  // to validate a user
  // we allow for both cookie sessions
  // as well as the token being passed back
  UserPassAuth.prototype.middleware = function() {
    var self = this

    return function (req, res, next) {
      if (req.session.user) {
        req.user = req.session.user
        next()
      } else if (req.query.auth) {
        self.decodeToken(function(isValid, userObj) {
          if (!isValid) return res.json(401, {message: "Invalid token"})
          req.user = userObj
          next()
        })
      } else {
        next()
      }
    }
  }

  //
  UserPassAuth.prototype.getRoutes = function() {
    var self = this
    return {
      post: {
        "/_user/new" : function(req, res, next) {
          var username = req.body.username
          var password = req.body.password
          // stores any extra info you may want, email, etc
          var user = req.body.user || {}
          self.userExists(username, function(err, exists) {
            if (err) return next(err)
            if (exists) return res.json(409, {message: "User already exists with that username"})
            self.addUser(username, password, user, function(err, user) {
              if (err) return next(err)

              req.session.regenerate(function() {
                req.session.user = user
                res.json({token: self.genToken(user)})
              })
            })
          })
        },
        "/_user/login" : function(req, res, next) {
          if (!req.body.username || req.body.password) res.json(401, {message: "Missing username and/or password in request body"})
          self.loadUser(req.body.username, req.body.password, function(err, user) {
            if (err) return next(err)
            if (!user) return res.json(401, {message: "Invalid username or password"})
            req.session.regenerate(function() {
              req.session.user = user
              res.json({token: self.genToken(user)})
            })
          })
        }
      },
      get: {
        "/_user/status" : function(req, res, next) {
          res.json({loggedin: !!req.user})
        }
      },
      delete: {
        "/_user/logout" : function(req, res, next) {
          if (!req.session) return res.send()
          res.session.destroy(function(err) {
            if (err) return next(err)
            res.send()
          })
        }
      }
    }
  }


  return UserPassAuth
}
