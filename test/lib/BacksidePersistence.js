var container = require("../config")
var assert = require("assert")

var BacksidePersistence = container.get("BacksidePersistence")
var api = new BacksidePersistence()
describe("BacksidePersistence", function() {
	describe("get", function() {
		it("should be able to retrieve a key that stores just a value", function(done) {
			api.get("/simpleString", function(err, result) {
				if (err) throw err
			})
		})
		it("should be able to retrieve a key that stores a tree", function(done) {
			api.get("/treeKey", function(err, result) {
				if (err) throw err
				// check tree
			})

		})
		it("should give a null for a non-existent key", function(done) {
			api.get("/fakekey", function(err, result) {
				if (err) throw err
				assert.isNull(result)
				done()
			})

		})
		it("should return an error for an illegal key", function(done) {
			api.get("/")
		})
	})

	describe("set", function() {
		it("should be able to set a simple string key", function(done) {
			api.set("/setString", "foo", function(err, val) {
				if (err) throw err
				assert.equal(val, "foo")
				done()
			})
		})
		it("should be able to set a tree as a key", function(err, val) {
			var t = {
				"foo" : "bar"
			}
			api.set("/setTree", t, function(err, val) {
				if (err) throw err
				assert.deepEqual(val, t)
				done()
			})
		})
	})
	// remove
})