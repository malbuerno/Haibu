const repositories = require('./repositories');
const consultaEstadoONT = require('./consultaEstadoONT');

module.exports = app => {
  app.context.api = {};
  repositories(app);
  consultaEstadoONT(app);
};
