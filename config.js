var path = require("path")
var dependable = require("dependable")
var container = dependable.container()
var winston = require("winston")
var amqplib = require("amqplib")

var defaults = {
  PORT: 5010,
  MONGODB_URL: "mongodb://localhost/backside",
  RABBITMQ_URL: "amqp://localhost:5672"
}

for (var key in defaults) {
  container.register(key, process.env[key] || defaults[key])
}

container.register("persistor", function(MongoPersistor, MONGODB_URL) {
  return new MongoPersistor(MONGODB_URL)
})

container.register("persistence", function(persistor, BacksidePersistence) {
  return new BacksidePersistence(persistor)
})

container.register("amqp", function(RABBITMQ_URL) {
  return function(cb) {
    amqplib.connect(RABBITMQ_URL).then(function(conn) {
      conn.createChannel().then(function(ch) {
        ch.assertExchange("backside", "topic").then(function() {
          cb(null, ch)
        })
      })
    })
  }
})


container.register("logger", function() {
  return winston
})

container.load(path.join(__dirname, "lib"))
container.load(path.join(__dirname, "models"))

module.exports = container
