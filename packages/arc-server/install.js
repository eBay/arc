let AdaptiveFS = require('arc-fs');
let Resolver = require('arc-resolver');
let Module = require('module');
let resolve = require('resolve');
let path = require('path');
let fs = require('fs');
let AdaptiveProxy = require('./proxy');
let arc = require('./index');
let resolver = new Resolver();
let afs = new AdaptiveFS({ flags: arc.getFlags });
let _require = Module.prototype.require;
let proxyCache = {};

Module.prototype.require = function(request) {
  let resolved;
  let basedir = this.filename
    ? path.dirname(this.filename)
    : /* istanbul ignore next: fallback for node repl */ process.cwd();
  let extensions = Object.keys(require.extensions);

  if (isCoreModule(request)) {
    return _require(request);
  }

  try {
    resolvedPath = resolve.sync(request, { basedir, extensions });
  } catch (e) {
    resolvedPath = resolve.sync(request, {
      basedir,
      extensions,
      readFile: afs.readFileSync,
      isFile: file => {
        try {
          return afs.statSync(file).isFile();
        } catch (e) {
          return false;
        }
      }
    });
  }

  let isAdaptive = resolver.isAdaptiveSync(resolvedPath);
  let proxy = proxyCache[resolvedPath];

  if (isAdaptive && !proxy) {
    proxy = proxyCache[resolvedPath] = new AdaptiveProxy(
      resolvedPath,
      _require
    );
  }

  return isAdaptive ? proxy : _require(resolvedPath);
};

let coreModules;

function isCoreModule(moduleName) {
  if (!coreModules) {
    let coreModulesNames = Object.keys(process.binding('natives'));
    coreModules = coreModulesNames.reduce(
      (object, name) => ((object[name] = true), object),
      {}
    );
  }
  return coreModules[moduleName];
}
