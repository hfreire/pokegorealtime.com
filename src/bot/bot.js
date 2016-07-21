/*
 * Copyright (c) 2016, Hugo Freire <hugo@exec.sh>.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

var Bot = {

  start: function(callback) {
    console.log('Starting bot');

    require('./pokemon/explorer');

    if (callback) {
      callback()
    }
  },

  stop: function(callback) {
    console.log('Stopping bot');
  },

  report: function (error, callback) {
    console.error(error.stack ? error.stack : error.message)

    if (callback) {
      callback()
    }
  }
}

module.exports = Bot;