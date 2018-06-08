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
  let resolver = new Resolver(fs);
  let adaptiveFS = {
    // resolve: resolver.resolve.bind(resolver),
    resolveSync: (path) => resolver.resolveSync(path, flags),
    getMatchesSync: (path) => resolver.getMatchesSync(path),
    isAdaptiveSync: (path) => resolver.isAdaptiveSync(path),
    clearCache: () => resolver.clearCache()
  };

  supportedMethods.forEach(methodName => {
    adaptiveFS[methodName] = function(path, ...rest) {
      try {
        if (flags) {
          path = resolver.resolveSync(path, flags);
        } else {
          path = resolver.getMatchesSync(path).default;
        }
      } catch(e) {}
      return fs[methodName](path, ...rest);
    };
  });

  let readdirSync = adaptiveFS.readdirSync;

  adaptiveFS.readdirSync = function(...args) {
    let items = readdirSync(...args);
    let unique = {};
    items.forEach(item => {
      unique[item.replace(/\[.*\]/, '')] = true;
    });
    return Object.keys(unique);
  }

  return adaptiveFS;
};
