var container = require("./config")

module.exports = function(config) {
  config = config || {}
  for(var key in config) {
    container.register(key, function() {
      return config[key]
    })
  }
  return {
    api: container.get("api"),
    server: container.get("server"),
    container: container
  }
}

if (module === require.main) {
  var server = container.get("server")
  var logger = container.get("logger")
  var port = contaienr.get("PORT")
  server.createServer().listen(PORT, function() {
    logger.log("info", "api listening on " + port)
  })
}
