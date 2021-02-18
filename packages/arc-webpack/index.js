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

    if (this.proxy) {
      compiler.hooks.normalModuleFactory.tap('arc', normalModuleFactory => {
        normalModuleFactory.hooks.afterResolve.tap('arc', data => {
          let resource =
            (data.createData && data.createData.resource) || data.resource;
          if (!resource) {
            return;
          }

          const contextInfo =
            data.contextInfo || data.resourceResolveData.context;
          const query = (/\?.*$/.exec(resource) || '')[0] || '';
          resource = resource.slice(0, query ? -query.length : undefined);

          if (contextInfo.issuer !== resource) {
            let isAdaptive;
            try {
              isAdaptive = afs.isAdaptiveSync(resource);
            } catch (e) {
              // An error may be thrown if the resource cannot be found.
              // However this hook would not have been called if the resource
              // could not have been resolved.  We'll assume some other plugin
              // is making this resource available to webpack and that it's not
              // adaptive.
              isAdaptive = false;
            }

            if (isAdaptive) {
              const matches = afs.getMatchesSync(resource);

              (data.createData || data).loaders = [
                {
                  options: {
                    matches,
                    query
                  },
                  loader: proxyLoaderPath
                }
              ];

              data.request = resource + '?arc-proxy';
              if (data.createData) {
                data.createData.request = resource + '?arc-proxy';
              }
            }
          }
        });
      });
    } else {
      compiler.resolverFactory.hooks.resolver
        .for('normal')
        .tap('arc', resolver => {
          resolver.hooks.result.tap('arc', req => {
            try {
              req.path = afs.resolveSync(req.path);
            } catch (e) {
              // An error may be thrown if the resource cannot be found.
              // However this hook would not have been called if the resource
              // could not have been resolved.  We'll assume some other plugin
              // is making this resource available to webpack and that it's not
              // adaptive.
            }
          });
        });
    }
  }
}

module.exports = AdaptivePlugin;
