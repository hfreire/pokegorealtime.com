/*
 * Copyright (c) 2016, Hugo Freire <hugo@exec.sh>.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

const POKEMON_GO_ACCOUNTS = process.env.POKEMON_GO_ACCOUNTS ? JSON.parse(process.env.POKEMON_GO_ACCOUNTS) : []

const Bot = require('./bot')(POKEMON_GO_ACCOUNTS)
const Logger = require('./utils/logger')

// shutdown gracefully
function _shutdown () {
  return Bot.stop()
    .timeout(1000)
    .finally(() => {
      process.exit(0)
    })
}

process.on('SIGINT', _shutdown)
process.on('SIGTERM', _shutdown)

// force immediate shutdown, i.e. systemd watchdog?
process.on('SIGABRT', function () {
  process.exit(1)
})

process.on('SIGHUP', function () { // reload
  _shutdown()
})

// stop and then shutdown, i.e. forever daemon
process.once('SIGUSR2', function () {
  Bot.stop(function () {
    process.kill(process.pid, 'SIGUSR2')
  })
})

process.on('exit', function () {
})

process.on('uncaughtException', error => {
  Logger.error(error.stack ? error.stack : error, _shutdown)
})
process.on('unhandledRejection', error => {
  Logger.error(error.stack ? error.stack : error, _shutdown)
})

Bot.start()
