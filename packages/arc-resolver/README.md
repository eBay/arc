# arc-resolver

<a href="https://www.ebay.com">
   <img src="https://img.shields.io/badge/ebay-open%20source-01d5c2.svg" alt="ebay open source"/>
</a>
<a href="https://img.shields.io/github/license/eBay/arc.svg">
   <img src="https://img.shields.io/github/license/eBay/arc.svg" alt="MIT licensed"/>
</a>
<a href="https://travis-ci.org/eBay/arc">
   <img src="https://travis-ci.org/eBay/arc.svg?branch=master" alt="travisci build"/>
</a>
<a href="https://codecov.io/gh/eBay/arc/list/master/packages/arc-resolver">
  <img src="https://codecov.io/gh/eBay/arc/branch/master/graph/badge.svg" alt="Codecov" />
</a>
<a href="https://www.npmjs.com/package/arc-resolver">
   <img src="https://img.shields.io/npm/v/arc-resolver/next.svg" alt="npm version"/>
</a>
<a href="http://npm-stat.com/charts.html?package=arc-resolver">
   <img src="https://img.shields.io/npm/dm/arc-resolver.svg" alt="downloads"/>
</a>

## API

### `new Resolver(fs)`

```js
import Resolver from 'arc-resolver';
```

- **`fs`** (_optional_): a filesystem that conforms to the node.js `fs` api. Defaults to the built-in `fs` module

#### Instance methods

- **`clearCache()`**
- **`getMatchesSync(path)`**
- **`getDirMatchesSync(dir, request)`**
- **`resolveSync(path, flags)`**
- **`isAdaptiveSync(path)`**

### <a name="matchset"></a> `new MatchSet(matches)` an [iterable](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Iteration_protocols)

```js
import { MatchSet} from 'arc-resolver';
```

- **`matches`** (_required_): an `Array` of `Object`s with the keys `flags` and `value`:
  - `flags`: an `Array` of strings representing the required flags for the `value`
  - `value`: any value to associate with the `flags`

#### Properties

- **`count`**: the number of possible matches
- **`default`**: the default value (the least specific, the one with no flags)

#### Methods

- **`match(flags)`**: return the matching `value` for a flagset
  - `flags`: an `Object` where each key represents a flag and the value is a boolean indicating whether that flag is active
- **`map(fn)`**: return a new `MatchSet` with the mapped values
  - `fn`: a `Function` that is passed `value`, `flags` and `index`, returns a new `value`

## Defining flags

`arc` adapts files based on a filenaming convension:

```webidl
style.css
style[android].css
```

### How it works

Write your application as though the flagged version of the file did not exist:

```css
@import url('./style.css');
```

When bundling the css (using `arc-webpack` or `arc-lasso`), if the `android` flag is set, `style[android].css` will replace `style.css` in the output bundle.

### Multiple flags

#### Require all flags (AND)

Use the plus (`+`) to specify that all of the listed flags need to match:

```webidl
style[mobile+android].css
```

#### Require any flag (OR)

Use the comma (`,`) to specify that one of the listed flags needs to match:

```webidl
style[android,ios].css
```

#### Combining flag logic

The plus (`+`) has higher precedence than the comma (`,`), similar to how `&&` has higher precedence than `||` in JavaScript.

For example,

```webidl
style[mobile+ios,mobile+android].css
```

Is logically equivalent to:

```js
(mobile && ios) || (mobile && android)
```

##### Subgroups of flags

To increase the precedence of a group, you can wrap it in `[]`:

```webidl
style[mobile+[ios,android]].css
```

This is logically equivalent to the previous example.

### Specificity

> More Flags === Higher Specificity

Given the following files:

```webidl
style.css
style[mobile,tablet,headset,desktop].css
style[mobile+[ios,android]].css
style[mobile+ios+chrome,safari].css
```

The matching logic looks something like:

```coffee
if mobile & ios & chrome
  'style[mobile+ios+chrome,safari].css'

else if mobile & ios
  'style[mobile+[ios,android]].css'

else if mobile & android
  'style[mobile+[ios,android]].css'

else if safari
  'style[mobile+ios+chrome,safari].css'

else if mobile
  'style[mobile,tablet,headset,desktop].css'

else if tablet
  'style[mobile,tablet,headset,desktop].css'

else if headset
  'style[mobile,tablet,headset,desktop].css'

else if desktop
  'style[mobile,tablet,headset,desktop].css'

else
  'style.css'
```

