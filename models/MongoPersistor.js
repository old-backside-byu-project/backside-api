var mongoose = require("mongoose")
var Mixed = mongoose.Schema.Types.Mixed
var treeUtils = require("../lib/treeUtils")
var async = require("async")

module.exports = function() {
  var PersistorSchema = new mongoose.Schema({
    name: "string", // "databases"
    path: ["string"], // ["/books", "/books/programming", "/books/programming/databases"]
    parentPath: "string",  // "/books/programming"
    priority: Mixed,
    value: Mixed
  })

  /*
    path: ["books", "programming", "databases"]
      or
    path: ["books", "books/programming", "books/programming/databases"]
    FIND : foo/bar/baz/beep (1)
    {
      "path" : ["foo", "foo/bar", "foo/bar/baz"]
      "name" : "baz"
      ".values" {
        "beep": 1,
        "boop": 2
      }
    }
    // option 1 - store everything as a value
    {
      "path" : ["foo", "foo/bar", "foo/bar/baz","foo/bar/baz/beep"]
      "name" : "beep"
      ".value" : 1
    }
    {
      "path" : ["foo", "foo/bar", "foo/bar/baz","foo/bar/baz/boop"]
      "name" : "boop"
      ".value" : 2
    }
    {
      "path" : ["foo", "foo/bar", "foo/bar/bat"]
      "name" : "bat"
      ".value" : 4
    }
    // option 2 - keep as is and query twice

    {
      "path" : ["foo", "foo/bar", "foo/bar/baz"]
      "name" : "baz"
      ".values" {
        "beep": 1,
        "boop": 2
      }
    }

    {
      "foo": {
        "bar": { // priority 1
          "baz": {
            "beep": 1, // priority 1
            "boop": 2 // priority 1
          },
          "bat": 4 // priority 2
        },
        "abc" : { // priority 2
          ""

        }
      }
    }
    //query: foo
    // bar: .value: null, .priority: 2
    {
      bar: {},
      abc:
    }

    /foo/bar/baz, /foo/bar/baz/beep/boop
  */


  // perhaps use this instead:
  // http://docs.mongodb.org/manual/tutorial/model-tree-structures-with-materialized-paths/
  PersistorSchema.index({path: 1, parentPath: 1, ".priority": 1, name: 1}, {unique: true})

  PersistorSchema.statics.getRaw = function(key, cb) {
    var pathEl = treeUtils.buildPathArr(key).pop()
    this.find({path: pathEl}).sort({".priority": 1, name: 1}).lean().exec(cb)
  }

  PersistorSchema.statics.get = function(key, cb) {
    var pathArr = treeUtils.buildPathArr(key)
    this.getRaw(key, function(err, docs){
      if (err) return cb(err)
      if (!docs.length) {
        return cb()
      }

      var ret = treeUtils.reduceTree(docs, pathArr)

      cb(null, ret)

    })
  }

  PersistorSchema.statics.set = function(key, val, priority, cb) {
    var pathArr = treeUtils.buildPathArr(key)

    var topKey = key.split("/").pop()
    var docs = treeUtils.buildDocs(topKey, pathArr, val, priority)
    async.map(docs, this.saveSingleDoc.bind(this), function(err, docs) {
      if (err) return cb(err)
      cb(null, treeUtils.reduceTree(docs, pathArr))
    })
  }

  PersistorSchema.statics.saveSingleDoc = function(doc, cb) {
    this.findOneAndUpdate({path: doc.path}, doc, {upsert: true}, cb)
  }

  PersistorSchema.statics.remove = function(key, cb) {
    this.getRaw(key, function(err, docs) {
      if (err) return cb(err)
      if (!docs.length) return cb()
      var ids = docs.map(function(d) {
        return d._id
      })

      async.each(ids, this.findByIdAndRemove.bind(this), cb)
    })
  }


  return function PersistorBuilder(connectionString, opts) {
    connectionString = connectionString || "mongodb://localhost/backside"
    opts = opts || {}
    this.db = mongoose.createConnection(connectionString, opts)

    return this.db.model(opts.collection || "backside", PersistorSchema)
  }
}
