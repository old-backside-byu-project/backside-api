var mongoose = require("mongoose")
var Mixed = mongoose.schema.Types.Mixed
var treeUtils = require("../lib/treeUtils")

module.exports = function() {
  var PersistorSchema = new mongoose.Schema({
    name: "string", // "databases"
    path: ["string"], // ["/books", "/books/programming", "/books/programming/databases"]
    parentPath: "string",  // "/books/programming"
    ".priority": Mixed,
    ".value": Mixed
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
    // bar: .value: null, .priotiy: 2
    {
      bar: {},
      abc:
    }

    /foo/bar/baz, /foo/bar/baz/beep/boop
  */


  // perhaps use this instead: 
  // http://docs.mongodb.org/manual/tutorial/model-tree-structures-with-materialized-paths/
  PersistorSchema.index({path: 1, parentPath: 1, ".priority": 1, name: 1})

  PersistorSchema.statics.get = function(key, cb) {
    var pathArr = key.split("/").reduce(function(arr, next) {
      var last = arr[arr.length - 1] || ""
      var newKey = last + "/" + next
      arr.push(newKey)
      return arr
    }, [])

    this.find({path: pathArr}).sort({".priority": 1, name: 1}).lean().exec(function(err, docs){
      if (err) return cb(err)
      if (!docs.length) {
        return cb()
      }
      if (docs.length === 1) {
        return cb(null, docs[0])
      }

      var ret = treeUtils.reduceTree(docs, pathArr)
      
      cb(null, ret)

    })

  }
  PersistorSchema.statics.set = function(key, val, priority, cb) {


  }
  PersistorSchema.statics.remove = function(key, cb) {

  }


  return function PersistorThingy(connectionString, opts) {
    connectionString = connectionString || "mongodb://localhost/backside"
    opts = opts || {}
    this.db = mongoose.createConnection(connectionString, opts)

    return this.db.model(opts.collection || "backside", PersistorSchema)
  }
}
