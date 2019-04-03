let AdaptiveFS = require('arc-fs');
let proxyLoaderPath = require.resolve('./proxy-loader');

class AdaptivePlugin {
  constructor({ flags, proxy } = {}) {
    if(!flags && !proxy) {
      throw new Error('The AdaptivePlugin should be passed flags or proxy should be true.');
    }

    this.flags = flags;
    this.proxy = proxy || false;
  }
  apply(compiler) {
    let fs = compiler.inputFileSystem;
    let afs = new AdaptiveFS({ fs, flags: this.flags });
    compiler.inputFileSystem = afs;
    if (this.proxy) {
      compiler.hooks.normalModuleFactory.tap("arc", normalModuleFactory => {
        normalModuleFactory.hooks.afterResolve.tap("arc", data => {
          if (data.resourceResolveData.context.issuer !== __filename) {
            if (afs.isAdaptiveSync(data.resource)) {
              let matches = afs.getMatchesSync(data.resource);
              data.loaders = [{
                options: {
                  matches
                },
                loader: proxyLoaderPath
              }];
              data.request = data.resource = __filename + '?proxy=' + data.resource;
            }
          }
        });
      });
    }
  }
}

module.exports = AdaptivePlugin;
