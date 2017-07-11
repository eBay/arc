var path = require('path');
var arcResolver = require('arc-resolver');

module.exports = function(lasso, config) {
    lasso.config.resolver = {
        postResolve: function(resolvedInfo, lassoContext) {
            var original = resolvedInfo.path;
            if (/\.arc$/.test(original)) {
                resolvedInfo.path = arcResolver.adaptResource(resolvedInfo.path, lassoContext.flags.flagMap);
            }
            if (original != resolvedInfo.path) {
                delete resolvedInfo.meta;
                console.log(original, '→', path.relative(path.dirname(original), resolvedInfo.path));
            }
        }
    }
    lasso.dependencies.registerRequireType('arc', {
        read: function() {
            return 'throw new Error("Something went wrong with the arc-lasso plugin.  The read function should not be called");';
        }
    });
}