var container = require("../config")
var assert = require("assert")

var BacksidePersistence = container.get("BacksidePersistence")
var persistor = container.get("persistor")
var api = new BacksidePersistence(persistor)
describe("BacksidePersistence", function() {
  describe("get", function() {
    it("should be able to retrieve a key that stores just a value", function(done) {
      api.get("/simpleString", function(err, result) {
        if (err) throw err
        done()
      })
    })
    it("should be able to retrieve a key that stores a tree", function(done) {
      api.get("/treeKey", function(err, result) {
        if (err) throw err
        // check tree
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
