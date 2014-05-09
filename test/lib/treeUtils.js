var treeUtils = require("../../lib/treeUtils")
var assert = require("assert")

/*
  {
    "foo": {
      "bar": { // priority 1
        "baz": {
          "beep": 1, // priority 1
          "boop": 2 // priority 1
        },
        "bat": 4 // priority 2
      }
    }
  }
*/
var docs = [
  {
    name: "bar",
    path: ["/foo", "/foo/bar"],
    parentPath: "/foo",
    ".value" : null,
    ".priority" : 1
  },
  {
    name: "beep",
    path: ["/foo", "/foo/bar", "/foo/bar/baz", "/foo/bar/baz/beep"],
    parentPath: "/foo/bar/baz",
    ".value" : 1,
    ".priority" : 1,
  },
  {
    name: "boop",
    path: ["/foo", "/foo/bar", "/foo/bar/baz", "/foo/bar/baz/boop"],
    parentPath: "/foo/bar/baz",
    ".value" : 1,
    ".priority" : 1
  },
  {
    name: "bat",
    path: ["/foo", "/foo/bar", "/foo/bar/bat"],
    parentPath: "/foo/bar",
    ".value" : 4,
    ".priority" : 2
  }
]

var expect = {
  bar: {
    ".priority": 1,
    ".value": {
      baz: {
        ".value": {
          beep: {
            ".priority" : 1,
            ".value" : 1
          },
          boop:  {
            ".value" : 1,
            ".priority" : 1
          }        
        },
      },
      bat: {
        ".value" : 4,
        ".priority" : 2
      } 
    }
  }
}

describe("tree utils", function() {
  describe("reduce tree", function() {
    var res = treeUtils.reduceTree(docs, ["/foo"])
    assert.deepEqual(res, expect)
  })
})