var container = require("./config")

module.exports = container.get("api")

if (module === require.main) {
  var server = container.get("server")
  server.createServer().listen(3000, function() {
    console.log("ghetto api listening on 3000")
  })
}
