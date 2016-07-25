/*
 * Copyright (c) 2016, Hugo Freire <hugo@exec.sh>.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

var express = require('express');

var controller = require('./controllers/controller'),
  routeController = require('./controllers/routes');

var Server = {

  _http: undefined,

  start: function(callback) {
    console.log('Starting server');

    this._http = express();
    this._http.set('x-powered-by', false);

    this._http.use('/static', express.static(__dirname + "/public", { maxAge: 86400000 }));

    this._http.get('/', function (req, res) {
      res.redirect('/stockholm');
    });

    this._http.get('/stockholm', function (req, res) {
      res.sendfile(__dirname + "/public/index.html");
    });

    this._http.get('/api/gyms', function (req, res) {
      controller.getGymMarkers(function (result) {
        res.send(JSON.stringify(result));
      });    });

    this._http.get('/api/pokemons', function (req, res) {
      controller.getPokemonMarkers(function (result) {
        res.send(JSON.stringify(result));
      });
    });

    this._http.get('/api/routes', routeController.getRoute);

    this._http.get('/robots.txt', function (req, res) {
      res.type('text/plain');
      res.send("User-agent: *\nDisallow: /api/");
    });

    this._http.listen(61234);

    if (callback) {
      callback()
    }
  },

  stop: function(callback) {
    console.log('Stopping server');
  },

  report: function (error, callback) {
    console.error(error.stack ? error.stack : error.message)

    if (callback) {
      callback()
    }
  }
}

module.exports = Server;