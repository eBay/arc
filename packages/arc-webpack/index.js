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
      compiler.hooks.compilation.tap("arc", compilation => {
        compilation.hooks.normalModuleLoader.tap("arc", (loaderContext, module) => {
          if(module.issuer && module.issuer.resource === __filename) return;
          if(afs.isAdaptiveSync(module.userRequest)) {
            let matches = afs.getMatchesSync(module.userRequest);
            module.loaders = [{
              options: {
                matches
              },
              loader: proxyLoaderPath
            }];
            module.resource = __filename;
          }
        });
      });
    }
  }
}

module.exports = AdaptivePlugin;
