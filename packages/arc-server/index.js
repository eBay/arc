let { AsyncLocalStorage } = require('node:async_hooks');
let flagStorage = new AsyncLocalStorage();

exports.withFlags = (flags, fn) => {
  let result;
  flagStorage.run(flags, () => result = fn());
  return result;
}

exports.getFlags = () => flagStorage.getStore();
