// Reference: https://css-tricks.com/how-to-implement-logging-in-a-node-js-application-with-pino-logger/
//Author: Divyashree Bangalore Subbaraya (B00875916)
const pino = require('pino')

const levels = {
    http: 10,
    debug: 20,
    info: 30,
    warn: 40,
    error: 50,
    fatal: 60,
};

module.exports = pino({
    prettyPrint: true,
    customLevels: levels, // our defined levels
    useOnlyCustomLevels: true,
    level: 'http',
})