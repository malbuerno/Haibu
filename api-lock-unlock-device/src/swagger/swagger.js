const nconf = require('nconf');
const Router = require('koa-oai-router');
const middleware = require('koa-oai-router-middleware');

module.exports = app => {
  const { PORT, HOST, BASE_PATH } = app.context.config;
  const hostname = [HOST, PORT].join(':');
  const swagger = new Router({
    BASE_PATH,
    apiDoc: __dirname,
    apiExplorerVisible: nconf.get('NODE_ENV') == 'production',
    options: {
      middleware: './src/controllers',
      BASE_PATH
    },
    apiCooker(api) {
      api.host = hostname;
      if (nconf.get('NODE_ENV') !== 'production') {
        api.basePath = `/${BASE_PATH}`;
      }
      return api;
    }
  });
  swagger.mount(middleware);

  app.use(swagger.routes());
};
