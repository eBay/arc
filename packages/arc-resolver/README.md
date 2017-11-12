## Setting flags

`arc` adapts files based on a filenaming convension:

```
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

```
style[mobile+android].css
```

#### Require any flag (OR)

Use the comma (`,`) to specify that one of the listed flags needs to match:

```
style[android,ios].css
```

#### Combining flag logic

The plus (`+`) has higher precedence than the comma (`,`), similar to how `&&` has higher precedence than `||` in JavaScript.

For example,

```
style[mobile+ios,mobile+android].css
```

Is logically equivalent to:

```js
(mobile && ios) || (mobile && android)
```

##### Subgroups of flags

To increase the precedence of a group, you can wrap it in `[]`:

```
style[mobile+[ios,android]].css
```

This is logically equivalent to the previous example.

### Specificity

> More Flags === Higher Specificity

Given the following files:

```
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

