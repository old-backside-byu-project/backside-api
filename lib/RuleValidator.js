module.exports = function() {
  function RuleValidator(persistence, opts) {
    opts = opts || {}
    this.persistence = persistence
    this.rulesKey = opts.rulesPath || "/_rules"
  }
  RuleValidator.prototype.setRules = function(user, rules, cb) {
    // also check the user has permission to set rules
    // need to validate that the rules are correct, i.e., no invalid rules
    this.persistence.set(this.rulesKey, rules, cb)
  }
  RuleValidator.prototype.getRules = function(user, cb) {
    this.persistence.get(this.rulesKey, cb)
  }

  RuleValidator.prototype.canWrite = function(user, key, val, cb) {

  }
  RuleValidator.prototype.canRead = function(user, key, cb) {
  }

  return RuleValidator
}
