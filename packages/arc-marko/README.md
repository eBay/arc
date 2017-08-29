## Adaptive Resources & Components (ARC) plugin for Marko

Using `ARC` within your Marko project allows you to split any component as necessary - usually if/when the desktop and mobile templates start to diverge in design! 

Examples include: 
- a multi-column layout on desktop vs a single-column layout on mobile
- a fully visible navigation menu on desktop vs navigation hidden away behind a hamburger button due to available space on mobile

### Steps to set up ARC in your Marko project:

1.  In package.json file, add below dependencies

```
"arc-lasso": "^1.0.0",
"arc-marko": "^1.0.1",
"arc-resolver": "^1.0.1",
"lasso": "3.0.0-beta.0"
"marko": "^4",
```

2. For lasso plugins, add 
```
"arc-lasso"
```

3. In src/config.js, add 
```
require('arc-resolver/proxy-hook');
```

4. In request handler index.js, add
```
    // res.locals is made available as out.global by marko/express.js
    // isMobile is a boolean value indicate mobile device or not
    res.locals.flags = {
        mobile: isMobile,
        desktop: !isMobile
    };

    // desktopTemplate mobileTemplate are top level page template
    if (isMobile) {
        res.marko(mobileTemplate, viewModel);
    } else {
        res.marko(desktopTemplate, viewModel);
    }

```

5. In 'projectroot'/index.js, add
```
require('marko/express');
```

6. Build an arc module struture 
```
├── common.js 
├── desktop
│   ├── component.js
│   ├── index.marko
│   └── styles
│       └── style.less
├── index.arc
└── mobile
    ├── component.js
    ├── index.marko
    └── styles
        └── style.less
```

7. In index.arc, write
```
{
   "proxy":"arc-marko",
   "default":"desktop"
}
```


Start the server and try it!
