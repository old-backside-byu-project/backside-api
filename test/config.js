var container = require("../config")

// override the logger for log free tests
container.register("logger", function() {
  return {
    log: function() {},
    info: function() {},
    debug: function() {}
  }
})

container.register("api", function() {
	
})

module.exports = container