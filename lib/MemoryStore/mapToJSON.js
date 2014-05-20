var SortedMap = require("collections/sorted-map")

function mapToJSON(map) {
  return map.reduce(function(o, val, key) {
    o[key.key] = (val instanceof SortedMap) ? mapToJSON(val) : val
    return o
  }, {});
}

module.exports = mapToJSON