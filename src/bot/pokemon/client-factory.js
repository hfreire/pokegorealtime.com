/*
 * Copyright (c) 2016, Hugo Freire <hugo@exec.sh>.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

const Client = require('./client')
const logger = require('../utils/logger')

class ClientFactory {
  create (account) {
    logger.info('Creating pokemon client with account ' + JSON.stringify(account))

    let client = new Client(account.username, account.password, account.provider, account.location, account.proxy)

    return client.start()
      .then(() => {
        return client
      })
  }

  destroy (client) {
    logger.info('Destroying pokemon client with username ' + JSON.stringify(client.getUsername()))

    return client.stop()
  }
}

module.exports = new ClientFactory()
