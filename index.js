var container = require("./config")
var path = require("path")

module.exports = {
  getContainer: function() {
    return container
  },
  initApi: function(overrideContainer, cb) {
    if (typeof overrideContainer === "function") {
      cb = overrideContainer
      overrideContainer = null
    }
    var cont = overrideContainer || container
    cont.resolve("api", function(api) {
      cb(null, api)
    })
  },
  createServer: function(overrideContainer, cb) {
    if (typeof overrideContainer === "function") {
      cb = overrideContainer
      overrideContainer = null
    }
    var cont = overrideContainer || container
    cont.resolve("server", function(server) {
      cb(null, server.createServer())
    })
  }
}

if (module === require.main) {
  if (process.argv[2]) {
    var userConfig = require(path.join(process.cwd(), process.argv[2]))
    userConfig.configure(container)
  }
  var server = container.get("server")
  var logger = container.get("logger")
  var port = container.get("PORT")
  server.createServer().listen(port, function() {
    logger.log("info", "http api listening on " + port)
  })
}
