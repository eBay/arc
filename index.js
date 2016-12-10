var fs = require('fs');
var path = require('path');
var resolve = require('resolve');
var directoryListings = {};
var fileMatches = {};

exports.resolveFrom = resolveFrom;
exports.adaptFile = adaptFile;
exports.getFileMatches = getFileMatches;

function getDirectoryListing(dirname) {
    if(directoryListings[dirname]) {
        return directoryListings[dirname];
    }

    return directoryListings[dirname] = fs.readdirSync(dirname);
}

function getFileMatches(filepath) {
    if(fileMatches[filepath]) {
        return fileMatches[filepath];
    }

    var dirname = path.dirname(filepath);
    var filename = path.basename(filepath);
    var extStart = filename.lastIndexOf('.');
    var basename = filename.slice(0, extStart);
    var extension = filename.slice(extStart+1);
    var files = getDirectoryListing(dirname);
    var isIndexAdaptive = filename === 'index.adpt';
    var matches = [];
    var pattern;

    if(isIndexAdaptive) {
        pattern = /([\w\d-]+(?:\.[\w\d-]+)*)/;
    } else {
        pattern = new RegExp('^'+basename+'((?:\\.[\\w\\d-]+)*)'+'\\.'+extension+'$');
    }

    files.forEach(file => {
        var match = pattern.exec(file);
        if(match) {
            var fullpath = path.join(dirname, file);
            var stat = fs.statSync(fullpath);
            var flags = match[1].split('.');

            if(isIndexAdaptive) {
                if(!stat.isDirectory()) return;
                else fullpath = require.resolve(fullpath);
            } else {
                if(!stat.isFile()) return;
                else flags = flags.slice(1);
            }

            matches.push({ file:fullpath, flags });
        }
    });

    matches.sort((a, b) => (
        b.flags.length - a.flags.length
    ));

    return fileMatches[filepath] = matches;
}

function adaptFile(filepath, flags) {
    var matches = getFileMatches(filepath);

    return matches.find(match => {
        return match.flags.every(flag => flags[flag]);
    }).file;
}

function resolveFrom(requestingFile, targetFile, options) {
    var flags = options.flags;
    var extensions = (options.extensions || []).concat('.adpt');

    var resolvedFile = resolve.sync(targetFile, {
        basedir: path.dirname(requestingFile),
        extensions: extensions || ['.js']
    });

    if(path.basename(resolvedFile))

    var adaptedFile = adaptFile(resolvedFile, flags);

    return adaptedFile === requestingFile ? resolvedFile : adaptedFile;
}
