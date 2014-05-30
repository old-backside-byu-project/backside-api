var esprima = require("esprima")
var escodegen = require("escodegen")
module.exports = function(treeUtils) {
  function RuleValidator(persistence, opts) {
    opts = opts || {}
    this.persistence = persistence
    this.rulesKey = opts.rulesPath || "/_rules"
  }
  RuleValidator.prototype.setRules = function(user, rules, cb) {
    // also check the user has permission to set rules
    // need to validate that the rules are correct, i.e., no invalid rules
    this.persistence.privateSet(this.rulesKey, rules, cb)
  }
  RuleValidator.prototype.getRules = function(user, cb) {
    this.persistence.privateGet(this.rulesKey, cb)
  }

  var calls = {
    val: true,
    child: true,
    parent: true,
    hasChild: true,
    hasChildren: true,
    exists: true,
    getPriority: true,
    isNumber: true,
    isString: true,
    isBoolean: true,
    contains: true,
    beginsWith: true,
    endsWith: true,
    replace: true,
    toLowerCase: true,
    toUpperCase: true
  }
  var vars = {
    auth: true,
    now: true,
    root: true,
    data: true,
    newData: true
  }
  var ops = {
    "==" : true,
    "===" : true,
    "!=" : true,
    "!==" : true,
    "&&" : true,
    "||" : true,
    "!" : true,
    "<" : true,
    "<=" : true,
    ">" : true,
    ">=" : true,
    "+" : true,
    "-" : true,
    "*" : true,
    "/" : true,
    "%" : true
  }

  RuleValidator.prototype.checkNodes = function(tree, scopes) {
    var type = tree.type
    if (type === "ExpressionStatement") {
      this.checkNodes(tree.expression, scopes)
    } else if (type === "LogicalExpression" || type === "BinaryExpression") {
      if (!opts[tree.operator]) {
        throw new Error("Invalid operator " + tree.operator)
      }
      this.checkNodes(tree.left, scopes)
      this.checkNodes(tree.right, scopes)
    } else if (type === "UnaryExpression") {
      if (!opts[tree.operator]) {
        throw new Error("Invalid operator " + tree.operator)
      }
      this.checkNodes(tree.argument, scopes)
    } else if (type === "CallExpression") {
      this.checkNodes(tree.callee, scopes)
      for (var i = 0; i < tree.arguments.length; i++) {
        this.checkNodes(tree.arguments[i], scopes)
      }
    } else if (type === "MemberExpression") {

    }

  }
  RuleValidator.prototype.buildRule = function(rule) {
    var ast = null
    try {
      var ast = esprima.parse(rule)
    } catch (e) {
      return e
    }
    if (ast.body.length === 0) return new Error("No expression provided")
    if (ast.body.length > 1) return new Error("Multiple expressions provided, invalid")
    var exp = ast.body[0]
    var ptr = exp


    //var inner =
    return ast

  }

  RuleValidator.prototype.transformAST = function(exp) {

  }
  // to find the permissions and validate the rule for writes we:
  // 1. traverse the rules tree along the path and create an array of write rules to check, as well as a an arry of
  //    rules to validate, and scopes to inject
  //    1a. Split the path into parts, and attempt to descrend into the tree using each part of the path as a key
  //        if no key, then stop traversal, if a key starts with a '$' it is treated as a wildcard and should be a new scope
  //        for each write rule found, add to an array
  //        At the leaf of the tree, we add any validate rules
  //    1b. Once at the root of the tree from the given path, we then evaluate all the paths by the given object to be written
  //        and find any additional validate rules
  // 2. evaluate the rules finding the first one that returns true (if all false then reject)
  // 3. evaluate ALL validate rules, all must pass
  RuleValidator.prototype.canWrite = function(user, key, val, cb) {
    var self = this
    this.persistence.privateGet(this.rulesKey, function(err, rules) {
      rules = treeUtls.collapseTree(rules)
      var extractedRules = self.extractRules(rules, key, val)
    })
  }

  // reads are similiar to above, but we don't need to worry about validate rules
  RuleValidator.prototype.canRead = function(user, key, cb) {
    var self = this
    this.persistence.privateGet(this.rulesKey, function(err, rules) {
      rules = treeUtls.collapseTree(rules)
      var extractedRules = self.extractRules(rules, key, val)
    })
  }

  RuleValidator.prototype.extractRules = function(rules, key, val) {
    // don't want to include split before first slash
    var paths = key.substr(1).split("/")
    var writes = []
    var reads = []
    var validators = []
    var scopes = []
    var ptr = rules.rules
    var nextPath = paths.shift()
    while (ptr) {
      var wildKey = false
      for (var key in ptr) {
        if (key === "_write") {
          writes.push(ptr[key])
        }
        if (key === "_read") {
          reads.push(ptr[key])
        }
        if (key === "_validate") {
          validators.push(ptr[key])
        }
        if (key.charAt(0) === "$") {
          scopes.push(key)
          wildKey = key
        }
      }
      // if we already went through all the paths, then its
      // time to break out
      if (nextPath === undefined) {
        break
      }
      if (ptr[nextPath]) {
        ptr = ptr[nextPath]
      } else if (wildKey) {
        ptr = ptr[wildKey]
      } else {
        ptr = null
      }
      nextPath = paths.shift()
    }
    if (ptr) {
      this.getValidators(ptr, val, validators)
    }
    return {
      writes: writes,
      reads: reads,
      validators: validators,
      scopes: scopes
    }
  }
  RuleValidator.prototype.getValidators = function(tree, val, array) {
    for (var key in val) {
      if (tree[key] && tree[key]["_validate"]) {
        array.push(tree[key]["_validate"])
      }
      if (typeof val[key] === "object") {
        this.getValidators(tree[key], val[key], array)
      }
    }
  }
  return RuleValidator
}
