<center>
   <img width="300" src="./logo.png"/><br>
   [![Build Status](https://travis-ci.org/ebay/arc.svg?branch=master)](https://travis-ci.org/ebay/arc)
   [![Coverage Status](https://coveralls.io/repos/github/ebay/arc/badge.svg?branch=master&cache-bust=5)](https://coveralls.io/github/ebay/arc?branch=master)
   [![NPM](https://img.shields.io/npm/v/arc-resolver.svg)](https://www.npmjs.com/package/arc-resolver)
   [![Downloads](https://img.shields.io/npm/dm/arc-resolver.svg)](http://npm-stat.com/charts.html?package=arc-resolver)
</center>
<br>

`arc` uses “flags” and a [file naming convention](#file-based-flags) (`file[flags].ext`) to generate and serve a bundle that contains only the resources used by the requesting environment. It hooks into module resolution and is not bound to any specific framework.

`arc` allows us to build web applications that serve only the code necessary for multiple device types, locales, brands - all from a single codebase.

The flexibility of `arc` enables us to only diverge components when necessary, and works for both client and server rendering.

## Use cases

### Multiple platforms

For example, swap out a header component based on the user's device type:

```
header[mobile].js
header[desktop].js
```

Then, in your React component:

```jsx
import Header from "./header.js";

export default () => (
   <Header/>
);
```

### Internationalization (i18n)

For example, swap out a content bundle based on the user's locale:

```
content[de].json
content[en].json
content[es].json
content[fr].json
```

Then, in your Marko component:

```marko
import content from "./content.json";

<h1>${content.welcomeMessage}</h1>
```

### Branding

For example, swap out a logo based on the brand the user is visiting:

```
logo[ebay].svg
logo[gumtree].svg
logo[vivanuncious].svg
```

Then, in your `.html` file:

```html
<img src="./logo.svg"/>
```

## Supported environments

Please refer to the linked documentation for using `arc` in each environment:

- Node 8+ ([`arc-server`](./packages/arc-server))
- Webpack 4+ ([`arc-webpack`](./packages/arc-webpack))
- Lasso 3+ ([`arc-lasso`](./packages/arc-lasso))

## File-based flags

`arc` adapts files based on a filenaming convension:

```
style.css
style[mobile].css
style[mobile+android].css
```

However, you write your application as though the flagged version of files did not exist:

```css
@import url('./style.css');
```

If both the `mobile` and `android` flags are set, when bundling the css, `style[mobile+android].css` will replace `style.css` in the output bundle.

If only the `mobile` flag is set, when bundling the css, `style[mobile].css` will replace `style.css` in the output bundle.

### More on flags

- Read how to set flags in the documentation for each [supported environment](#supported-environments).

- Read more about using [flags in filenames](./packages/arc-resolver).

## Additional resources

### Connie & Michael on `arc 1.0` @ Fluent O'Reilly Conf 2017:

- [Session abstract](https://conferences.oreilly.com/fluent/fl-ca/public/schedule/detail/58976)    
- [Video of talk](https://vimeo.com/229162833/c2727d5436)

### Example apps

- [Simple Server](./packages/example-arc-server)
- [Isomorphic Marko with Webpack]() TODO
- [Isomorphic Marko with Lasso]() TODO
- [Isomorphic React with Webpack]() TODO
- [Client-only React with Webpack]() TODO