const repositories = require('./repositories');
const getFTTHData = require('./getFTTHData');

module.exports = app => {
  app.context.api = {};
  repositories(app);
  getFTTHData(app);
};
