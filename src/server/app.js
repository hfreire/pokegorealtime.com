/*
 * Copyright (c) 2016, Hugo Freire <hugo@exec.sh>.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

var server = require('./server')

// shutdown gracefully
function _shutdown () {
  server.stop(function () {
    process.exit(0)
  })
}

function _error (error) {
  server.report(error)
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
  server.stop(function () {
    process.kill(process.pid, 'SIGUSR2')
  })
})

process.on('exit', function () {
})

process.on('uncaughtException', _error)
process.on('unhandledRejection', _error)

server.start()