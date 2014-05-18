
module.exports = function(messenger, persistence, validator) {
  return {
    set: function(user, key, val, priority, cb) {
      validator.canWrite(user, key, val, function(err, allowed) {
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
      validator.canRead(user, key, function(err, allowed) {
        if (err) return cb(err)
        if (!allowed) return cb(new Error("not allowed"))

        persistence.get(key, cb)
      })
    },
    remove: function(user, key, cb) {
      validator.canWrite(user, key, null, function(err, allowed) {
        if (err) return cb(err)
        if (!allowed) return cb(new Error("not allowed"))

        persistence.remove(key, cb)
      })
    },
    loadUser: function(username, password, cb) {
      validator.loadUser(username, password, cb)
    }
  }
}
