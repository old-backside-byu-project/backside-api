
module.exports = {
  reduceTree: function(docs, pathArr) {
    return docs.reduce(function(obj, doc) {
      var pathToQuery = doc.path.splice(pathArr.length)
      var pointer = obj
      while (pathToQuery.length > 1) {
        var p = pathToQuery.shift().split("/").pop()
        if (!pointer[p]) {
          pointer[p] = {
            ".value" : {}
          }
        }
        pointer = pointer[p][".value"]
      }
      var p = pathToQuery.shift().split("/").pop()

      pointer[p] = {
        ".priority": doc[".priority"],
        ".value": doc[".value"] || {}
      }
      // console.log(JSON.stringify(obj, null, 2))

      return obj
    }, {})

  }

}