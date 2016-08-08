/*
 * Copyright (c) 2016, Hugo Freire <hugo@exec.sh>.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

const Promise = require('bluebird')
const PokemonClientFactory = require('./pokemon').ClientFactory
const Logger = require('./utils/logger')
const Database = require('./database')

class Bot {
  constructor (accounts = []) {
    if (accounts.length === 0) {
      throw new Error('no accounts given')
    }

    this._accounts = accounts
  }

  start () {
    Logger.info('Starting bot')

    function createPokemonClient (account) {
      PokemonClientFactory.create(account)
        .then(client => {
          client.on('pokemons', Database.save.bind(Database))
          client.once('error', error => {
            Logger.error(error.stack ? error.stack : error)

            client.removeListener('pokemons', Database.save)

            PokemonClientFactory.destroy(client)

            setTimeout(() => {
              createPokemonClient(account)
            }, 30 * 1000)
          })

          account._client = client
        })
    }

    return Database.start()
      .then(() => {
        return Promise.resolve(this._accounts)
          .mapSeries(createPokemonClient.bind(this)) // TODO: find a way of not doing this
      })
  }

  stop () {
    Logger.info('Stopping bot')

    return Database.stop()
      .then(() => {
        return Promise.resolve(this._accounts)
          .mapSeries(account => {
            PokemonClientFactory.destroy(account._client)
          })
      })
  }
}

module.exports = (accounts) => {
  return new Bot(accounts)
}
