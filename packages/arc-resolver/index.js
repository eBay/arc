var fs = require('fs');
var path = require('path');
var resolve = require('resolve');
var directoryListings = {};
var fileMatches = {};
var configs = {};

module.exports.adaptResource = adaptResource;
module.exports.joinFlags = joinFlags;
module.exports.loadArcConfig = loadArcConfig;
module.exports.resolveFrom = resolveFrom;
module.exports.getFileMatches = getFileMatches;
module.exports.getBestMatch = getBestMatch;

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

function loadArcConfig(filepath) {
    if (configs[filepath]) {
        return configs[filepath];
    }

    var content = fs.readFileSync(filepath, 'utf8');
    var config = configs[filepath] = JSON.parse(content);

    return config;
}

function getFileMatches(filepath, extensions) {
    if (fileMatches[filepath]) {
        return fileMatches[filepath];
    }

    var dirname = path.dirname(filepath);
    var filename = path.basename(filepath);
    var extStart = filename.lastIndexOf('.');
    var basename = filename.slice(0, extStart);
    var extension = filename.slice(extStart + 1);
    var files = getDirectoryListing(dirname);
    var isIndexAdaptive = filename === 'index.arc';
    var matches = [];
    var hasDefault = false;
    var defaultName;
    var config;
    var pattern;

    if (isIndexAdaptive) {
        pattern = /([\w\d-]+(?:\.[\w\d-]+)*)/;
        config = loadArcConfig(filepath);
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
                fullpath = resolve.sync(fullpath, {
                    basedir: path.dirname(fullpath),
                    extensions: extensions || ['.js']
                });
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

    return fileMatches[filepath] = matches;
}

// Utility function to get directory matches
function getDirMatches(filepath) {
    if (fileMatches[filepath]) {
        return fileMatches[filepath];
    }

    var parentDir = path.dirname(filepath);
    var basename = path.basename(filepath);
    var contents = getDirectoryListing(parentDir);
    var matches = [];

    contents.forEach(dir => {
        var fullpath = path.join(parentDir, dir);
        // We only want to operate on the directories
        var stat = fs.statSync(fullpath);
        if (!stat.isDirectory()) return;

        var flags = dir.split('.');

        if (dir === basename) {
            flags = [];
        }

        matches.push({ file: fullpath, flags });
    });

    return fileMatches[filepath] = matches;
}

function adaptResource(filepath, flags, options) {
    if (!options) options = {};
    var stat = fs.statSync(filepath);
    var matches = [];

    if (stat.isFile()) {
        matches = getFileMatches(filepath, options.extensions);
    } else if (stat.isDirectory()) {
        matches = getDirMatches(filepath);
    }

    return getBestMatch(matches, flags).file;
}

function resolveFrom(requestingFile, targetFile, options) {
    var flags = options.flags;
    var extensions = (options.extensions || []).concat('.arc');

    var resolvedFile = resolve.sync(targetFile, {
        basedir: path.dirname(requestingFile),
        extensions: extensions || ['.js']
    });

    if (getFileMatches(resolvedFile).some(match => match.file === requestingFile)) {
        return resolvedFile;
    }

    return adaptResource(resolvedFile, flags);
}

// Alphabetize flags before joining them
function joinFlags(flags) {
    flags.sort();
    return flags.join('.');
}

// Return best matching filepath
function getBestMatch(matches, flags) {
    var indexedFlags = getIndexedFlags(flags);
    var bestMatchObj = {};
    var bestMatchFile = '';

    matches.sort((a, b) => (
        b.flags.length - a.flags.length
    ));

    bestMatchObj = matches.find(match => {
        return match.flags.every(flag => indexedFlags[flag]);
    });

    return bestMatchObj;
}
