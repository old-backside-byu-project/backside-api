var container = require("../config")
var assert = require("chai").assert

var BacksidePersistence = container.get("BacksidePersistence")
var MongoPersistor = container.get("MongoPersistor")
var MemoryPersistor = container.get("MemoryPersistor")

function removeNullPriorities(obj) {
  if (obj.priority === null || obj.priority === undefined) {
    delete obj.priority
  }

  for (var prop in obj) {
    if (Object.prototype.toString.call(obj[prop]) === "[object Object]") {
      removeNullPriorities(obj[prop])
    }
  }

  return obj
}

var mongoPersistor = new MongoPersistor(container.get("MONGODB_URL"))
var memoryPersistor = new MemoryPersistor()

;([
  {
    name: "MongoPersistor",
    persistor: mongoPersistor,
    setup: function(done) {
      // return done()
      mongoPersistor.collection.drop(function(err) {
        if (err) return done(err)
        mongoPersistor.create([
          {
            name: "bar",
            path: ["/", "/foo", "/foo/bar"],
            parentPath: "/foo",
            value : null,
            priority : 1
          },
          {
            name: "beep",
            path: ["/", "/foo", "/foo/bar", "/foo/bar/baz", "/foo/bar/baz/beep"],
            parentPath: "/foo/bar/baz",
            value : 1,
            priority : 1,
          },
          {
            name: "boop",
            path: ["/", "/foo", "/foo/bar", "/foo/bar/baz", "/foo/bar/baz/boop"],
            parentPath: "/foo/bar/baz",
            value : 1,
            priority : 1
          },
          {
            name: "bat",
            path: ["/", "/foo", "/foo/bar", "/foo/bar/bat"],
            parentPath: "/foo/bar",
            value : 4,
            priority : 2
          }
        ], done)
      })
    }
  },
  {
    name: "MemoryPersistor",
    persistor: memoryPersistor,
    setup: function(done) {
      memoryPersistor.set("/foo/bar", "null", 1)
      memoryPersistor.set("/foo/bar/baz/beep", 1, 1)
      memoryPersistor.set("/foo/bar/baz/boop", 1, 1)
      memoryPersistor.set("/foo/bar/bat", 4, 2)
      done()
    }
  }
]).forEach(function(test) {
  var api = new BacksidePersistence(test.persistor)
  describe(test.name, function() {
    before(test.setup)

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
          done()
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
})
