require('arc-server/install');

let arc = require('arc-server');
let express = require('express');
let template = require('./template');
let app = express();

arc.useCustomFlagContext(() => {
  let request = require('request-local').data.request;
  return request && request.flags;
});
app.use(require('request-local/middleware').create());

app.use((req, res, next) => {
  if (req.query.hasOwnProperty('adapt')) {
    req.flags = ['adapt'];
  }

  // async boundary
  setTimeout(next, 50);
});

app.get('/', (req, res) => {
  res.send(template.render());
});

app.listen(8080);
