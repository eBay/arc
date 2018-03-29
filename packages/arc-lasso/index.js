let path = require('path');
let AdaptiveFS = require('arc-fs');

module.exports = function(lasso, config) {
    lasso.config.resolver = {
        postResolve: function(resolvedInfo, lassoContext) {
            let afs = new AdaptiveFS({ flags: lassoContext.flags.flagMap });
            let originalPath = resolvedInfo.path;
            let adaptedPath = resolvedInfo.path = afs.resolveSync(originalPath);

            if (originalPath != adaptedPath) {
                delete resolvedInfo.meta;
                // console.log(originalPath, '→', path.relative(path.dirname(originalPath), adaptedPath));
            }
        }
    }
}