const { createLogger, format, transports } = require('winston');
const nconf = require('nconf');
module.exports = app => {
    const { config } = app.context;
    const { LOGGER, SERVICE_NAME } = config;
    const { combine, timestamp, printf } = format;
    const customFormat = printf((info = {}) => {
        const log = Object.assign(
            {
                environment: process.env.NODE_ENV,
                appName: process.env.npm_package_name,
                appVersionBack: process.env.npm_package_version,
                hostname: process.env.HOSTNAME
            },
            info
        );
        return JSON.stringify(log);
    });
    const transformer = function transformer(logData) {
        const transformed = {};
        transformed['@timestamp'] = logData.meta.timestamp ? logData.meta.timestamp : new Date().toLocaleString();
        transformed.environment = process.env.NODE_ENV;
        transformed.appName = process.env.npm_package_name;
        transformed.appVersionBack = process.env.npm_package_version;
        transformed.message = logData.message;
        transformed.severity = logData.level;
        transformed.fields = logData.meta;
        return transformed;
    };
    const esTransportOpts = {
        level: LOGGER.LEVEL,
        clientOpts: {
            name: SERVICE_NAME,
            host: `${LOGGER.HOST}:${LOGGER.PORT}`
        },
        transformer: transformer,
        indexPrefix: 'clientes-logs',
        messageType: 'logs'
    };
    const maskFormat = format(info => {
        if (info.body && info.body.password) {
            info.body.password = 'xxxxxxxxxxxxx';
        }
        return info;
    });
    const transportsMethods = [new transports.Console()];
    // transportsMethods.push(new Elasticsearch(esTransportOpts));

    app.context.logger = createLogger({
        level: LOGGER.LEVEL,
        transports: transportsMethods,
        format: combine(
            maskFormat(),
            format.timestamp({ format: 'YYYY-MM-DD"T"HH:mm:ss"Z"' }),
            format.splat(),
            format.json(),
            customFormat
        )
    });
};
