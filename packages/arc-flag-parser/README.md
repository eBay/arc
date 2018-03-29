# arc-flag-parser

<a href="https://www.ebay.com">
   <img src="https://img.shields.io/badge/ebay-open%20source-01d5c2.svg" alt="ebay open source"/>
</a>
<a href="https://img.shields.io/github/license/eBay/arc.svg">
   <img src="https://img.shields.io/github/license/eBay/arc.svg" alt="MIT licensed"/>
</a>
<a href="https://travis-ci.org/eBay/arc">
   <img src="https://travis-ci.org/eBay/arc.svg?branch=master" alt="travisci build"/>
</a>
<a href="https://codecov.io/gh/eBay/arc/list/master/packages/arc-flag-parser">
  <img src="https://codecov.io/gh/eBay/arc/branch/master/graph/badge.svg" alt="Codecov" />
</a>
<a href="https://www.npmjs.com/package/arc-flag-parser">
   <img src="https://img.shields.io/npm/v/arc-flag-parser/next.svg" alt="npm version"/>
</a>
<a href="http://npm-stat.com/charts.html?package=arc-flag-parser">
   <img src="https://img.shields.io/npm/dm/arc-flag-parser.svg" alt="downloads"/>
</a>

Parse arc flag expressions to arrays of flag matches

## Syntax

- `+` represents AND
- `,` represents OR
- AND (`+`) has higher precedence than OR (`,`)
- `[]` is used to increase the precedence of the wrapped group

## Examples

```js
import { parse } from 'arc-flag-parser';
parse('mobile+ios') // [ ['mobile', 'ios'] ]
```

```js
import { parse } from 'arc-flag-parser';
parse('mobile,ios') // [ ['mobile'], ['ios'] ]
```

```js
import { parse } from 'arc-flag-parser';
parse('mobile+[ios,android]') // [ ['mobile', 'ios'], ['mobile', 'android'] ]
```

See [`test.js`](./test.js) for more examples
