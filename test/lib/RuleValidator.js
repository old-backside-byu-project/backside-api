var container = require("../config")
var assert = require("chai").assert
var rules = {
  "rules" : {
    "_write" : false,
    "_read" : true,
    "foo" : {
      "bar" : {
        "baz" : {
          "_write" : true,
          "_validate" : "newData.val() == 'things'"
        }
      },
      "bat" : {
        "_write" : true,
        "$stuff" : {
          "_read" : "$stuff.val() == 'beep'"
        }
      }
    },
    "users" : {
      "$user" : {
        "_validate" : "newData.hasChildren(['name'])",
        "name" : {
          "_validate" : "newData.hasChildren(['first', 'last'])",
          "first": {
            "_validate" : "newData.isString()"
          },
          "last": {
            "_validate" : "newData.isString()"
          }
        }
      }
    }
  }
}

var RuleValidator = container.get("RuleValidator")
describe("RuleValidator", function() {
  describe("extractRules", function() {
    it("should be able to extract rules from root of the tree", function() {
      // mock out persistence with simple object, it sgThouldn't be called
      var rv = new RuleValidator({})
      var rc = rv.extractRules(rules, "/", {beep: "boop"})
      assert.equal(rc.writes.length, 1)
      assert.equal(rc.writes[0], false)
      assert.equal(rc.reads.length, 1)
      assert.equal(rc.reads[0], true)
      assert.equal(rc.validators.length, 0)
      assert.equal(rc.scopes.length, 0)
    })
    it("should be able to extract rules from deeper in the tree", function() {
      // mock out persistence with simple object, it sgThouldn't be called
      var rv = new RuleValidator({})
      var rc = rv.extractRules(rules, "/foo/bar/baz", {beep: "boop"})
      assert.equal(rc.writes.length, 2)
      assert.equal(rc.writes[0], false)
      assert.equal(rc.writes[1], true)
      assert.equal(rc.reads.length, 1)
      assert.equal(rc.reads[0], true)
      assert.equal(rc.validators.length, 1)
      assert.equal(rc.validators[0], "newData.val() == 'things'")
      assert.equal(rc.scopes.length, 0)
    })
    it("should be able to extract rules even if the path doesn't have tree in the tree", function() {
      // mock out persistence with simple object, it sgThouldn't be called
      var rv = new RuleValidator({})
      var rc = rv.extractRules(rules, "/beep", {beep: "boop"})
      assert.equal(rc.writes.length, 1)
      assert.equal(rc.writes[0], false)
      assert.equal(rc.reads.length, 1)
      assert.equal(rc.reads[0], true)
      assert.equal(rc.validators.length, 0)
      assert.equal(rc.scopes.length, 0)
    })
    it("should be able to extract scopes", function() {
      // mock out persistence with simple object, it sgThouldn't be called
      var rv = new RuleValidator({})
      var rc = rv.extractRules(rules, "/foo/bat/twinky", {beep: "boop"})
      assert.equal(rc.writes.length, 2)
      assert.equal(rc.writes[0], false)
      assert.equal(rc.writes[1], true)
      assert.equal(rc.reads.length, 2)
      assert.equal(rc.reads[0], true)
      assert.equal(rc.reads[1], "$stuff.val() == 'beep'")
      assert.equal(rc.validators.length, 0)
      assert.equal(rc.scopes.length, 1)
      assert.equal(rc.scopes[0], "$stuff")
    })
    it("should be able to extract validators from the document", function() {
      // mock out persistence with simple object, it sgThouldn't be called
      var rv = new RuleValidator({})
      var rc = rv.extractRules(rules, "/users/addison", {name: {first: "addison", last: "dude"}})
      assert.equal(rc.writes.length, 1)
      assert.equal(rc.writes[0], false)
      assert.equal(rc.reads.length, 1)
      assert.equal(rc.reads[0], true)
      assert.equal(rc.validators.length, 4)
      assert.equal(rc.validators[0], "newData.hasChildren(['name'])")
      assert.equal(rc.validators[1], "newData.hasChildren(['first', 'last'])")
      assert.equal(rc.validators[2], "newData.isString()")
      assert.equal(rc.validators[3], "newData.isString()")
      assert.equal(rc.scopes.length, 1)
      assert.equal(rc.scopes[0], "$user")
    })
  })
  describe("ruleCompiler", function() {
    var util = require("util")
    it("should compile the rule", function() {
      var rv = new RuleValidator({})
      //console.log(util.inspect(rv.buildRule("root.child('users').child(auth.id).child('active').val() == true"), {depth: 8}))
      console.log(util.inspect(rv.buildRule("newData.val() || !that"), {depth: null}))
    })
  })
})
