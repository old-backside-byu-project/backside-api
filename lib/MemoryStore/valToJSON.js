var SortedMap = require("collections/sorted-map")

function valToJSON(val) {
  return val.reduce(function(o, val, key) {
    o[key.key] = {
      value: (val instanceof SortedMap) ? valToJSON(val) : val
    }

    if (key.priority !== undefined) {
      o[key.key].priority = key.priority
    }

    return o
  }, {});
}

module.exports = valToJSON