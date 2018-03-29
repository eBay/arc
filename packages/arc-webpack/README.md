# arc-webpack

<a href="https://www.ebay.com">
   <img src="https://img.shields.io/badge/ebay-open%20source-01d5c2.svg" alt="ebay open source"/>
</a>
<a href="https://img.shields.io/github/license/eBay/arc.svg">
   <img src="https://img.shields.io/github/license/eBay/arc.svg" alt="MIT licensed"/>
</a>
<a href="https://travis-ci.org/eBay/arc">
   <img src="https://travis-ci.org/eBay/arc.svg?branch=master" alt="travisci build"/>
</a>
<a href="https://codecov.io/gh/eBay/arc/list/master/packages/arc-webpack">
  <img src="https://codecov.io/gh/eBay/arc/branch/master/graph/badge.svg" alt="Codecov" />
</a>
<a href="https://www.npmjs.com/package/arc-webpack">
   <img src="https://img.shields.io/npm/v/arc-webpack/next.svg" alt="npm version"/>
</a>
<a href="http://npm-stat.com/charts.html?package=arc-webpack">
   <img src="https://img.shields.io/npm/dm/arc-webpack.svg" alt="downloads"/>
</a>



## Example 

### Bundle for desktop

```js
import webpack from 'webpack';
import AdaptivePlugin from 'arc-webpack';

let compiler = webpack({
  // ...
  plugins: [
      new AdaptivePlugin({ flags: { desktop: true } })
  ]
});
```

### Bundle for node.js server

```js
import webpack from 'webpack';
import AdaptivePlugin from 'arc-webpack';

let compiler = webpack({
  target: 'async-node',
  // ...
  plugins: [
    new AdaptivePlugin({ proxy: true })
  ]
});
```