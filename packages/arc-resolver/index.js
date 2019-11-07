let path = require('path');
let util = require('util');
let parseFlags = require('arc-flag-parser').parse;
let flaggedPathRegex = /\[(.*)\]/;

class Resolver {
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
        matches = [{ flags: [], value: filepath }];
      } else {
        let parentMatches = this.getMatchesSync(parsed.dir, path).raw;
        matches = parentMatches.reduce(
          (matches, parent) => {
            let childMatches = this.getDirMatchesSync(
              parent.value,
              parsed.base,
              path
            );
            if (parent.flags.length) {
              childMatches = childMatches.map(child => ({
                flags: Array.from(new Set(parent.flags.concat(child.flags))),
                value: child.value
              }));
            }
            matches.push.apply(matches, childMatches);
            return matches;
          },
          []
        );
      }

      matches = this.matchCache[filepath] = new MatchSet(matches);
    }

    return matches;
  }
  getDirMatchesSync(dir, request, path) {
    const lookup = this.getDirLookupSync(dir, path);
    const matches = lookup[request] || lookup[''];

    if (!matches) {
      throw new Error(path.resolve(dir, request) + ' does not exist');
    }

    return matches;
  }
  getDirLookupSync(dir, path) {
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
          let flagsets = parseFlags(match[1]);
          if (canonicalName === '') {
            let childLookup = this.getDirLookupSync(entryPath, path);
            Object.keys(childLookup).forEach(childName => {
              let childMatches = childLookup[childName];
              let entryCache = (cache[childName] = cache[childName] || []);
              childMatches.forEach(childMatch => {
                flagsets.forEach(flagset => {
                  entryCache.push({ flags: flagset.concat(childMatch.flags), value: childMatch.value });
                });
              });
            });
          } else {
            let entryCache = (cache[canonicalName] = cache[canonicalName] || []);
            flagsets.forEach(flags =>
              entryCache.push({ flags, value: entryPath })
            );
          }
        } else {
          let entryCache = (cache[entryName] = cache[entryName] || []);
          entryCache.push({ flags: [], value: entryPath });
        }
      });

      Object.values(cache).forEach(entryCache => {
        entryCache.sort((a, b) => b.flags.length - a.flags.length);
      });

      this.dirCache[dir] = cache;
    }

    return cache;
  }
  resolveSync(filepath, flags) {
    if (typeof filepath !== 'string') {
      throw new TypeError('Filepath must be a string.');
    }

    if (!flags || typeof flags !== 'object') {
      throw new TypeError('Flags must be an object.');
    }

    return this.getMatchesSync(filepath).match(flags);
  }
  isAdaptiveSync(filepath) {
    if (typeof filepath !== 'string') {
      throw new TypeError('Filepath must be a string.');
    }

    return this.getMatchesSync(filepath).count > 1;
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
class MatchSet {
  constructor(matches) {
    this.raw = matches;
  }
  get default() {
    return this.raw[this.raw.length-1].value;
  }
  get count() {
    return this.raw.length
  }
  map(fn) {
    return new MatchSet(this.raw.map(({ flags, value }, index) => ({
      flags: flags,
      value: fn(value, flags, index)
    })));
  }
  match(flags) {
    let match = this.raw.find(match => match.flags.every(flag => flags[flag]));

    if (!match) {
      throw new Error('No match found');
    }

    return match.value;
  }
  [Symbol.iterator]() {
    return this.raw[Symbol.iterator]();
  }
}

module.exports = Resolver;
module.exports.MatchSet = MatchSet;