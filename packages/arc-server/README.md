# arc-server

<a href="https://www.ebay.com">
   <img src="https://img.shields.io/badge/ebay-open%20source-01d5c2.svg" alt="ebay open source"/>
</a>
<a href="https://img.shields.io/github/license/eBay/arc.svg">
   <img src="https://img.shields.io/github/license/eBay/arc.svg" alt="MIT licensed"/>
</a>
<a href="https://travis-ci.org/eBay/arc">
   <img src="https://travis-ci.org/eBay/arc.svg?branch=master" alt="travisci build"/>
</a>
<a href="https://codecov.io/gh/eBay/arc/list/master/packages/arc-server">
  <img src="https://codecov.io/gh/eBay/arc/branch/master/graph/badge.svg" alt="Codecov" />
</a>
<a href="https://www.npmjs.com/package/arc-server">
   <img src="https://img.shields.io/npm/v/arc-server/next.svg" alt="npm version"/>
</a>
<a href="http://npm-stat.com/charts.html?package=arc-server">
   <img src="https://img.shields.io/npm/dm/arc-server.svg" alt="downloads"/>
</a>

## API

The `arc-server` api is split into 3 submodules:

### `arc-server`

```js
import { setFlagsForContext, getFlags } from 'arc-server';
```

- `setFlagsForContext(flags, fn)`: begins a new context.  any calls made from `fn` can use `getFlags` to get the passed `flags`
- `getFlags()`: get flags for the current context
- `useCustomFlagContext(fn)`: allows using a custom context to store flags.  `fn` is a function that should return the current flagset from the custom context. when using a custom context, `setFlagsForContext` should not be used.

#### Example

```js
import { setFlagsForContext, getFlags } from 'arc-server/install';

function start(flags, delay) {
    setFlagsForContext(flags, () => {
        wait(delay);
    }));
}

function wait(delay) {
    setTimeout(logFlags, delay);
}

function logFlags() {
    // The flags weren't passed here, but we can get them from the context
    console.log(getFlags());
}

start(['foo'], 100);
start(['bar'], 10);
start(['baz'], 50);

// After 10ms, { bar:true } is logged
// After 50ms, { baz:true } is logged
// After 100ms, { foo:true } is logged
```

Example usage in [`example-arc-server/index.js`](../example-arc-server/index.js)

### `arc-server/install`

```js
import 'arc-server/install';
```

If you are not bundling your server files with another `arc` plugin, you should `import`/`require` this module near the beginning of your application entry point _before_ loading any modules that need to be adaptable.  

### `arc-server/proxy`

```js
import AdaptiveProxy from 'arc-server/proxy';
```

An `AdaptiveProxy` is returned from an `import`/`require` call.  It can be treated as if it were the underlying module (with a few [caveats](#proxy-caveats).  You probably won't need to use this module directly.  

#### `new AdaptiveProxy(matches)`

- **`matches`**: a [`MatchSet`](../arc-resolver/README.md#matchset) where each value is the loaded module

#### Proxy caveats

### Primitive values
Applies if you require an adaptive file that sets `exports` to a primitive value:

```js
module.exports = "Hello World";
```

[Proxy](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy) and [Reflect](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Reflect) are used to provide adaptive values, but these do not support primitive values (`string`, `number`, `boolean`).    

To work around this, these primitives are converted into _instances_ of `String`, `Number`, or `Boolean`.  In many cases, you will be able to treat this as if it were the original value, but there are [differences](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String#Distinction_between_string_primitives_and_String_objects).

One notable example is truthiness:
```js
// Objects are truthy, regardless of value
!!(new Boolean(false)) === true;
!!(new String('')) === true;
!!(new Number(0)) === true;
```

Another is `typeof`:
```js
// typeof is object, regardless of value
typeof new Boolean(true) === 'object';
typeof new String('hello') === 'object';
typeof new Number(10) === 'object';
```

If you need a true primitive, you can convert an adaptive primitive to its resolved primitive value using `valueOf`:

```js
let string = adaptiveString.valueOf();
```

### Autobound `Object.prototype` functions

Functions from `Object.prototype` are bound to the adapted object:

```js
let valueOf = adaptiveValue.valueOf;

// works because it is bound
valueOf();

// this doesn't change, because it was previously bound
valueOf.bind(newThis);
```