var container = require("../config")
var assert = require("chai").assert

var BacksidePersistence = container.get("BacksidePersistence")
var persistor = container.get("persistor")
var api = new BacksidePersistence(persistor)
describe("BacksidePersistence", function() {
  before(function(done) {
    persistor.collection.drop(function(err) {
      if (err) return done(err)
        persistor.create([
          {
            name: "bar",
            path: ["/foo", "/foo/bar"],
            parentPath: "/foo",
            value : null,
            priority : 1
          },
          {
            name: "beep",
            path: ["/foo", "/foo/bar", "/foo/bar/baz", "/foo/bar/baz/beep"],
            parentPath: "/foo/bar/baz",
            value : 1,
            priority : 1,
          },
          {
            name: "boop",
            path: ["/foo", "/foo/bar", "/foo/bar/baz", "/foo/bar/baz/boop"],
            parentPath: "/foo/bar/baz",
            value : 1,
            priority : 1
          },
          {
            name: "bat",
            path: ["/foo", "/foo/bar", "/foo/bar/bat"],
            parentPath: "/foo/bar",
            value : 4,
            priority : 2
          }
        ], done)
    })
  })

  describe("get", function() {
    it("should be able to retrieve a key that stores just a value", function(done) {
      api.get("/foo/bar/bat", function(err, result) {
        if (err) throw err
        assert.deepEqual(result, {value: 4, priority: 2})
        done()
      })
    })
    it("should be able to retrieve a key that stores a tree", function(done) {
      api.get("/foo/bar/baz", function(err, result) {
        if (err) throw err
        assert.deepEqual(result, {
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
        assert.deepEqual(result, {
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
      api.get("/foo", function(err, result) {
        if (err) throw err
        assert.deepEqual(result, {
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
        assert.deepEqual(val, {value: "foo", priority: null})
        done()
      })
    })
    it("should be able to set a tree as a key", function(done) {
      var t = {
        "foo" : "bar"
      }
      api.set("/root/setTree", t, function(err, val) {
        if (err) throw err
        assert.deepEqual(val, {"foo":{"priority":null,"value":"bar"}})
        done()
      })
    })
  })
  // remove
})
