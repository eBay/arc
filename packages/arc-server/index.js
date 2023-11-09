let { AsyncLocalStorage } = require('node:async_hooks');
let flagStorage = new AsyncLocalStorage();

exports.withFlags = (flags, fn) => flagStorage.run(flags, fn);

exports.setFlags = (flags) => flagStorage.enterWith(flags);

exports.getFlags = () => flagStorage.getStore();
