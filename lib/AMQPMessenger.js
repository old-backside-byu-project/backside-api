var amqplib = require("amqplib")

module.exports = function() {

  function Messenger(RABBITMQ_URL, opts) {
    var self = this
    var opts = opts || {}
    this.exchangeName = opts.exchangeName || "backside"
    this.ch = amqplib.connect(RABBITMQ_URL).then(function(conn) {
      return conn.createChannel()
    }).then(function(ch) {
      ch.assertExchange(self.exchangeName, "topic")
      return ch
    })
  }

  Messenger.prototype.transformPath = function(key) {
    if (key.charAt(0) === '/') {
      key = key.substr(1)
    }
    return key.replace(/\//g, ".")
  }
  Messenger.prototype.formatMessage = function(key, message) {
    var msg = {
      key: key,
      message: message
    }
    return new Buffer(JSON.stringify(msg))
  }

  Messenger.prototype.updateKey = function(key, message, cb) {
    cb = cb || function() {}
    var self = this
    var write = this.ch.then(function(ch) {
      return ch.publish("backside", self.transformPath(key), self.formatMessage(key, message))
    })
    write.then(function() {
      cb()
    }, function(err) {
      return cb(err)
    })
  }

  return Messenger
}
