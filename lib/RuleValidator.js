var async = require("async")

module.exports = function(treeUtils, RuleParser) {
  function RuleValidator(persistence, opts) {
    opts = opts || {}
    this.persistence = persistence
    this.rulesKey = opts.rulesPath || "/_rules"
    this.ruleParser = new RuleParser()
  }
  RuleValidator.prototype.setRules = function(user, rules, cb) {
    // also check the user has permission to set rules... or maybe out of scope of this?
    this.validateRuleSet(rules, function(err) {
      if (err) return cb(err)
      this.persistence.privateSet(this.rulesKey, rules, cb)
    })
  }
  RuleValidator.prototype.getRules = function(user, cb) {
    this.persistence.privateGet(this.rulesKey, cb)
  }

  RuleValidator.prototype.validateRuleSet = function(rules, cb) {
    if (rules.rules) rules = rules.rules
    var ruleArray = gatherRuleLeaves(rules)
    for (var i = 0; i < ruleArray.length; i++) {
      var ruleObj = ruleArray[i]
      if (ruleTypes.indexOf(ruleObj.ruleType) === -1) {
        return cb(new Error("Invalid rule type, must be on of " + ruleTypes.join(",")))
      }

      if (ruleObj.rule === false || ruleObj.rule === true) continue

      var err = this.ruleParser.validateRule(ruleObj.ruleType, ruleObj.rule, ruleObj.scopes)
      if (err) return cb(err)
    }
    cb()
  }

  RuleValidator.prototype.runRule = function(rule, auth, scopes, cb) {




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
    var pathSoFar = [nextPath]
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
          scopes.push({scope: key, path: "/" + pathSoFar.join("/")})
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
      if (nextPath) pathSoFar.push(nextPath)
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
// finds all the leaves of a tree whose values aren't a hash
function gatherRuleLeaves(tree) {
  var rules = []
  var scopes = []
  gatherRuleCtx(tree, rules, scopes)
  return rules
}
function gatherRuleCtx(tree, rules, scopes) {
  for (var key in tree) {
    if (typeof tree[key] === "object") {
      if (key.charAt(0) === "$") {
        scopes.push(key)
      }
      // slice the scopes array so we get a different copy all the way down
      gatherRuleCtx(tree[key], rules, scopes.slice(0))
    } else {
      rules.push({ruleType: key, rule: tree[key], scopes: scopes})
    }
  }
}
var ruleTypes = [
  "_write",
  "_read",
  "_validate"
]
