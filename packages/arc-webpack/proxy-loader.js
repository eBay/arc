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
  let code = `
       let Proxy = require('arc-server/proxy');
       let matches = [${matches
         .map(match => {
           return `{ exports:require('${match.path}'), flags:${JSON.stringify(
             match.flags
           )}}`;
         })
         .join(',')}];

       module.exports = new Proxy(matches);
   `;

  return code;
};
