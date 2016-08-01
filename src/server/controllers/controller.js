/*
 * Copyright (c) 2016, Hugo Freire <hugo@exec.sh>.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

'use strict';

var _ = require('lodash');

var REDIS = process.env.REDIS || __dirname + '/../../../var/run/redis.sock';

var redis = require("redis"),
  client = redis.createClient(REDIS, {
    retry_strategy: function () {
      return 10000;
    }
  });

exports.getGymMarkers = function (callback) {

  function gymToMarker (gym) {
    return {
      id: gym.FortId,
      name: "Truck 1",
      position: { "lat": gym[ 'Latitude' ], "long": gym[ 'Longitude' ] }
    };
  }

  var result = [];
  var cursor = '0';
  function scan () {
    client.scan(cursor, 'MATCH', 'gym:*', 'COUNT', '100', function (error, reply) {
      if (error) {
        throw error;
      }

      cursor = reply[ 0 ];
      result = result.concat(reply[ 1 ]);

      if (cursor === '0') {
        client.mget(result, function (error, reply) {
          if (callback) {
            callback(_.map(reply, function (gym) {
              return gymToMarker(JSON.parse(gym));
            }));
          }

        });
      } else {
        return scan();
      }
    });
  }

  scan();
};

exports.getPokemonMarkers = function (callback) {

  function pokemonToMarker (pokemon) {
    if (!pokemon || !pokemon.EncounterId) {
      return;
    }

    return {
      id: pokemon.EncounterId,
      name: pokemon.name,
      pokedex_id: pokemon.PokedexTypeId,
      position: {
        lat: pokemon.Latitude,
        long: pokemon.Longitude
      },
      expire_at: pokemon.ExpirationTimeMs
    };
  }

  var result = [];
  var cursor = '0';
  function scan () {
    client.scan(cursor, 'MATCH', 'pokemon:*', 'COUNT', '100', function (error, reply) {
      if (error) {
        throw error;
      }

      cursor = reply[ 0 ];
      result = result.concat(reply[ 1 ]);

      if (cursor === '0') {
        client.mget(result, function (error, reply) {
          if (callback) {
            callback(_.map(reply, function (pokemon) {
              var marker = pokemonToMarker(JSON.parse(pokemon));
              if (marker) {
                return marker;
              }
            }));
          }

        });
      } else {
        return scan();
      }
    });
  }

  scan();
};