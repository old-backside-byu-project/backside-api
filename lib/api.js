
module.exports = function(messenger, persistence, security, auth) {
  return {
    set: function(user, key, val, priority, cb) {
      security.canWrite(user, key, val, function(err, allowed) {
        if (err) return cb(err)
        if (!allowed) return cb(new Error("not allowed"))

        persistence.set(key, val, priority, function(err, message) {
          if (err) return cb(err)
          messenger.updateKey(key, message, function(err) {
            if (err) return cb(err)

            cb(null, message)
          })
        })
      })
    },

    get: function(user, key, cb) {
      security.canRead(user, key, function(err, allowed) {
        if (err) return cb(err)
        if (!allowed) return cb(new Error("not allowed"))

        persistence.get(key, cb)
      })
    },
    remove: function(user, key, cb) {
      security.canWrite(user, key, null, function(err, allowed) {
        if (err) return cb(err)
        if (!allowed) return cb(new Error("not allowed"))

        persistence.remove(key, cb)
      })
    },
    loadUser: function(username, password, cb) {
      auth.loadUser(username, password, cb)
    }
  }
}
