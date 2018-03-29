# arc-fs

<a href="https://www.ebay.com">
   <img src="https://img.shields.io/badge/ebay-open%20source-01d5c2.svg" alt="ebay open source"/>
</a>
<a href="https://img.shields.io/github/license/eBay/arc.svg">
   <img src="https://img.shields.io/github/license/eBay/arc.svg" alt="MIT licensed"/>
</a>
<a href="https://travis-ci.org/eBay/arc">
   <img src="https://travis-ci.org/eBay/arc.svg?branch=master" alt="travisci build"/>
</a>
<a href="https://codecov.io/gh/eBay/arc/list/master/packages/arc-fs">
  <img src="https://codecov.io/gh/eBay/arc/branch/master/graph/badge.svg" alt="Codecov" />
</a>
<a href="https://www.npmjs.com/package/arc-fs">
   <img src="https://img.shields.io/npm/v/arc-fs/next.svg" alt="npm version"/>
</a>
<a href="http://npm-stat.com/charts.html?package=arc-fs">
   <img src="https://img.shields.io/npm/dm/arc-fs.svg" alt="downloads"/>
</a>

Wrap a filesystem to provide a read-only [`fs` api](https://nodejs.org/dist/latest-v9.x/docs/api/fs.html) that adapts files according to an active flagset

## API

### `new AdaptiveFS(options);`

- **`options.fs`** (_optional_): a filesystem that conforms to the node.js `fs` api. Defaults to the built-in `fs` module
- **`options.flags`** (_required_): an `Object` where each key represents a flag and the value is a boolean indicating whether that flag is active or `Array` of strings that represent the active flags

### Instance methods

#### `resolveSync(path)`

Returns the resolved path based on the active flagset

#### `getMatchesSync(path)`

Returns a `MatchSet` for the path

#### `isAdaptiveSync(path)`

Returns a boolean indicating if the path can be adapted

#### `clearCache()`

Clears the adaptive resolver's cache

#### Read methods from `fs`

- `stat`
- `statSync`
- `readdir`
- `readdirSync`
- `readFile`
- `readFileSync`
- `readlink`
- `readlinkSync`
- `exists`
- `existsSync`

## Examples

### Default filesystem

```js
import fs from 'fs';
import AdaptiveFS from 'arc-fs';

const afs = new AdaptiveFS({ flags:['test'] });

fs.writeFileSync('message[test].txt', 'Hello Test');
afs.readFileSync('message.txt'); // Hello Test
```

### In-Memory filesystem

```js
import MemoryFS from 'memory-fs';
import AdaptiveFS from 'arc-fs';

const mfs = new MemoryFS();
const afs = new AdaptiveFS({ fs:mfs, flags:['test'] });

mfs.writeFileSync('message[test].txt', 'Hello Test');
afs.readFileSync('message.txt'); // Hello Test
```