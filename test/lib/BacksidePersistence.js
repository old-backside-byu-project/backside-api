var container = require("../config")
var assert = require("chai").assert

var BacksidePersistence = container.get("BacksidePersistence")
var persistorName = process.env.PERSISTOR || "backside-memory-store"
var PersistorUnderTest = require(persistorName)

function removeNullPriorities(obj) {
  if (obj.priority == null) {
    delete obj.priority
  }

  for (var prop in obj) {
    if (typeof obj[prop] === "object") {
      removeNullPriorities(obj[prop])
    }
  }

  return obj
}

describe("backside persistence - " + persistorName, function() {
  var api = null
  before(function(done) {
    PersistorUnderTest.createTestInstance(function(err, persistor) {
      if (err) return done(err)
      api = new BacksidePersistence(persistor)
      done()
    })
  })

  describe("get", function() {
    it("should be able to retrieve a key that stores just a value", function(done) {
      api.get("/foo/bar/bat", function(err, result) {
        if (err) throw err
        assert.deepEqual(removeNullPriorities(result), {value: 4, priority: 2})
        done()
      })
    })
    it("should be able to retrieve a key that stores a tree", function(done) {
      api.get("/foo/bar/baz", function(err, result) {
        if (err) throw err
        assert.deepEqual(removeNullPriorities(result), {
          beep: {
            value: 1,
            priority: 1
          },
          boop: {
            value: 1,
            priority: 1
          }
        })
        done()
      })
    })
    it("should be able to retrieve most of the tree", function(done) {
      api.get("/foo/bar", function(err, result) {
        if (err) throw err
        assert.deepEqual(removeNullPriorities(result), {
          baz: {
            value: {
              beep: {
                value: 1,
                priority: 1
              },
              boop: {
                value: 1,
                priority: 1
              }
            }
          },
          bat: {
            value: 4,
            priority: 2
          }
        })
        done()
      })
    })

    it("should be able to retrieve the whole the tree", function(done) {
      api.get("/", function(err, result) {
        if (err) throw err
        assert.deepEqual(removeNullPriorities(result), {
          foo: {
            value: {
              bar: {
                value: {
                  baz: {
                    value: {
                      beep: {
                        value: 1,
                        priority: 1
                      },
                      boop: {
                        value: 1,
                        priority: 1
                      }
                    }
                  },
                  bat: {
                    value: 4,
                    priority: 2
                  }
                },
                priority: 1
              }
            }
          }
        })
        done()
      })
    })

    it("should give a null for a non-existent key", function(done) {
      api.get("/fakekey", function(err, result) {
        if (err) throw err
        assert.equal(result, null)
        api.get("/totally/not/real/key", function(err, result) {
          if (err) throw err
          assert.equal(result, null)
          done()
        })
      })
    })

    it("should return an error for an illegal key", function(done) {
      // TODO: fix this
      api.get("/", function(err) {
        done()
      })
    })
  })

  describe("set", function() {
    it("should be able to set a simple string key", function(done) {
      api.set("/root/setString", "foo", function(err, val) {
        if (err) throw err
        assert.deepEqual(removeNullPriorities(val), {value: "foo"})
        done()
      })
    })
    it("should be able to set a tree as a key", function(done) {
      var t = {
        "foo" : "bar"
      }
      api.set("/root/setTree", t, function(err, val) {
        if (err) throw err
        assert.deepEqual(removeNullPriorities(val), {"foo":{"value":"bar"}})
        done()
      })
    })
  })
  // remove
})
