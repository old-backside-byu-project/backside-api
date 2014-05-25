var express = require("express")
var bodyParser = require("body-parser")
var cookieParser = require("cookie-parser")

module.exports = function(api, auth, sessionStore, httpLogger) {
  return {
    createServer: function() {
      var app = express()
      app.use(httpLogger)
      app.use(bodyParser())
      app.use(cookieParser())
      app.use(sessionStore)
      app.use(auth.middleware())

      var authRoutes = auth.getRoutes()

      for(var method in authRoutes) {
        var routes = authRoutes[method]
        for(var routeName in routes) {
          if (!app[method]) throw new Error("invalid method " + method + " passsed by auth")
          var route = routes[routeName]
          app[method](routeName, route)
        }
      }

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
