const path = require('path');
const nconf = require('nconf');
const yaml = require('js-yaml');

const ENV = process.env.NODE_ENV || 'development';

// Argument variables are second priority
nconf.argv();

// Environment variables are top priority
nconf.env();

// default is set to development
nconf.defaults({
  NODE_ENV: ENV
});

// File config based on environment have the third priority
nconf.file(ENV, {
  file: path.join(__dirname, `./${ENV}.yml`),
  format: {
    parse: yaml.safeLoad,
    stringify: yaml.safeDump
  },
  logicalSeparator: '__'
});

// File config have the last priority
nconf.file('base', {
  file: path.join(__dirname, './base.yml'),
  format: {
    parse: yaml.safeLoad,
    stringify: yaml.safeDump
  },
  logicalSeparator: '__'
});
