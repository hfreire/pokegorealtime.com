/*
 * Copyright (c) 2016, Hugo Freire <hugo@exec.sh>.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

var startLocation;
var path = [];

function Walker() {

  this.walk = function (latitude, longitude) {

    if (path.length === 0) {

      if (!latitude && !startLocation && !startLocation.latitude ||
      !longitude && !startLocation && !startLocation.longitude) {
        throw new Error('a start location is required');
      }

      if (latitude && longitude) {
        startLocation = {
          latitude: latitude,
          longitude: longitude
        }
      }

      var stepSize = 0.0015;
      var stepLimit = 49;

      path = this._generateSpiral(startLocation.latitude, startLocation.longitude, stepSize, stepLimit);
    }

    var location = path[0];
    path.shift();

    return location;
  };

  this._generateSpiral = function (latitude, longitude, stepSize, stepLimit) {
    var coords = [{latitude: latitude, longitude: longitude}]
    var steps = 1, x = 0, y = 0, d = 1, m = 1;
    var rlow = 0.0
    var rhigh = 0.0005

    while (steps < stepLimit) {
      while (2 * x * d < m && steps < stepLimit) {
        x = x + d
        steps += 1
        var lat = x * stepSize + latitude + (Math.random() * (rhigh - rlow) + rlow);
        var lng = y * stepSize + longitude + (Math.random() * (rhigh - rlow) + rlow);
        coords.push({ latitude: lat, longitude: lng })
      }
      while (2 * y * d < m && steps < stepLimit) {
        y = y + d
        steps += 1
        var lat = x * stepSize + latitude + (Math.random() * (rhigh - rlow) + rlow);
        var lng = y * stepSize + longitude + (Math.random() * (rhigh - rlow) + rlow);
        coords.push({ latitude: lat, longitude: lng })
      }

      d = -1 * d;
      m = m + 1;

    }
    return coords
  };
}

module.exports = new Walker();