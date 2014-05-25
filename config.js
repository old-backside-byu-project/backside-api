var path = require("path")
var dependable = require("dependable")
var container = dependable.container()
var winston = require("winston")
var session = require("express-session")
var morgan = require("morgan")

var defaults = {
  PORT: 5010,
  MONGODB_URL: "mongodb://localhost/backside",
  RABBITMQ_URL: "amqp://localhost:5672",
  SESSION_SECRET: "really bad secret"
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

container.register("auth", function(persistence, UserPassAuth) {
  return new UserPassAuth(persistence)
})

container.register("validator", function(RuleValidator, persistence) {
  return new RuleValidator(persistence)
})

container.register("logger", function() {
  return winston
})

container.register("httpLogger", function() {
  return morgan()
})

container.register("sessionStore", function(SESSION_SECRET) {
  return session({
    secret: SESSION_SECRET,
    name: "sid",
    proxy: true
  })
})

container.load(path.join(__dirname, "lib"))

module.exports = container
