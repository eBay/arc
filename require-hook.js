var fs = require('fs');
var path = require('path');
var resolve = require('resolve');
var getDirectoryMatches = require('./').getDirectoryMatches;

require.extensions['.adpt'] = function(module, filepath) {
    var content = fs.readFileSync(filepath, 'utf8');
    var config = JSON.parse(content);
    var loaderPath = resolve.sync(config.loader, { basedir:path.dirname(filepath) });
    var loader = require(loaderPath);

    config.filepath = filepath;
    config.module = module;

    function requireAdapted(flags) {
        var matches = getDirectoryMatches(filepath);

        return require(matches.find(match => {
            return match.flags.every(flag => flags[flag]);
        }).directory);
    }

	module.exports = loader(requireAdapted, config);
};