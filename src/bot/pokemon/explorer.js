/*
 * Copyright (c) 2016, Hugo Freire <hugo@exec.sh>.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */


var Pokeio = require('./api/poke.io');
var _ = require('lodash');

var redis = require("redis"),
  client = redis.createClient(__dirname + '/../../../var/run/redis.sock', {
    max_attempts: 1
  });

var Walker = require('../pokemon/walker');
var POKEDEX = require('../pokemon/pokedex').POKEDEX;

//Set environment variables or replace placeholder text
var location = {
  type: 'name',
  name: process.env.PGO_LOCATION || 'Jakobsbergsgatan 16, 111 44, Stockholm, Sweden'
};

var username = process.env.PGO_USERNAME || 'hfreire@exec.sh';
var password = process.env.PGO_PASSWORD || 'e3Q2tEp30VtkyzOSg8TS6c36aE1I5Esj';
var provider = process.env.PGO_PROVIDER || 'google';

//username = process.env.PGO_USERNAME || 'marcocuci@gmail.com';
//password = process.env.PGO_PASSWORD || 'a5dlnlkvcupbbahuk8tjhfuq';
//provider = process.env.PGO_PROVIDER || 'google';

username = process.env.PGO_USERNAME || 'gberggren1978@gmail.com';
password = process.env.PGO_PASSWORD || '9oJwCBX9pOh0uCoyaxLaTEnaRfr64wlr';
provider = process.env.PGO_PROVIDER || 'google';

function lookAround (callback) {
  var startTime = new Date();

  Pokeio.Heartbeat(function (error, heartbeat) {
    var endTime = new Date();

    if (error) {
      throw error;
    }

    function _processCell (cell) {
      _.forEach(cell.Fort, _processFort);

      _.forEach(cell.MapPokemon, _processPokemon);
    }

    function _processFort (fort) {
      if (fort.FortType === 1) {
        var pokestop = fort;
        client.set("pokestop:" + pokestop.FortId.toString(), JSON.stringify(pokestop),
          function (error) {
            if (error) {
              console.error(error);
            }
          });

      } else {
        var gym = fort;
        client.set("gym:" + gym.FortId.toString(), JSON.stringify(gym),
          function (error) {
            if (error) {
              console.error(error);
            }
          });
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
    }

    _.forEach(heartbeat.cells, _processCell);

    callback();
  });
}

function searchForPointsOfInterest (latitude, longitude) {

  var location = Walker.walk(latitude, longitude);

  Pokeio.playerInfo.latitude = location.latitude;
  Pokeio.playerInfo.longitude = location.longitude;

  lookAround(function () {
    setTimeout(searchForPointsOfInterest, 20000);
  });
}

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