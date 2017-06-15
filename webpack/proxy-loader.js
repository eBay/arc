var path = require('path');
var resolve = require('resolve');
var adaptiveImports = require('../');
var adaptiveImportsPath = require.resolve('../');

module.exports = function(source) {
    let target = this.target;
    let resourcePath = this.resourcePath;
    let config = JSON.parse(source);
    let proxyPath = resolve.sync(config.proxy, { basedir:path.dirname(resourcePath) });
    let matches = adaptiveImports.getFileMatches(resourcePath);

    if (target === 'node') {
         let code = `
            let config = ${source};
            let proxy = require('${proxyPath}');
            let resourcePath = '${resourcePath}';
            let getBestMatch = require('${adaptiveImportsPath}').getBestMatch;
            let matches = [${matches.map(match => {
                return `{ exports:require('${match.file}'), flags:${JSON.stringify(match.flags)}}`
            }).join(',')}];

            function requireAdapted(flags) {
                return getBestMatch(matches, flags).exports;
            }

            module.exports = proxy(requireAdapted, config);
        `;

        console.log(code);

        return code;
    } else {
        throw new Error('The proxy loader should only be used for server bundles (target=node).');
    }
}