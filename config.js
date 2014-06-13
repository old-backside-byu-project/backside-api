var path = require("path")
var dependable = require("dependable")
var container = dependable.container()
var winston = require("winston")
var session = require("express-session")
var morgan = require("morgan")
var MongoStore = require("backside-mongo-store")
var UserPassAuth = require("backside-userpass-auth")
var AMQPMessenger = require("backside-amqp-messenger")
var RuleTreeSecurity = require("backside-ruletree-security")

var defaults = {
  PORT: 5010,
  SESSION_SECRET: "really bad secret"
}

for (var key in defaults) {
  container.register(key, process.env[key] || defaults[key])
}

container.register("store", function() {
  return new MongoStore()
})

container.register("persistence", function(BacksidePersistence, store) {
  return new BacksidePersistence(store)
})

container.register("messenger", function() {
  return new AMQPMessenger()
})

container.register("auth", function(persistence) {
  return new UserPassAuth(persistence)
})

container.register("validator", function(persistence, logger) {
  return new RuleTreeSecurity(persistence, {logger: logger})
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
