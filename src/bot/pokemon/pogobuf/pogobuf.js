/*
 * Copyright (c) 2016, Hugo Freire <hugo@exec.sh>.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

'use strict';

/**
 * Pogobuf Pokemón Go Client Library.
 * @module pogobuf
 * @namespace
 * @see {@link https://github.com/cyraxx/pogobuf|GitHub repository}
 */
module.exports = {
  Client: require('./pogobuf.client.js'),
  PTCLogin: require('./pogobuf.ptclogin.js'),
  GoogleLogin: require('./pogobuf.googlelogin.js'),
  Utils: require('./pogobuf.utils.js')
};