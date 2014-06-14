var express = require("express")
var bodyParser = require("body-parser")
var cookieParser = require("cookie-parser")

function addRoutes(app, routes) {
  for(var method in routes) {
    var rs = routes[method]
    for(var routeName in rs) {
      if (!app[method]) throw new Error("invalid method " + method + " passsed by auth")
      var route = rs[routeName]
      app[method](routeName, route)
    }
  }
}

module.exports = function(api, auth, security, sessionStore, httpLogger) {
  var app = express()
  app.use(httpLogger)
  app.use(bodyParser())
  app.use(cookieParser())
  app.use(sessionStore)
  app.use(auth.middleware())

  var authRoutes = auth.getRoutes()
  var secRoutes = security.getRoutes()
  addRoutes(app, authRoutes)
  addRoutes(app, secRoutes)

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
