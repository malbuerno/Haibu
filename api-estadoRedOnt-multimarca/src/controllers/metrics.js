module.exports = {
  getMetrics: ({ Prometheus, response }) => {
    response.status = 200;
    response.type = Prometheus.register.contentType;
    response.body = Prometheus.register.metrics();
  }
};
