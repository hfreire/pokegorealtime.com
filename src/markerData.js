'use strict';

var Pokeio = require('pokemon-go-node-api');
var _ = require('lodash');

var POKEDEX = require('./pokedex').POKEDEX;

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

var spawnPoints = [];
var gyms = [];
var pokeStops = [];
var nearbyPokemons = [];
var mapPokemons = [];

function doHeartbeat() {
  var startTime = new Date();
  Pokeio.Heartbeat(function (error, heartbeat) {
    var endTime = new Date();
    if (error) {
      console.error(error);
    } else {
      spawnPoints = [];
      gyms = [];
      pokeStops = [];
      nearbyPokemons = [];
      mapPokemons = [];
      _.forEach(heartbeat.cells, function (cell) {
        spawnPoints = spawnPoints.concat(cell.SpawnPoint);

        _.forEach(cell.Fort, function (fort) {
          if (fort.FortType === 1) {
            pokeStops.push(fort);
          } else {
            gyms.push(fort);
          }
        });

        nearbyPokemons = nearbyPokemons.concat(cell.NearbyPokemon);
        mapPokemons = mapPokemons.concat(_.merge(cell.MapPokemon, cell.WildPokemon));
      });

      console.log("\n==== Scan start time: " + startTime + ", end time: " + endTime);
      console.log('Walked cells: ' + heartbeat.cells.length);
      console.log('Found Spawn Points: ' + spawnPoints.length);
      console.log('Found Gyms: ' + gyms.length);
      console.log('Found PokéStops: ' + pokeStops.length);
      console.log('Found Pokemons: ' +
        nearbyPokemons.length + ' (nearby), ' +
        mapPokemons.length + ' (map)');
      console.log("====");
    }
  });
}

Pokeio.init(username, password, location, provider, function (err) {
  if (err) throw err;

  console.log('[i] Current location: ' + Pokeio.playerInfo.locationName);
  console.log('[i] lat/long/alt: : ' + Pokeio.playerInfo.latitude + ' ' + Pokeio.playerInfo.longitude + ' ' + Pokeio.playerInfo.altitude);

  Pokeio.GetProfile(function (err, profile) {
    if (err) throw err;

    console.log('[i] Username: ' + profile.username);
    console.log('[i] Poke Storage: ' + profile.poke_storage);
    console.log('[i] Item Storage: ' + profile.item_storage);

    var poke = 0;
    if (profile.currency[ 0 ].amount) {
      poke = profile.currency[ 0 ].amount;
    }

    console.log('[i] Pokecoin: ' + poke);
    console.log('[i] Stardust: ' + profile.currency[ 1 ].amount);

    setInterval(doHeartbeat, 20000);
  });
});

function pokemonToMarker (pokemon) {
  var pokemonId = getPokemonId(pokemon);

  if (!pokemonId) {
    return;
  }

  var _pokemon = _.find(POKEDEX, {id: pokemonId.toString()});

  return {
    id: pokemon.Latitude + '-' + pokemon.Longitude + '-' + _pokemon.id,
    title: _pokemon.name,
    icon: _pokemon.img,
    position: {
      lat: pokemon.Latitude,
      long: pokemon.Longitude
    }
  };
}

function gymToMarker (gym) {
  return {
    id: gym.FortId,
    name:"Truck 1",
    position:{"lat":gym['Latitude'],"long":gym['Longitude']}
  };
}

function getPokemonId(pokemon) {
  if (pokemon.pokemon && pokemon.pokemon.PokemonId) {
    return pokemon.pokemon.PokemonId; // wild pokemon
  } else if (pokemon.PokedexTypeId) {
    return pokemon.PokedexTypeId; // map pokemon
  } else if (pokemon.PokedexNumber) {
    return pokemon.PokedexNumber; // nearby pokemon
  }
}

exports.getGymMarkers = function() {
	return _.map(gyms, gymToMarker);
};

exports.getPokemonMarkers = function () {
  return _.map(mapPokemons, pokemonToMarker);
};