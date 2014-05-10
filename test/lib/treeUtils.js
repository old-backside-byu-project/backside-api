var treeUtils = require("../../lib/treeUtils")
var assert = require("assert")
var difflet = require("difflet")

/*
  {
    "foo": {
  }
*/
var docs = [
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
]


describe("tree utils", function() {
  describe("reduce tree", function() {
    it("should be able to reduce docs back into a full tree", function() {
      var res = treeUtils.reduceTree(docs.slice(0), ["/foo"])
      assert.deepEqual(res, {
        bar: {
          priority: 1,
          value: {
            baz: {
              value: {
                beep: {
                  priority : 1,
                  value : 1
                },
                boop:  {
                  value : 1,
                  priority : 1
                }
              },
            },
            bat: {
              value : 4,
              priority : 2
            }
          }
        }
      })
    })
  })
  describe("build docs", function() {
    it("should be able to create docs from a tree", function() {
      var val = {
        "bar": { // priority 1
          "baz": {
            "beep": 1,
            "boop": 1
          },
          "bat": 4
        }
      }

      var res = treeUtils.buildDocs("bar", ["/foo"], val, 1)
      var expect = [
        {
          name: 'bar',
          path: [ '/foo', '/foo/bar' ],
          parentPath: '/foo',
          value: null,
          priority: 1
        },
        {
          name: 'beep',
          path: [ '/foo', '/foo/bar', '/foo/bar/baz', '/foo/bar/baz/beep' ],
          parentPath: '/foo/bar/baz',
          value: 1,
          priority: null
        },
        {
          name: 'boop',
          path: [ '/foo', '/foo/bar', '/foo/bar/baz', '/foo/bar/baz/boop' ],
          parentPath: '/foo/bar/baz',
          value: 1,
          priority: null
        },
        {
          name: 'bat',
          path: [ '/foo', '/foo/bar', '/foo/bar/bat' ],
          parentPath: '/foo/bar',
          value: 4,
          priority: null
        }
      ]
      assert.deepEqual(res, expect)
    })
  })
})
