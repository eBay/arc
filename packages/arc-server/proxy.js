let arc = require('./index');
let util = require('util');
let inspectSymbol = util.inspect.custom;
let primitiveSymbol = Symbol.toPrimitive;
let builtins = Object.prototype;

module.exports = function AdaptiveProxy(matches, path = []) {
  let handler = {};
  let defaultTarget = getPath(matches.default, path);
  let proxyCache = {};

  Object.getOwnPropertyNames(Reflect).forEach(methodName => {
    handler[methodName] = function() {
      let args = [].slice.call(arguments, 1);
      let flags = arc.getFlags();
      let target = flags ? getPath(matches.match(flags), path) : defaultTarget;

      return Reflect[methodName](Object(target), ...args);
    };
  });

  // Proxies cannot return non-configurable property descriptors
  let getOwnPropertyDescriptor = handler.getOwnPropertyDescriptor;
  handler.getOwnPropertyDescriptor = (...args) => {
    let result = getOwnPropertyDescriptor(...args);
    if (result) result.configurable = true;
    return result;
  };

  handler.get = (_target, property, receiver) => {
    let flags = arc.getFlags();
    let target = flags ? getPath(matches.match(flags), path) : defaultTarget;
    let value = target[property]

    if (property === inspectSymbol) {
      // run inspect on the target to get transparent console output
      return () => util.inspect(target);
    } else if (property === primitiveSymbol) {
      return () => target.valueOf();
    } else if (typeof value === 'function' && builtins[property]) {
      // bind functions to the target so that built in types work properly
      return value.bind(target);
    } else if (!flags) {
      let cachedProxy = proxyCache[property];
      if (!cachedProxy) {
        cachedProxy = proxyCache[property] = AdaptiveProxy(matches, path.concat(property))
      }
      return cachedProxy;
    } else {
      return value;
    }
  };

  if (path.length === 0) {
    const { get } = handler;
    handler.get = (_target, property, receiver) => {
      if (property === "__esModule") {
        return _target[property];
      }
      return get(_target, property, receiver);
    }
  }

  if (defaultTarget == null) {
    return defaultTarget;
  } else {
    return new Proxy(Object(defaultTarget), handler);
  }
};

function getPath(object, path) {
  for (key of path) {
    object = object[key];
  }
  return object;
}
