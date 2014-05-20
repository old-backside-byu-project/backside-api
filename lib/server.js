
var express = require("express")
var bodyParser = require("body-parser")
var logger = require("morgan")

module.exports = function(api, validator) {
  return {
    createServer: function() {
      var app = express()
      app.use(logger())
      app.use(bodyParser())
      app.use(validator.middleware())

      app.get("*", function(req, res, next) {
        api.get(req.user, req.path, function(err, resp) {
          if (err) return next(err)
          res.json(resp)
        })
      })
      app.post("*", function(req, res, next) {
        var body = req.body
        if (!req.is("json")) {
          return next(new Error("not valid json"))
        }
        var priority = req.body[".priority"]
        api.set(req.user, req.path, body, priority, function(err, resp) {
          if (err) return next(err)
          res.json(resp)
        })
      })

      return app
    }
  }
}
