/*
 * Copyright (c) 2016, Hugo Freire <hugo@exec.sh>.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

const _ = require('lodash')
const redis = require('redis')
const Promise = require('bluebird')
const path = require('path')
const logger = require('./utils/logger')

Promise.promisifyAll(redis.RedisClient.prototype)
Promise.promisifyAll(redis.Multi.prototype)

const INTERVAL = 10 * 1000

const REDIS = process.env.REDIS || path.join(__dirname, '/../../var/run/redis.sock')

class Database {

  start () {
    return new Promise(resolve => {
      if (this._client) {
        return
      }

      this._client = redis.createClient(REDIS, {
        'retry_strategy': function () {
          return 10000
        }
      })

      this._client.on('error', error => {
        logger.error(error.stack ? error.stack : error)
      })
      this._client.on('connect', () => {
        if (this._interval) {
          return
        }

        this._interval = setInterval(() => {
          // noinspection JSUnresolvedFunction
          this._client.zrangebyscoreAsync('pokemons:expiration', 0, new Date().getTime())
            .then(pokemons => {
              if (pokemons && pokemons.length > 0) {
                logger.info('Removing ' + pokemons.length + ' expired pokemons')
              }

              return pokemons
            })
            .mapSeries(pokemon => {
              // noinspection JSUnresolvedFunction
              return this._client.multi()
                .zrem('pokemons:expiration', pokemon)
                .zrem('pokemons:location', pokemon)
                .execAsync()
            })
            .catch(error => {
              logger.error(error.stack ? error.stack : error)
            })
        }, INTERVAL)

        resolve() // TODO find a way of doing multiple calls here
      })
      this._client.on('end', () => {
        if (!this._interval) {
          return
        }

        clearInterval(this._interval)
      })
    })
  }

  stop () {
    return new Promise(resolve => {
      if (!this._client) {
        return resolve()
      }

      this._client.once('end', resolve)

      this._client.quit()
    })
      .timeout(400)
      .catch(() => {
        this._client.end(true)
      })
  }

  save (pokemons) {
    if (!this._client) {
      return
    }

    _.forEach(pokemons, (pokemon) => {
      // noinspection JSUnresolvedFunction
      this._client.getAsync('pokemon:' + pokemon.encounter_id.toString())
        .then(result => {
          if (!result) {
            // noinspection JSUnresolvedFunction
            return this._client.multi()
              .geoadd('pokemons:location', pokemon.location.latitude, pokemon.location.longitude, JSON.stringify(pokemon))
              .zadd('pokemons:expiration', Number(pokemon.expire_at.toString()), JSON.stringify(pokemon))
              .execAsync()
          }
        })
        .catch(error => {
          logger.error(error.stack ? error.stack : error)
        })
    })
  }
}

module.exports = new Database()
