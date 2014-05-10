var path = require("path")
var dependable = require("dependable")
var container = dependable.container()
var winston = require("winston")

var defaults = {
  PORT: 5010,
  MONGODB_URL: "mongodb://localhost/backside"
}

for (var key in defaults) {
  container.register(key, process.env[key] || defaults[key])
}

container.register("persistor", function(MongoPersistor, MONGODB_URL) {
  return new MongoPersistor(MONGODB_URL)
})

container.register("logger", function() {
  return winston
})

container.load(path.join(__dirname, "lib"))
container.load(path.join(__dirname, "models"))

module.exports = container
