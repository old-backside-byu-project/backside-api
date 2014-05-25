var pathPriority = {}

module.exports = {
  get: function get(path) {
    return pathPriority[path]
  },

  set: function set(path, priority) {
    if (priority === undefined || priority === null) {
      return module.exports.remove(path)
    }
    
    pathPriority[path] = priority
  },

  remove: function remove(path) {
    delete pathPriority[path]
  }
}