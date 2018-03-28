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
  let stringify = JSON.stringify;
  let code = `
       let Proxy = require('arc-server/proxy');
       let Resolver = require('arc-resolver');
       let matches = Resolver.createMatchSet([${matches
         .map((path, flags) => {
           return `{ value:require(${stringify(path)}), flags:${stringify(flags)}}`;
         })
         .join(',')}]);

       module.exports = new Proxy(matches);
   `;

  return code;
};
