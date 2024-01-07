const resolve = require("rollup-plugin-node-resolve");
const AdaptiveFS = require('arc-fs');
const PROXY_SUFFIX = "?arc-proxy";

module.exports = function({ proxy, flags, ...additionalOptions } = {}) {
  if (!flags && !proxy) {
    throw new Error("The arc-rollup plugin should be passed flags to be used when resolving files or proxy:true should be passed.")
  }

  const afs = new AdaptiveFS({ flags });
  const plugin = resolve({
    ...additionalOptions,
    customResolveOptions: {
      ...additionalOptions.customResolveOptions,
      readFile: afs.readFile,
      isFile(file, cb) {
        afs.stat(file, function (err, stat) {
          if (!err) {
            return cb(null, stat.isFile() || stat.isFIFO());
          }
          if (err.code === 'ENOENT' || err.code === 'ENOTDIR') return cb(null, false);
          return cb(err);
        });
      },
      isDirectory(dir, cb) {
        afs.stat(dir, function (err, stat) {
          if (!err) {
            return cb(null, stat.isDirectory());
          }
          if (err.code === 'ENOENT' || err.code === 'ENOTDIR') return cb(null, false);
          return cb(err);
        });
      }
    }
  });

  const originalResolveId = plugin.resolveId;
  plugin.resolveId = async function (importee, importer) {
    const result = await originalResolveId(importee, importer);
    if (result && result.id) {
      if (proxy) {
        if (importer !== result.id + PROXY_SUFFIX && afs.isAdaptiveSync(result.id)) {
          result.id += PROXY_SUFFIX
        }
      } else {
        result.id = afs.resolveSync(result.id);
      }
    }
    return result;
  }

  if (proxy) {
    plugin.load = function (id) {
      if (id.endsWith(PROXY_SUFFIX)) {
        const file = id.slice(0, -PROXY_SUFFIX.length);
        const matches = afs.getMatchesSync(file);
        const code = `
          import Proxy from "arc-server/proxy";
          import { MatchSet } from "arc-resolver";
          ${
            Array.from(matches).map(({ value }, index) => {
              return `import * as target_${index} from ${JSON.stringify(value)};`;
            }).join('\n')
          }

          const matches = new MatchSet([${
            Array.from(matches).map(({ flags }, index) => {
              return `{ value:target_${index}, flags:${JSON.stringify(flags)} }`;
            }).join(',')
          }]);

          export default new Proxy(matches);
        `;
        return code;
      }
    }
  }

  return plugin;
}