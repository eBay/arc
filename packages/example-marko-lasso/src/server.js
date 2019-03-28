require('arc-server/install');
require('marko/node-require').install({
  compilerOptions: {
    requireTemplates: true
  }  
});

let arc = require('arc-server');
let express = require('express');
let lasso = require('lasso');
let markoMiddleware = require('marko/express');
let lassoMiddleware = require('lasso/middleware');
let useragent = require('express-useragent');
let template = require('./index.marko');
let app = express();

lasso.configure({
    plugins: [
        'arc-lasso',
        'lasso-marko'
    ]
});

app.use(markoMiddleware());
app.use(lassoMiddleware.serveStatic());
app.use(useragent.express());

app.use((req, res, next) => {
    let ua = req.useragent;
    let flags = {
        mobile: ua.isMobile,
        desktop: ua.isDesktop,
        microsoft: /microsoft|windows/i.test(ua.platform),
        google: /google|android/i.test(ua.platform),
        apple: /apple|ip(hone|ad|od)|mac/i.test(ua.platform)
    }
    res.locals.flags = Object.keys(flags).filter(flag => flags[flag]);
    arc.setFlagsForContext(flags, next);
});

app.get('/', (req, res) => {
    console.log(res.locals.flags)
  res.marko(template);
});

app.listen(8080);
