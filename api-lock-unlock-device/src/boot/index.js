const koalogger = require('koa-logger');
const config = require('./config');
const logger = require('./logger');
const api = require('./api');
const nconf = require('nconf');
const common = require('./common');
const prometheus = require('./prometheus');

module.exports = app => {
  if (nconf.get('NODE_ENV') == 'development') {
    app.use(koalogger());
  }

  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

  config(app);
  common(app);
  logger(app);
  prometheus(app);
  api(app);
};
