let js = JSON.stringify;
let loaderUtils = require('loader-utils');

try {
  require.resolve('arc-server/proxy');
} catch (e) {
  /* istanbul ignore next: give a helpful error if the user doesn't have arc-server installed */
  throw new Error(
    "Using proxy with `arc-webpack` requires that you have `arc-server` installed as a dependency of your project, but we can't find it."
  );
}

module.exports = function(source) {
  let options = loaderUtils.getOptions(this);
  let matches = options.matches;
  let query = options.query || '';
  let code = `
    let Proxy = require('arc-server/proxy');
    let MatchSet = require('arc-resolver').MatchSet;
    let matches = new MatchSet([${
      Array.from(matches).map(({ value, flags }) => {
        return `{ value:require(${js(value + query)}), flags:${js(flags)}}`;
      }).join(',')
    }]);

    module.exports = new Proxy(matches);
  `;

  return code;
};
