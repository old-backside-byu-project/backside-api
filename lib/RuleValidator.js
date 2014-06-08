var RuleParser = require("./RuleTree/RuleParser")
var RuleRunner = require("./RuleTree/RuleRunner")
var ruleTypes = [
  "_write",
  "_read",
  "_validate"
]

module.exports = function(treeUtils) {
  function RuleValidator(persistence, opts) {
    opts = opts || {}
    this.persistence = persistence
    this.rulesKey = opts.rulesPath || "/_rules"
    this.ruleParser = new RuleParser()
    this.ruleRunner = new RuleRunner(this.persistence)
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

  RuleValidator.prototype.runRules = function() {
    this.ruleRunner.runRules.apply(this.ruleRunner, arguments)
  }

  RuleValidator.prototype.getAndRunRules = function(opType, user, key, val, cb) {
    var self = this
    this.persistence.privateGet(this.rulesKey, function(err, rules) {
      if (err) return cb(err)
      rules = treeUtils.collapseTree(rules)
      self.ruleRunner.runRules(opType, rules, user, key, val, cb)
    })
  }

  RuleValidator.prototype.canWrite = function(user, key, val, cb) {
    this.getAndRunRules("write", user, key, val, cb)
  }

  // reads are similiar to above, but we don't need to worry about validate rules
  RuleValidator.prototype.canRead = function(user, key, cb) {
    this.getAndRunRules("read", user, key, null, cb)
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
      rules.push({ruleType: key, rule: tree[key], scopes: arrToObj(scopes)})
    }
  }
}
function arrToObj(arr) {
  var obj = {}
  arr.forEach(function(a) {
    obj[a] = true
  })
  return obj
}

