/*
 * Copyright (c) 2016, Hugo Freire <hugo@exec.sh>.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */


var Pokeio = require('./api/poke.io');
var _ = require('lodash');

var REDIS = process.env.REDIS || __dirname + '/../../../var/run/redis.sock';

var redis = require("redis"),
  client = redis.createClient(REDIS, {
    retry_strategy: function () {
      return 10000;
    }
  });

var Walker = require('../pokemon/walker');
var POKEDEX = require('../pokemon/pokedex').POKEDEX;

//Set environment variables or replace placeholder text
var location = {
  type: 'name',
  name: process.env.PGO_LOCATION || 'Jakobsbergsgatan 16, 111 44, Stockholm, Sweden'
};

var username = process.env.PGO_USERNAME
var password = process.env.PGO_PASSWORD
var provider = process.env.PGO_PROVIDER

function lookAround (callback) {

  Pokeio.Heartbeat(function (error, heartbeat) {
    if (error) {
      return callback(error);
    }

    var summary = {
      cells: 0,
      pokestops: 0,
      gyms: 0,
      pokemons: 0
    };

    function _processCell (cell) {
      _.forEach(cell.Fort, _processFort);

      _.forEach(cell.MapPokemon, _processPokemon);

      summary.cells++;
    }

    function _processFort (fort) {
      if (fort.FortType === 1) {
        var pokestop = fort;
        client.set("pokestop:" + pokestop.FortId.toString(), JSON.stringify(pokestop),
          function (error) {
            if (error) {
              console.error(error.stack);
            }
          });

        summary.pokestops++;

      } else {
        var gym = fort;
        client.set("gym:" + gym.FortId.toString(), JSON.stringify(gym),
          function (error) {
            if (error) {
              console.error(error);
            }
          });

        summary.gyms++;
      }
    }

    function _processPokemon (pokemon) {
      client.get("pokemon:" + pokemon.EncounterId.toString(), function (error, result) {
        if (error) {
          console.error(error);
        }

        if (!result) {
          function getPokemonId (pokemon) {
            if (pokemon.pokemon && pokemon.pokemon.PokemonId) {
              return pokemon.pokemon.PokemonId; // wild pokemon
            } else if (pokemon.PokedexTypeId) {
              return pokemon.PokedexTypeId; // map pokemon
            } else if (pokemon.PokedexNumber) {
              return pokemon.PokedexNumber; // nearby pokemon
            }
          }

          var _pokemon = _.find(POKEDEX, { id: getPokemonId(pokemon).toString() });
          pokemon = _.merge(pokemon, _pokemon);
          pokemon.EncounterId = pokemon.EncounterId.toString();
          pokemon.ExpirationTimeMs = pokemon.ExpirationTimeMs.toString();

          client.set("pokemon:" + pokemon.EncounterId.toString(), JSON.stringify(pokemon),
            function (error) {
              if (error) {
                console.error(error);

                return;
              }

              var ttl = _.round(Number(pokemon.ExpirationTimeMs.toString()) / 1000 - (new Date().getTime() / 1000));
              client.expire("pokemon:" + pokemon.EncounterId.toString(), ttl);
            });
        }
      });

      summary.pokemons++;
    }

    _.forEach(heartbeat.cells, _processCell);

    callback(null, summary);
  });
}

function searchForPointsOfInterest (latitude, longitude) {

  var destination = Walker.walk(latitude, longitude);

  Pokeio.playerInfo.latitude = destination.latitude;
  Pokeio.playerInfo.longitude = destination.longitude;

  lookAround(function (error, summary) {
    if (error) {
      console.error(error);

      // error? start again
      start(username, password, location, provider);

    } else {

      console.log(new Date() + ' ' + JSON.stringify(destination) + ' ' + JSON.stringify(summary));

      setTimeout(searchForPointsOfInterest, (Math.floor(Math.random()*(10-5+1)+5))*1000);
    }
  });
}

function start (username, password, location, provider) {

  Pokeio.init(username, password, location, provider, function (error) {
    if (error) {
      throw error;
    }

    console.log('Current location: ' + Pokeio.playerInfo.locationName + ' (' + Pokeio.playerInfo.latitude + ', ' + Pokeio.playerInfo.longitude + ', ' + Pokeio.playerInfo.altitude + ')');

    Pokeio.GetProfile(function (error, profile) {
      if (error) {
        throw error;
      }

      searchForPointsOfInterest(Pokeio.playerInfo.latitude, Pokeio.playerInfo.longitude);
    });
  });
}

start(username, password, location, provider);

