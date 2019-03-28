require('arc-server/install');

let arc = require('arc-server');
let express = require('express');
let template = require('./template');
let app = express();

app.use((req, res, next) => {
  const flags = req.query.hasOwnProperty('adapt') ? ['adapt'] : [];
  arc.setFlagsForContext(flags, next);
});

app.use((req, res, next) => {
  // async boundary
  setTimeout(next, 50);
});

app.get('/', (req, res) => {
  res.send(template.render());
});

app.listen(8080);
