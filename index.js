var fs = require('fs');
var path = require('path');
var resolve = require('resolve');
var directoryListings = {};
var fileMatches = {};
var configs = {};

module.exports.adaptFile = adaptFile;
module.exports.joinFlags = joinFlags;
module.exports.loadAdaptiveConfig = loadAdaptiveConfig;
module.exports.resolveFrom = resolveFrom;

function getIndexedFlags(flags) {
    if (!Array.isArray(flags)) return flags; //assume indexed flagset
    if (flags.indexedFlags) return flags.indexedFlags;

    var indexedFlags = {};
    for (var i = 0; i < flags.length; i++) {
        indexedFlags[flags[i]] = true;
    }

    Object.defineProperty(flags, 'indexedFlags', { value: indexedFlags });
    return indexedFlags;
}

function getDirectoryListing(dirname) {
    if (directoryListings[dirname]) {
        return directoryListings[dirname];
    }

    return directoryListings[dirname] = fs.readdirSync(dirname);
}

function loadAdaptiveConfig(filepath) {
    if (configs[filepath]) {
        return configs[filepath];
    }

    var content = fs.readFileSync(filepath, 'utf8');
    var config = configs[filepath] = JSON.parse(content);

    return config;
}

function getFileMatches(filepath) {
    if (fileMatches[filepath]) {
        return fileMatches[filepath];
    }

    var dirname = path.dirname(filepath);
    var filename = path.basename(filepath);
    var extStart = filename.lastIndexOf('.');
    var basename = filename.slice(0, extStart);
    var extension = filename.slice(extStart + 1);
    var files = getDirectoryListing(dirname);
    var isIndexAdaptive = filename === 'index.adaptive';
    var matches = [];
    var hasDefault = false;
    var defaultName;
    var config;
    var pattern;

    if (isIndexAdaptive) {
        pattern = /([\w\d-]+(?:\.[\w\d-]+)*)/;
        config = loadAdaptiveConfig(filepath);
        defaultName = config && config.default || 'default';
    } else {
        pattern = new RegExp('^' + basename + '((?:\\.[\\w\\d-]+)*)' + '\\.' + extension + '$');
    }

    files.forEach(file => {
        var match = pattern.exec(file);
        if (match) {
            var fullpath = path.join(dirname, file);
            var stat = fs.statSync(fullpath);
            var flags = match[1].split('.');

            if (isIndexAdaptive) {
                if (!stat.isDirectory()) return;
                fullpath = require.resolve(fullpath);
            } else {
                if (!stat.isFile()) return;
                flags = flags.slice(1);
            }

            if (file === defaultName) {
                flags = [];
            }

            hasDefault = hasDefault || !flags.length;

            matches.push({ file: fullpath, flags });
        }
    });

    if (!hasDefault) {
        throw new Error('No default found for ' + filepath);
    }

    matches.sort((a, b) => (
        b.flags.length - a.flags.length
    ));

    return fileMatches[filepath] = matches;
}

function adaptFile(filepath, flags) {
    var indexedFlags = getIndexedFlags(flags);
    var matches = getFileMatches(filepath);

    return matches.find(match => {
        return match.flags.every(flag => indexedFlags[flag]);
    }).file;
}

function resolveFrom(requestingFile, targetFile, options) {
    var flags = options.flags;
    var extensions = (options.extensions || []).concat('.adaptive');

    var resolvedFile = resolve.sync(targetFile, {
        basedir: path.dirname(requestingFile),
        extensions: extensions || ['.js']
    });

    if (getFileMatches(resolvedFile).some(match => match.file === requestingFile)) {
        return resolvedFile;
    }

    return adaptFile(resolvedFile, flags);
}

// Alphabetize flags before joining them
function joinFlags(flags) {
    flags.sort();
    return flags.join('.');
}
