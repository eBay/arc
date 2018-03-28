let arc = require('./index');
let util = require('util');
let inspectSymbol = util.inspect.custom;

module.exports = function AdaptiveProxy(matches) {
  let handler = {};

  Object.getOwnPropertyNames(Reflect).forEach(methodName => {
    handler[methodName] = function() {
      let args = [].slice.call(arguments, 1);
      let target = matches.match(arc.getFlags());
      let type = typeof target;

      // Primitives cannot be reflected, so wrap as Object instance
      if (type === 'string') target = new String(target);
      else if (type === 'number') target = new Number(target);
      else if (type === 'boolean') target = new Boolean(target);

      return Reflect[methodName](target, ...args);
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
    let target = matches.match(arc.getFlags());
    let value = target[property];

    if (property === inspectSymbol) {
      // run inspect on the target to get transparent console output
      return () => util.inspect(target);
    } else if (typeof value === 'function') {
      // bind functions to the target so that built in types work properly
      return value.bind(target);
    } else {
      return value;
    }
  };

  let target = matches.default;
  return new Proxy(target instanceof Object ? target : {}, handler);
};
