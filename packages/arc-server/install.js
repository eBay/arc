const AdaptiveFS = require('arc-fs');
const Module = require('module');
const resolve = require('resolve');
const path = require('path');
const AdaptiveProxy = require('./proxy');
const afs = new AdaptiveFS();
const proxyCache = Object.create(null);

Module.prototype._originalRequire = Module.prototype.require;
Module.prototype.require = function(request) {
  let resolvedPath;

  if (isCoreModule(request)) {
    return this._originalRequire(request);
  }

  try {
    resolvedPath = resolveCached(request, this);
  } catch(e) {
    return this._originalRequire(request);
  }

  const isAdaptive = afs.isAdaptiveSync(resolvedPath);

  if (isAdaptive) {
    return proxyCache[resolvedPath] = proxyCache[resolvedPath] || new AdaptiveProxy(
      afs.getMatchesSync(resolvedPath).map(path => this._originalRequire(path))
    );
  }

  return this._originalRequire(request);
};

let coreModules;

const isCoreModule = Module.isBuiltin || (moduleName => {
  if (moduleName.startsWith('node:')) {
    return true;
  }

  if (!coreModules) {
    let coreModulesNames = Object.keys(process.binding('natives'));
    coreModules = coreModulesNames.reduce(
      (object, name) => ((object[name] = true), object),
      {}
    );
  }
  return coreModules[moduleName];
});

let resolveCache = Object.create(null);

function resolveCached(request, module) {
  const basedir = module.filename
    ? path.dirname(module.filename)
    : /* istanbul ignore next: fallback for node repl */ process.cwd();
  const extensions = Object.keys(require.extensions);
  const cacheKey = request + '|' + basedir;
  
  let resolvedPath;
  
  if (!(resolvedPath = resolveCache[cacheKey])) {
    resolvedPath = resolveCache[cacheKey] = resolve.sync(request, {
      basedir,
      extensions,
      readFileSync: afs.readFileSync,
      isFile: file => {
        try {
          return afs.statSync(file).isFile();
        } catch (e) {
          return false;
        }
      }
    });
  }
  
  return resolvedPath;
}
