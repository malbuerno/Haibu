const Prometheus = require("prom-client");
const schedule = require("node-schedule");
const os = require("os");

module.exports = (app) => {
  const defaultLabels = {
    service: process.env.name,
    version: process.env.npm_package_version,
    container: process.env.HOSTNAME,
  };
  Prometheus.register.setDefaultLabels(defaultLabels);

  app.context.collectDefaultMetrics = Prometheus.collectDefaultMetrics;
  app.context.collectDefaultMetrics({ timeout: 10000 });

  app.context.memTotal = new Prometheus.Gauge({
    name: "bff_motoarquote_memory_MemTotal",
    help: "Total memory",
  });

  app.context.memFree = new Prometheus.Gauge({
    name: "bff_motoarquote_memory_MemFree",
    help: "Free memory",
  });

  app.context.httpRequestDuration = new Prometheus.Histogram({
    name: "http_request_duration_microseconds",
    help: "Duration of HTTP requests",
    labelNames: ["method", "path", "status"],
    buckets: [
      100, 200, 300, 400, 500, 600, 700, 800, 900, 1000, 1250, 1500, 1750, 2000, 2500, 3000, 3500, 4000, 4500, 5000, 6000, 7000, 8000, 9000, 10000, 11000,
      12000, 13000, 14000, 15000,
    ],
  });

  schedule.scheduleJob("*/10 * * * * *", () => {
    app.context.memTotal.set(os.totalmem());
    app.context.memFree.set(os.freemem());
  });

  app.context.Prometheus = Prometheus;
};
