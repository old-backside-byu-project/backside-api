

function _buildDocs(key, keyArr, val, priority, arr) {
  if (typeof val === "string" || typeof val === "number" || typeof val === "boolean" || val === null) {
    arr.push({
      name : key,
      path : keyArr,
      parentPath : keyArr[keyArr.length - 2] ? keyArr[keyArr.length - 2] : "",
      value : val,
      priority : priority
    })
  } else if (typeof val === "object") { //treat arrays just like objects with numeric keys
    // need to add a priority placeholder if one exists
    if (priority !== null && priority !== undefined) {
      var nka = keyArr.slice(0)
      var parent = keyArr[keyArr.length - 1]
      nka.push(parent + "/" + key)
      arr.push({
        name : key,
        path : nka,
        parentPath : nka[nka.length - 2] ? nka[nka.length - 2] : "",
        value : null,
        priority : priority
      })
    }
    for(var k in val) {
      var nka = keyArr.slice(0)
      var parent = keyArr[keyArr.length - 1]
      nka.push(parent + "/" + k)
      // don't send down priority, only applies on first call
      _buildDocs(k, nka, val[k], null, arr)
    }
  }
}

module.exports = {
  reduceTree: function(docs, pathArr) {
    return docs.reduce(function(obj, doc) {
      var pathToQuery = doc.path.splice(pathArr.length)
      var pointer = obj
      while (pathToQuery.length > 1) {
        var p = pathToQuery.shift().split("/").pop()
        if (!pointer[p]) {
          pointer[p] = {
            value : {}
          }
        }
        pointer = pointer[p].value
      }
      var p = pathToQuery.shift().split("/").pop()

      pointer[p] = {
        priority: doc.priority,
        value: doc.value || {}
      }

      return obj
    }, {})
  },

  buildPathArr: function(key) {
    return key.split("/").reduce(function(arr, next) {
      var last = arr[arr.length - 1] || ""
      var newKey = last + "/" + next
      arr.push(newKey)
      return arr
    }, [])
  },

  buildDocs: function(key, keyArr, val, priority) {
    var arr = []
    // pop off last path as _buildDocs takes care of it
    keyArr.pop()
    _buildDocs(key, keyArr, val, priority, arr)
    return arr
  }
}
