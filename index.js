var container = require("./config")

module.exports = container.get("api")

if (module === require.main) {
  var server = container.get("server")
  var logger = container.get("logger")
  server.createServer().listen(3000, function() {
    logger.log("info", "ghetto api listening on 3000")
  })
}
