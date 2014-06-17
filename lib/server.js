var path = require("path")
var express = require("express")
var bodyParser = require("body-parser")
var cookieParser = require("cookie-parser")
var cuid = require("cuid")
var treeUtils = require("backside-utils")

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
  app.use(textMiddleware)

  app.use(bodyParser())
  app.use(cookieParser())
  app.use(sessionStore)
  app.use(auth.middleware())

  app.use(bodyMiddleware)

  var authRoutes = auth.getRoutes()
  var secRoutes = security.getRoutes()
  addRoutes(app, authRoutes)
  addRoutes(app, secRoutes)

  app.get("*", function(req, res, next) {
    api.get(req.user, req.path, function(err, resp) {
      if (err) return next(err)
      sendData(res, resp, req.query, req.method)
    })
  })
  app.post("*", function(req, res, next) {
    var newId = cuid()
    api.set(req.user, path.join(req.path, newId), req.body, req.priority, function(err, resp) {
      if (err) return next(err)
      if (req.query.print === 'silent') return res.send(204)
      res.json({newId: newId})
    })
  })
  // the API currently doesn't support a wholesale put, so emulate with
  // a remove and set
  app.put("*", function(req, res, next) {
    api.remove(req.user, req.path, function(err) {
      if (err) return next(err)
      api.set(req.user, req.path, req.body, req.priority, function(err, resp) {
        if (err) return next(err)
        sendData(res, resp, req.query, req.method)
      })
    })
  })
  app.patch("*", function(req, res, next) {
    api.set(req.user, req.path, req.body, req.priority, function(err, resp) {
      if (err) return next(err)
      sendData(res, resp, req.query, req.method)
    })
  })
  app.delete('*', function(req, res, next) {
    api.remove(req.user, req.path, function(err, resp) {
      if (err) return next(err)
      sendData(res, resp, req.query, req.method)
    })
  })

  function sendData(res, data, opts, method) {
    if (opts.format === "export") return res.json(data)
    var formatted = treeUtils.collapseTree(data)
    if (opts.print === "pretty") {
      res.set('Content-Type', 'application/json')
      return res.send(JSON.stringify(formatted, null, 2))
    }
    if (opts.print === "silent" && (method === "PUT" || method === "POST")) {
      return res.send(204)
    }
    res.json(formatted)
  }

  var bodyMethods = {
    POST: true,
    PUT: true,
    PATCH: true
  }

  function bodyMiddleware(req, res, next) {
    if (!bodyMethods[req.method]) return next()
    req.priority = null
    if (req.is("json") || req.is('urlencoded')) {
      req.priority = req.body._priority
      delete req.body._priority
    } else if(req.is('text/*')) {
      req.body = req.text
    } else {
      return next(new Error("not valid json or text"))
    }
    next()
  }

  function textMiddleware(req, res, next) {
    if (!req.is('text/*')) {
      return next()
    }

    req.text = ''
    req.setEncoding('utf8')
    req.on('data', function(c) { req.text += c })
    req.on('end', next)
  }

  return app
}
