let path = require('path');
let util = require('util');
let parseFlags = require('arc-flag-parser').parse;
let flaggedPathRegex = /\[(.*)\]/;

module.exports = class Resolver {
  constructor(fs = require('fs')) {
    validateFS(fs);
    this.fs = fs;
    this.fs.stat = util.promisify(this.fs.stat);
    this.fs.readdir = util.promisify(this.fs.readdir);
    this.dirCache = {};
    this.matchCache = {};
  }
  clearCache() {
    this.dirCache = {};
    this.matchCache = {};
  }
  getMatchesSync(filepath, path) {
    if (typeof filepath !== 'string') {
      throw new TypeError('Filepath must be a string.');
    }

    let matches = this.matchCache[filepath];

    if (!matches) {
      path = path || getPathHelper(filepath);
      let parsed = path.parse(filepath);
      if (parsed.root === filepath || flaggedPathRegex.test(parsed.base)) {
        matches = this.matchCache[filepath] = [{ flags: [], path: filepath }];
      } else {
        let parentMatches = this.getMatchesSync(parsed.dir, path);
        matches = this.matchCache[filepath] = parentMatches.reduce(
          (matches, parent) => {
            let childMatches = this.getDirMatchesSync(
              parent.path,
              parsed.base,
              path
            );
            if (parent.flags.length) {
              childMatches = childMatches.map(child => ({
                flags: Array.from(new Set(parent.flags.concat(child.flags))),
                path: child.path
              }));
            }
            matches.push.apply(matches, childMatches);
            return matches;
          },
          []
        );
      }
    }

    return matches;
  }
  getDirMatchesSync(dir, request, path) {
    let fs = this.fs;
    let cache = this.dirCache[dir];

    if (!cache) {
      let entries = fs.readdirSync(dir);

      cache = {};

      entries.forEach(entryName => {
        let entryPath = path.join(dir, entryName);
        let match = flaggedPathRegex.exec(entryName);
        if (match) {
          let canonicalName = entryName.replace(match[0], '');
          let entryCache = (cache[canonicalName] = cache[canonicalName] || []);
          let flagsets = parseFlags(match[1]);
          flagsets.forEach(flags =>
            entryCache.push({ flags, path: entryPath })
          );
        } else {
          let entryCache = (cache[entryName] = cache[entryName] || []);
          entryCache.push({ flags: [], path: entryPath });
        }
      });

      Object.values(cache).forEach(entryCache => {
        entryCache.sort((a, b) => b.flags.length - a.flags.length);
      });

      this.dirCache[dir] = cache;
    }

    let matches = cache[request];

    if (!matches) {
      throw new Error(path.resolve(dir, request) + ' does not exist');
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

    let matches = this.getMatchesSync(filepath);
    let match = matches.find(match => match.flags.every(flag => flags[flag]));

    if (!match) {
      throw new Error('No match found for ' + filepath);
    }

    return match.path;
  }
  isAdaptiveSync(filepath) {
    if (typeof filepath !== 'string') {
      throw new TypeError('Filepath must be a string.');
    }

    return this.getMatchesSync(filepath).length > 1;
  }
};

function getPathHelper(filepath) {
  if (path.posix.isAbsolute(filepath)) {
    return path.posix;
  } else if (path.win32.isAbsolute(filepath)) {
    return path.win32;
  } else {
    throw new Error(
      'Filepath must be a fully resolved filepath. Got: ' + filepath
    );
  }
}

function validateFS(fs) {
  if (!fs) {
    throw new Error(
      'You must pass a filesystem to resolve, or undefined to use the node fs module'
    );
  }

  let missing = ['stat', 'statSync', 'readdir', 'readdirSync'].filter(
    method => !fs[method]
  );

  if (missing.length) {
    throw new Error(
      'The passed filesystem is missing the following methods: ' +
        missing.join(', ') +
        '.'
    );
  }
}
