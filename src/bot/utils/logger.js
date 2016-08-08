/*
 * Copyright (c) 2016, Hugo Freire <hugo@exec.sh>.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

const moment = require('moment')
const winston = require('winston')

const timeFormat = function () {
  return moment().format('YYYY-MM-DDTHH:mm:ss,SSSZ')
}

const transports = []

transports.push(new winston.transports.Console({
  level: 'info',
  json: false,
  colorize: true,
  timestamp: timeFormat,
  handleExceptions: true,
  humanReadableUnhandledException: true
}))

const logger = new winston.Logger({
  transports: transports,
  exitOnError: false
})

module.exports = logger

module.exports.stream = {
  'write': function (message) {
    logger.info(message)
  }
}

