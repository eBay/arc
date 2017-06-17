# ARC
```
npm install arc-resolver
```
Since ARC is a monorepo, view `packages/` to see other module options.

This module allows you to easily pull in different files/resources for different environments using a simple file-based naming convention and a set of flags.

**Example:**

Given the following files:
```
style.css
style.mobile.css
style.mobile.ios.css
```
You may request `style.css`, but if you have the `mobile` flag set, you will get `style.mobile.css` and if you also had the `ios` flag set you would get `style.mobile.ios.css`.


## API

### `requireFrom(requestingFile, targetFile, options)`
> `requestingFile` should be the absolute filesystem path to the file that requested the target file.

> `targetFile` is a path to the target file relative to `requestingFile`

