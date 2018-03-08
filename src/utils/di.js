
class Context {
  constructor() {
    this.storage = {}
  }

  addClass(name, injectable, singleton) {
    const _context = this
    const injected = class Injected extends injectable {
      static context = _context

      constructor(...args) {
        let injects = (injectable.$inject || []).map((inj) => _context.injected(inj))
        super(...(injects.concat(args)))
      }
    }
    if (singleton) {
      let _instance = null

      injected.instance = function() {
        if (_instance) return _instance
        return _instance = new this()
      }
    }
    this.storage[name] = injected
    if (typeof injected.injected === 'function') {
      injected.injected()
    }
  }

  addConstant(name, value) {
    this.storage[name] = value
  }

  addSingletonObject(name, object) {
    this.storage[name] = { instance: () => object }
  }

  injected(name) {
    var object = false
    if (name.slice(-2) === '()') {
      name = name.slice(0, -2)
      object = true
    }
    var injectable = this.storage[name]
    return object ? (typeof injectable.instance === 'function' ? injectable.instance() : new injectable()) : injectable 
  }
}

export default Context