## Adaptive Resources & Components (ARC) plugin for Marko

Using `ARC` within your Marko project allows you to split any component as necessary - usually if/when the desktop and mobile templates start to diverge in design! 

Examples include: 
- a multi-column layout on desktop vs a single-column layout on mobile
- a fully visible navigation menu on desktop vs navigation hidden away behind a hamburger button due to available space on mobile

### Steps to set up ARC in your Marko project:

1.  In your `package.json` file, add the dependencies below:

```
"arc-lasso": "^1.0.0",
"arc-marko": "^1.0.1",
"arc-resolver": "^1.0.1",
"lasso": "3.0.0-beta.0",
"marko": "^4"
```

2. For lasso plugins, add 
```
"arc-lasso"
```

3. In the top level page templates for different devices, add
```
<lasso-page package-path="./browser.json" flags=['desktop']/>
```
or
```
<lasso-page package-path="./browser.json" flags=['mobile']/>
```


4. In `src/config.js`, add 
```
require('arc-resolver/proxy-hook');
```

5. In your request handler `index.js`, add
```
    // res.locals is made available as out.global by marko/express.js
    // isMobile is a boolean value indicating if the client is using a mobile device or not
    res.locals.flags = {
        mobile: isMobile,
        desktop: !isMobile
    };

    // desktopTemplate, mobileTemplate are the top level page templates
    if (isMobile) {
        res.marko(mobileTemplate, viewModel);
    } else {
        res.marko(desktopTemplate, viewModel);
    }

```

6. In `@projectroot@/index.js`, add
```
require('marko/express');
```

7. Build an ARC module struture where necessary 
```
├── common.js
├── index.arc
├── desktop
│   ├── component.js
│   ├── index.marko
│   └── styles
│       └── style.less
└── mobile
    ├── component.js
    ├── index.marko
    └── styles
        └── style.less
```
- `common.js` contains any Javascript code shared across device types and can be extended in `component.js`
- `index.arc` contains the proxy and fallback as you'll see in #8 below
- In the example above, each device has its own javascript (`component.js`), markup (`index.marko`), and styles (`style.less`)

8. In `index.arc`, write
```
{
   "proxy": "arc-marko",
   "default": "desktop"
}
```
- `proxy` - this is how your app will know how to do routing for adaptive components
- `default` - the fallback flag to use when `arc-marko` gets no flags

Start the server and try it!
