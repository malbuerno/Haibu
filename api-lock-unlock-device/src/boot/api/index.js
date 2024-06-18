const repositories = require('./repositories');
const manageDevice = require('./manageDevice');

module.exports = app => {
  app.context.api = {};
  repositories(app);
  manageDevice(app);
};
