/*
 * Copyright (c) 2016, Hugo Freire <hugo@exec.sh>.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

'use strict';

var _ = require('lodash'),
  distance = require('google-distance');

distance.apiKey = 'AIzaSyCa0lqL9Ny1bUe3b1BruO3U6Z_xtISYBZM';

exports.getRoute = function (req, res) {
  if (!req.query ||
    !req.query.origin || !req.query.origin.latitude || !req.query.origin.longitude ||
    !req.query.destination || !req.query.destination.latitude || !req.query.destination.longitude
  ) {
    return res.status(400).send();
  }

  var origin = req.query.origin;
  var destination = req.query.destination;

  distance.get({
      origin: origin.latitude + ',' + origin.longitude,
      destination: destination.latitude + ',' + destination.longitude,
      mode: 'walking'
    },
    function(error, data) {
      if (error) {
        console.error(error);

        return res.status(503);
      }

      res.send({
        origin: data.origin,
        destination: data.destination,
        distance: data.distance,
        duration: data.durationValue
      });
    });
};