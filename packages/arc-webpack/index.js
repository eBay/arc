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

    compiler.inputFileSystem = new Proxy(afs, {
      get(afs, property) {
        if (afs[property]) {
          return afs[property];
        }
        const value = fs[property];
        if (typeof value === 'function') {
          return value.bind(fs);
        } else {
          return value;
        }
      },
      set(afs, property, value) {
        fs[property] = value;
      }
    });

    compiler.hooks.normalModuleFactory.tap('arc', normalModuleFactory => {
      normalModuleFactory.hooks.afterResolve.tap('arc', data => {
        const query = (/\?.*$/.exec(data.resource) || '')[0] || '';
        const resource = data.resource.slice(0, query ? -query.length : undefined);
        if (this.proxy) {
          if (data.resourceResolveData.context.issuer !== __filename) {
            let isAdaptive;
            try {
              isAdaptive = afs.isAdaptiveSync(resource);
            } catch(e) {
              // An error may be thrown if the resource cannot be found.
              // However this hook would not have been called if the resource
              // could not have been resolved.  We'll assume some other plugin
              // is making this resource available to webpack and that it's not 
              // adaptive.
              isAdaptive = false;
            }

            if (isAdaptive) {
              let matches = afs.getMatchesSync(resource);
              data.loaders = [{
                options: {
                  matches,
                  query
                },
                loader: proxyLoaderPath
              }];
              data.request = data.resource = __filename + '?proxy=' + data.resource;
            }
          }
        } else {
          try {
            const resolvedResource = afs.resolveSync(resource);
            if (resolvedResource !== resource) {
              data.resource = resolvedResource + query;
              data.request = data.request.replace(resource, resolvedResource);
            }
          } catch(e) {
            // An error may be thrown if the resource cannot be found.
            // However this hook would not have been called if the resource
            // could not have been resolved.  We'll assume some other plugin
            // is making this resource available to webpack and that it's not 
            // adaptive.
          }
        }
      });
    });
  }
}

module.exports = AdaptivePlugin;
