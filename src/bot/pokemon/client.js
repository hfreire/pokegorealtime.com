/*
 * Copyright (c) 2016, Hugo Freire <hugo@exec.sh>.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

const ROUTE_STEP_SIZE = 0.0035
const ROUTE_STEP_LIMIT = 64
const PERIOD_MIN = 5
const PERIOD_MAX = 10
const POKEDEX = require('./pokedex').POKEDEX

const pogobuf = require('pogobuf')

const _ = require('lodash')
const Promise = require('bluebird')
const Logger = require('../utils/logger')
const EventEmitter = require('events').EventEmitter
const RouteGenerator = require('./route-generator')

class Client extends EventEmitter {
  constructor (username, password, provider, location, proxy) {
    if (!username || !password || !provider || !location || !location.latitude || !location.longitude) {
      throw new Error('invalid parameters')
    }

    super()

    this._username = username
    this._password = password
    this._provider = provider
    this._location = location
    this._proxy = proxy
    this._login = new pogobuf.GoogleLogin()
    this._client = new pogobuf.Client()
    this._timeout = undefined
    this._route = undefined
  }

  start () {
    return this._authenticate(this._username, this._password, this._provider, this._location, this._proxy)
      .then(() => {
        this._route = RouteGenerator.generate(this._location.latitude, this._location.longitude, ROUTE_STEP_SIZE, ROUTE_STEP_LIMIT)

        this._timeout = setTimeout(this._walk.bind(this), this._generatePeriod())
      })
      .catch(error => {
        this.emit('error', error)
      })
  }

  stop () {
    if (this._timeout) {
      clearTimeout(this._timeout)
    }
  }

  getUsername () {
    return this._username
  }

  _authenticate (username, password, provider, location, proxy) {
    return this._login.login(username, password)
      .then(token => {
        this._client.setAuthInfo(provider, token)
        this._client.setPosition(location.latitude, location.longitude)

        if (proxy) {
          this._client.setProxy(proxy)
        }

        this._client.setMapObjectsThrottlingEnabled(true)

        return this._client.init()
      })
  }

  _generatePeriod () {
    return (Math.floor(Math.random() * (PERIOD_MAX - PERIOD_MIN + 1) + PERIOD_MIN)) * 1000
  }

  _walk () {
    this._timeout = undefined

    let coordinates = RouteGenerator.getNextCoordinates(this._route)

    if (!coordinates) {
      // we reached the end of the route...lets go back :)
      RouteGenerator.reverse(this._route)

      coordinates = RouteGenerator.getNextCoordinates(this._route)
    }

    this._client.setPosition(coordinates.latitude, coordinates.longitude)

    return this._client.playerUpdate()
      .then(() => {
        // noinspection JSUnresolvedVariable
        var cellIDs = pogobuf.Utils.getCellIDs(coordinates.latitude, coordinates.longitude)

        return this._look(cellIDs)
      })
      .then(result => {
        Logger.info(this._username + ' ' + JSON.stringify(coordinates) + ' found ' + result.pokemons.length + ' pokemons')

        this.emit('pokemons', result.pokemons)

        this._timeout = setTimeout(this._walk.bind(this), this._generatePeriod())
      })
      .catch(error => {
        if (error.message && error.message.indexOf('102') > 0) {
          coordinates = RouteGenerator.getPreviousCoordinates(this._route)

          return this._authenticate(this._username, this._password, this._provider, coordinates, this._proxy)
            .then(() => {
              this._timeout = setTimeout(this._walk.bind(this), this._generatePeriod())
            })
            .catch(error => {
              this.emit('error', error)
            })
        } else {
          this.emit('error', error)
        }
      })
  }

  _look (cellIDs) {
    let result = {
      pokemons: []
    }

    return Promise.resolve(this._client.getMapObjects(cellIDs, Array(cellIDs.length).fill(0)))
      .then(mapObjects => {
        return mapObjects.map_cells
      })
      .each(cell => {
        /*
         cell.catchable_pokemons.push({
         pokemon_id: 1,
         encounter_id: 1231312312313123,
         expiration_timestamp_ms: new Date().getTime() + 5*60*1000,
         latitude: 59.327152,
         longitude: 18.075033
         })
         */

        return Promise.resolve(cell.catchable_pokemons)
          .each(pokemon => {
            var _pokemon = _.find(POKEDEX, { id: pokemon.pokemon_id.toString() })

            result.pokemons.push({
              pokedex_id: pokemon.pokemon_id,
              encounter_id: pokemon.encounter_id.toString(),
              expire_at: pokemon.expiration_timestamp_ms.toString(),
              location: {
                latitude: pokemon.latitude,
                longitude: pokemon.longitude
              },
              name: _pokemon.name
            })
          })
      })
      .then(() => {
        return result
      })
  }
}

module.exports = Client
