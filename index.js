var container = require("./config")
var path = require("path")

module.exports = {
  getContainer: function() {
    return container
  },
  getApi: function(overrideContainer) {
    container = overrideContainer || container
    return container.get("api")
  },
  createServer: function(overrideContainer) {
    container = overrideContainer || container
    return container.get("server")
  }
}

if (module === require.main) {
  if (process.argv[2]) {
    var userConfig = require(path.join(process.cwd(), process.argv[2]))
    userConfig.configure(container)
  }
  var server = container.get("server")
  var logger = container.get("logger")
  var port = container.get("API_PORT")
  server.createServer().listen(port, function() {
    logger.log("info", "http api listening on " + port)
  })
}
