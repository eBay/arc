var fs = require('fs');
var path = require('path');
var resolve = require('resolve');
var adaptResource = require('./').adaptResource;
var loadAdaptiveConfig = require('./').loadAdaptiveConfig;

require.extensions['.adaptive'] = function(module, filepath) {
    var config = loadAdaptiveConfig(filepath);
    var proxyPath = resolve.sync(config.proxy, { basedir:path.dirname(filepath) });
    var proxy = require(proxyPath);

    config.filepath = filepath;
    config.module = module;

    function requireAdapted(flags) {
        return require(adaptResource(filepath, flags));
    }

    module.exports = proxy(requireAdapted, config);
};