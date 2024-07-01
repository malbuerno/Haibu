module.exports = (app) => {
  app.use(async ({ logger, request, response, params, state }, next) => {
    const start = Date.now();
    await next();
    const ms = Date.now() - start;
    response.set("X-Response-Time", `${ms}ms`);

    logger.info(`X-Response-Time ${ms}ms`, {
      method: request.method,
      url: request.url,
      stateId: state.id,
      status: response.status,
      body: request.body,
      params: params,
      timeMs: ms,
      header: request.header,
    });
  });
};
