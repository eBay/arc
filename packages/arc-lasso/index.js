let path = require('path');
let AdaptiveFS = require('arc-fs');
let fsCache = new WeakMap();

module.exports = function(lasso, config) {
    lasso.config.resolver = {
        postResolve: function(resolvedInfo, lassoContext) {
            let flags = lassoContext.flags.flagMap;
            let afs = fsCache.get(flags);

            if (!afs) {
                afs = new AdaptiveFS({ flags });
                fsCache.set(flags, afs);
            }

            let originalPath = resolvedInfo.path;
            let adaptedPath = resolvedInfo.path = afs.resolveSync(originalPath);

            if (originalPath != adaptedPath) {
                delete resolvedInfo.meta;
                // console.log(originalPath, '→', path.relative(path.dirname(originalPath), adaptedPath));
            }
        }
    }
}
