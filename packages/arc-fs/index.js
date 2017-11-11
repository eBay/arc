let Resolver = require('arc-resolver');
let supportedMethods = [
  'stat',
  'statSync',
  'readdir',
  'readdirSync',
  'readFile',
  'readFileSync',
  'readlink',
  'readlinkSync',
  'exists',
  'existsSync'
];

module.exports = function AdaptiveReadOnlyFS({ fs = require('fs'), flags } = {}) {
  if (typeof flags !== 'function') {
    throw new Error('flags should be a function which returns a flagset object');
  }

  let resolver = new Resolver(fs);
  let adaptiveFS = {
    // resolve: resolver.resolve.bind(resolver),
    resolveSync: resolver.resolveSync.bind(resolver),
    clearCache: resolver.clearCache.bind(resolver)
  };

  supportedMethods.forEach(methodName => {
    adaptiveFS[methodName] = function(path, ...rest) {
      return fs[methodName](resolver.resolveSync(path, flags()), ...rest);
    };
  });

  return adaptiveFS;
};
