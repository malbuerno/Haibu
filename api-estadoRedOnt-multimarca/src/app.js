const Koa = require("koa");
const bodyParser = require("koa-bodyparser");
const cors = require("@koa/cors");
const requestId = require("koa-requestid");

const app = new Koa();

// Add middleware to Koa
app
  .use(cors())
  .use(
    requestId({
      expose: "X-Request-Id",
      header: "X-Req-Id",
      query: "request-id",
    })
  )
  .use(bodyParser({ jsonLimit: "25mb" }));

let paths = [];
if (process.env.NODE_ENV !== "production") {
  paths = [/\/api-explorer/, /\/swagger/, /\/api/, /\/dev/, /\/qa/];
}

// Init
require("./boot")(app);
require("./middleware")(app);
require("./swagger")(app);

// Start app
const { PORT } = app.context.config;

app.context.logger.info(
  `When it's ${new Date().toLocaleString()} we are getting ready`
);
app.context.logger.info(`Starting in ${process.env.NODE_ENV} mode`);
app.context.logger.info(`Listening on ${PORT}`);

module.exports = app.listen(PORT);
