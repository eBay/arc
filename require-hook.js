var fs = require('fs');
var path = require('path');
var resolve = require('resolve');
var adaptFile = require('./').adaptFile;
var loadAdaptiveConfig = require('./').loadAdaptiveConfig;

require.extensions['.adaptive'] = function(module, filepath) {
    var config = loadAdaptiveConfig(filepath);
    var proxyPath = resolve.sync(config.proxy, { basedir:path.dirname(filepath) });
    var proxy = require(proxyPath);

    config.filepath = filepath;
    config.module = module;

    function requireAdapted(flags) {
        return require(adaptFile(filepath, flags));
    }

    module.exports = proxy(requireAdapted, config);
};