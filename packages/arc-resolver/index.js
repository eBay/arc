let path = require('path');
let util = require('util');
let CachedFs = require('cachedfs');

module.exports = class Resolver {
  constructor(fs = require('fs')) {
    validateFS(fs);
    this.fs = new CachedFs(fs);
    this.fs.stat = util.promisify(this.fs.stat);
    this.fs.readdir = util.promisify(this.fs.readdir);
    this.matchCache = {};
  }
  clearCache() {
    this.fs.cache.reset();
    this.matchCache = {};
  }
  getMatchesSync(dir, request, path, knownDir) {
    let fs = this.fs;
    let resolvedPath = path.join(dir, request);
    let matches = this.matchCache[resolvedPath];

    if (!matches) {
      let requestParts = request.split('.');
      let entries = fs.readdirSync(dir);
      let firstIndex = 0;
      let lastIndex = requestParts - 1;
      let name = requestParts[firstIndex] || '.' + requestParts[++firstIndex];
      let ext = firstIndex !== lastIndex && requestParts[lastIndex];

      matches = [];

      entries.forEach(entry => {
        let entryPath = path.join(dir, entry);
        let hasName = entry.startsWith(name);
        let nextChar = entry[name.length];
        let nextCharIsBoundary = nextChar === '.' || nextChar === undefined;

        if (!hasName || !nextCharIsBoundary) return;
        if (knownDir && fs.statSync(entryPath).isFile()) return;

        let flagString = entry.slice(name.length + 1);
        let remainingRequest = request.slice(name.length + 1);

        let flags = flagString ? flagString.split('.') : [];
        let notFlags = remainingRequest ? remainingRequest.split('.') : [];
        let notFlagIndexes = notFlags.map(not =>
          flags.findIndex(flag => flag === not)
        );

        if (notFlagIndexes.every(i => i >= 0)) {
          notFlagIndexes.reverse().forEach(i => flags.splice(i, 1));
          matches.push({ flags, entry, path: entryPath });
        }
      });

      if (!matches.length) {
        throw new Error(resolvedPath + ' does not exist');
      }

      matches.sort((a, b) => b.flags.length - a.flags.length);

      this.matchCache[resolvedPath] = matches;
    }

    return matches;
  }
  resolveSync(filepath, flags) {
    if (typeof filepath !== 'string') {
      throw new TypeError('Filepath must be a string.');
    }

    if (!flags || typeof flags !== 'object') {
      throw new TypeError('Flags must be an object.');
    }

    let path = getPathHelper(filepath);

    let locations = path.normalize(filepath).split(path.sep);
    let currentPath = locations[0] || path.sep;

    for (let i = 1; i < locations.length; i++) {
      let location = locations[i];
      let knownDir = i < locations.length - 1;
      let matches = this.getMatchesSync(currentPath, location, path, knownDir);
      let match = matches.find(match => match.flags.every(flag => flags[flag]));

      if (!match) {
        throw new Error(
          'No match found for ' + path.join(currentPath, location)
        );
      }

      currentPath = match.path;
    }

    return currentPath;
  }
  isAdaptiveSync(filepath) {
    if (typeof filepath !== 'string') {
      throw new TypeError('Filepath must be a string.');
    }

    let path = getPathHelper(filepath);

    let locations = path.normalize(filepath).split(path.sep);
    let currentPath = locations[0] || path.sep;

    for (let i = 1; i < locations.length; i++) {
      let location = locations[i];
      let knownDir = i < locations.length - 1;
      let matches = this.getMatchesSync(currentPath, location, path, knownDir);

      if (matches.length > 1) {
        return true;
      }

      currentPath = path.join(currentPath, location);
    }

    return false;
  }
};

function getPathHelper(filepath) {
  if (path.posix.isAbsolute(filepath)) {
    return path.posix;
  } else if (path.win32.isAbsolute(filepath)) {
    return path.win32;
  } else {
    throw new Error('Filepath must be a fully resolved filepath. Got: '+ filepath);
  }
}

function validateFS(fs) {
  if (!fs) {
    throw new Error(
      'You must pass a filesystem to resolve, or undefined to use the node fs module'
    );
  }

  let missing = [
    'stat',
    'statSync',
    'readdir',
    'readdirSync',
  ].filter(method => !fs[method]);

  if (missing.length) {
    throw new Error(
      'The passed filesystem is missing the following methods: ' +
        missing.join(', ') +
        '.'
    );
  }
}
