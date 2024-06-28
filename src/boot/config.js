require('../settings');

const nconf = require('nconf');

nconf.env();

module.exports = app => {
  const envvars = nconf.get('APP');
  const config =
		typeof envvars === 'string' ? JSON.parse(nconf.get('APP')) : envvars;
  app.context.config = config;
};
