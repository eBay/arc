var fs = require('fs');
var path = require('path');
var resolve = require('resolve');
var getFileMatches = require('./').getFileMatches;
var loadAdaptiveConfig = require('./').loadAdaptiveConfig;

require.extensions['.adpt'] = function(module, filepath) {
    var config = loadAdaptiveConfig(filepath);
    var loaderPath = resolve.sync(config.loader, { basedir:path.dirname(filepath) });
    var loader = require(loaderPath);

    config.filepath = filepath;
    config.module = module;

    function requireAdapted(flags) {
        var matches = getFileMatches(filepath);

        return require(matches.find(match => {
            return match.flags.every(flag => flags[flag]);
        }).file);
    }

    module.exports = loader(requireAdapted, config);
};