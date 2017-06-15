var path = require('path');
var arcResolver = require('arc-resolver');

module.exports.adaptFiles = adaptFiles;
module.exports.getOutputPath = getOutputPath;

/**
 * Get output.path to be used by webpack config
 * 
 * @param {String} dirname - your app's `__dirname`
 * @param {String} outputFolder - name of containing folder for output from webpack config
 * @param {Array} flags - combination of flags (e.g device type, screen size, brand) for one output set
 * 
 * @return {String}
 */
function getOutputPath(dirname, outputFolder, flags) {
    return path.join(dirname, outputFolder, (arcResolver.joinFlags(flags) || 'default'));
}

/**
 * Hooks into webpack resolve step to process every path through adaptive imports logic
 * Returns an object with `apply` property following webpack plugin paradigm
 * 
 * @param {Array} flags - combination of flags (e.g device type, screen size, brand) to be processed
 * 
 * @return {Object} 
 */
function adaptFiles(flags) {
    return {
        apply: (resolver) => {
            resolver.plugin('before-existing-file', (request, callback) => {
                var adaptedPath = arcResolver.adaptResource(request.path, flags);
                callback(null, Object.assign({}, request, { path: adaptedPath }));
            });
        }
    };
}
