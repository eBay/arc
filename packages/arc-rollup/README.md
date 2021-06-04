# arc-rollup

<a href="https://www.ebay.com">
   <img src="https://img.shields.io/badge/ebay-open%20source-01d5c2.svg" alt="ebay open source"/>
</a>
<a href="https://img.shields.io/github/license/eBay/arc.svg">
   <img src="https://img.shields.io/github/license/eBay/arc.svg" alt="MIT licensed"/>
</a>
<a href="https://travis-ci.org/eBay/arc">
   <img src="https://travis-ci.org/eBay/arc.svg?branch=master" alt="travisci build"/>
</a>
<a href="https://codecov.io/gh/eBay/arc/list/master/packages/arc-rollup">
  <img src="https://codecov.io/gh/eBay/arc/branch/master/graph/badge.svg" alt="Codecov" />
</a>
<a href="https://www.npmjs.com/package/arc-rollup">
   <img src="https://img.shields.io/npm/v/arc-rollup.svg" alt="npm version"/>
</a>
<a href="http://npm-stat.com/charts.html?package=arc-rollup">
   <img src="https://img.shields.io/npm/dm/arc-rollup.svg" alt="downloads"/>
</a>

## API

The `arc-rollup` plugin is a drop-in replacement for [`rollup-plugin-node-resolve`](https://github.com/rollup/rollup-plugin-node-resolve) that provides flag-based adaptive resolution in addition to node's [module resolution](https://nodejs.org/api/modules.html#modules_all_together).  It is built on `rollup-plugin-node-resolve` and supports all the same options, plus the following:

### `flags`

The flagset to use when resolving adaptive files.

### `proxy` _(unstable)_

When `true`, compiles to use `arc-server/proxy` instead of resolving to a specfic resolution of an adaptive file.  This only supports default exports for adaptive modules (named exports and commonjs are not supported).  Until this limitation is addressed, it is recommended to use the `arc-server/install` hook when loading adaptive files in Node.js.

## Examples 

### Create multiple bundles for different flagsets

```js
import resolve from "arc-rollup";

export default [{ desktop:true }, { mobile:true }].map(flags => ({
  input: "main.js",
  output: {
    file: `bundle-${Object.keys(flags).join("-")}.js`,
    format: "iife"
  },
  plugins: [
    resolve({ flags })
  ]
});
```

### Bundle for Node.js

```js
import resolve from "arc-rollup";
import commonjs from "rollup-plugin-commonjs";
import builtins from "builtin-modules";

export default {
  input: "server.js",
  output: {
    file: `bundle.js`,
    format: "cjs"
  },
  plugins: [
    resolve({ proxy:true }),
    commonjs()
  ],
  externals: builtins
};
```