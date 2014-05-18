var path = require("path")
var dependable = require("dependable")
var container = dependable.container()
var winston = require("winston")

var defaults = {
  PORT: 5010,
  MONGODB_URL: "mongodb://localhost/backside",
  RABBITMQ_URL: "amqp://localhost:5672"
}

for (var key in defaults) {
  container.register(key, process.env[key] || defaults[key])
}

container.register("persistence", function(BacksidePersistence, MongoPersistor, MONGODB_URL) {
  return new BacksidePersistence(new MongoPersistor(MONGODB_URL))
})

container.register("messenger", function(AMQPMessenger, RABBITMQ_URL) {
  return new AMQPMessenger(RABBITMQ_URL)
})

container.register("validator", function(Validator) {
  return new Validator()
})

container.register("logger", function() {
  return winston
})

container.load(path.join(__dirname, "lib"))

module.exports = container
