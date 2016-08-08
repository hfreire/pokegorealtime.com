/*
 * Copyright (c) 2016, Hugo Freire <hugo@exec.sh>.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

const Promise = require('bluebird')
const path = require('path')
const redis = require('redis')

Promise.promisifyAll(redis.RedisClient.prototype)
Promise.promisifyAll(redis.Multi.prototype)

const REDIS = process.env.REDIS || path.join(__dirname, '/../../../var/run/redis.sock')

const _redis = redis.createClient(REDIS, {
  'retry_strategy': function () {
    return 10000
  }
})

exports.getPokemons = function (req, res) {
  if (!req.query || !req.query.latitude || !req.query.longitude) {
    return res.status(400).send()
  }

  const location = {
    latitude: parseFloat(req.query.latitude),
    longitude: parseFloat(req.query.longitude)
  }
  const radius = (req.query.radius && req.query.radius > 0 && req.query.radius < 40) ? parseInt(req.query.radius) : 20
  const metric = 'km'

  // noinspection JSUnresolvedFunction
  _redis.georadiusAsync('pokemons:location', location.latitude, location.longitude, radius, metric)
    .map(pokemon => {
      return JSON.parse(pokemon)
    })
    .then(pokemons => {
      res.send(JSON.stringify(pokemons))
    })
    .catch(error => {
      throw error
    })
}
