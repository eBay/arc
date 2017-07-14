var fs = require('fs');
var path = require('path');
var resolve = require('resolve');
var adaptResource = require('./').adaptResource;
var loadArcConfig = require('./').loadArcConfig;

require.extensions['.arc'] = function(module, filepath) {
    var config = loadArcConfig(filepath);
    var proxyPath = resolve.sync(config.proxy, { basedir:path.dirname(filepath) });
    var proxy = require(proxyPath);

    config.filepath = filepath;
    config.module = module;

    function requireArcComponent(flags, options) {
        return require(adaptResource(filepath, flags, options));
    }

    module.exports = proxy(requireArcComponent, config);
};