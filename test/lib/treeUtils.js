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
    it("should be able to reduce a single node value", function() {
      var res = treeUtils.reduceTree([{
        name: "bat",
        path: ["/foo", "/foo/bar", "/foo/bar/bat"],
        parentPath: "/foo/bar",
        value : 4,
        priority : 2
      }], ["/foo", "/foo/bar", "/foo/bar/bat"])
      assert.deepEqual(res, {
        value: 4,
        priority: 2
      })
    })
    it("should be able to reduce docs back into a full tree", function() {
      var res = treeUtils.reduceTree([{
        name: "bat",
        path: ["/foo", "/foo/bar", "/foo/bar/bat"],
        parentPath: "/foo/bar",
        value : 4,
        priority : 2
      }], ["/foo", "/foo/bar"])
      assert.deepEqual(res, {
        bat: {
          value : 4,
          priority : 2
        }
      })
    })
    it("should be able to reduce docs back into a full tree", function() {
      var res = treeUtils.reduceTree([
        {
          name: "bat",
          path: ["/foo", "/foo/bar", "/foo/bar/bat"],
          parentPath: "/foo/bar",
          value : 4,
          priority : 2
        },
        {
          name: "baz",
          path: ["/foo", "/foo/bar", "/foo/bar/baz"],
          parentPath: "/foo/bar",
          value : 5,
          priority : 2
        }], ["/foo", "/foo/bar"])
      assert.deepEqual(res, {
        bat: {
          value : 4,
          priority : 2
        },
        baz: {
          value : 5,
          priority : 2
        }
      })
    })

    it("should be able to reduce docs back into a full tree", function() {
      var res = treeUtils.reduceTree(docs, ["/foo"])
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
    it("should be able to create a doc from a single value", function() {
      assert.deepEqual(treeUtils.buildDocs("bar", ["/foo", "/foo/bar"], "stuff", 1), [{
        name: "bar",
        path: ["/foo", "/foo/bar"],
        parentPath: "/foo",
        value: "stuff",
        priority: 1
      }])
    })

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
