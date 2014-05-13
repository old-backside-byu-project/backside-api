var container = require("./config")

module.exports = {
  persistence: container.get("persistence"),
}

if (module === require.main) {
  var server = container.get("api")
  server.listen(3000, function() {
    console.log("ghetto api listening on 3000")
  })
}
