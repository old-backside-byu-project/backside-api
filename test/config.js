var container = require("../config")

// override the logger for log free tests
container.register("logger", function() {
  return {
    log: function() {},
    info: function() {},
    debug: function() {}
  }
})

container.register("MONGODB_URL", "mongodb://localhost/test")

module.exports = container
