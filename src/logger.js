const winston = require('winston');

const loggers = {};

module.exports = s => {
  const logName = s || '$ROOT';
  if (!loggers[logName]) {
    winston.loggers.add(logName, { console: { level: 'silly', colorize: true, label: logName } });
    loggers[logName] = winston.loggers.get(logName);
  }
  return loggers[logName];
};
