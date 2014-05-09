var path = require("path")
var dependable = require("dependable")
var container = dependable.container()
var winston = require("winston")

var defaults = {
  PORT: 5010
}

for (var key in defaults) {
  container.register(key, process.env[key] || defaults[key])
}

container.register("logger", function() {
  return winston
})

container.load(path.join(__dirname, "lib"))
container.load(path.join(__dirname, "models"))

module.exports = container
