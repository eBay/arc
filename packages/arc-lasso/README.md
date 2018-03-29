# arc-lasso

<a href="https://www.ebay.com">
   <img src="https://img.shields.io/badge/ebay-open%20source-01d5c2.svg" alt="ebay open source"/>
</a>
<a href="https://img.shields.io/github/license/eBay/arc.svg">
   <img src="https://img.shields.io/github/license/eBay/arc.svg" alt="MIT licensed"/>
</a>
<a href="https://travis-ci.org/eBay/arc">
   <img src="https://travis-ci.org/eBay/arc.svg?branch=master" alt="travisci build"/>
</a>
<a href="https://codecov.io/gh/eBay/arc/list/master/packages/arc-lasso">
  <img src="https://codecov.io/gh/eBay/arc/branch/master/graph/badge.svg" alt="Codecov" />
</a>
<a href="https://www.npmjs.com/package/arc-lasso">
   <img src="https://img.shields.io/npm/v/arc-lasso/next.svg" alt="npm version"/>
</a>
<a href="http://npm-stat.com/charts.html?package=arc-lasso">
   <img src="https://img.shields.io/npm/dm/arc-lasso.svg" alt="downloads"/>
</a>

Enable adaptive resolution in `lasso`

## Usage

```js
lasso.configure({
    // ...
    plugins: [
        // ...
        'arc-lasso',
        // ...
    ],
    // ...
});
```

## Caveats

Currently only supports adaptive files that have a "base" file

**Works:**
```webidl
style.css
style[mobile].css
```

**Does NOT Work:**
```webidl
style[desktop].css
style[mobile].css
```