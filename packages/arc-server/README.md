# arc-server

## API

The `arc-server` api is split into 3 submodules:

### `arc-server`

#### `beginContext`
#### `setFlags`
#### `getFlags`

### `arc-server/install`

### `arc-server/proxy`

## Caveats

### One level deep

```js
let arc = require('arc-server');
let helpers = require('./helpers');
arc.beginContext(() => {
   // no flags
   helpers.getFileName() === '/path/to/helpers.js'

   // getFileName is now resolved and no longer adaptive
   let getFileName = helpers.getFileName;
   getFileName() === '/path/to/helpers.js';

   // set a flag
   arc.setFlags(['flagged']);

   // with flag
   helpers.getFileName() === '/path/to/helpers[flagged].js'

   // still the function prior to setting the new flag
   getFileName() === '/path/to/helpers.js';
});
```

### Bound functions

Functions are bound to the adapted object:

```js
let valueOf = adaptiveValue.valueOf;

// works because it is bound
valueOf();

// this doesn't change, because it was previously bound
valueOf.bind(newThis);
```

### `typeof` function

Regardless of the underlying value, an adaptive value will always be `typeof` function:

```js
typeof adaptiveValue === 'function'
```

If you need the true type, you can use `valueOf`:

```js
typeof adaptiveString.valueOf() === 'string'
```

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

If you need a true primitive, you can convert an adaptive primitive to its resolved primitive value using `valueOf`:

```js
let string = adaptiveString.valueOf();
```

