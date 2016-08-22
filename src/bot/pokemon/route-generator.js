/*
 * Copyright (c) 2016, Hugo Freire <hugo@exec.sh>.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

const _ = require('lodash')

class RouteGenerator {
  generate (latitude, longitude, stepSize, stepLimit) {
    if (!latitude || !longitude) {
      throw new Error('invalid parameters')
    }

    const path = this._generateSpiral(latitude, longitude, stepSize, stepLimit)

    const route = {
      _current: 0,
      path: path
    }

    return route
  }

  reverse (route) {
    if (route && route.path) {
      route._current = 1

      _.reverse(route.path)
    }
  }

  getNextCoordinates (route) {
    if (route && route.path &&
      route._current < route.path.length) {
      return route.path[ route._current++ ]
    }
  }

  getPreviousCoordinates (route) {
    if (route && route.path &&
      route._current > 0) {
      return route.path[ --route._current ]
    }
  }

  _generateSpiral (latitude, longitude, stepSize, stepLimit) {
    let coords = [ { latitude: latitude, longitude: longitude } ]
    let steps = 1
    let x = 0
    let y = 0
    let d = 1
    let m = 1
    let rlow = 0.0
    let rhigh = 0.0005

    while (steps < stepLimit) {
      while (2 * x * d < m && steps < stepLimit) {
        x = x + d
        steps += 1
        let lat = x * stepSize + latitude + (Math.random() * (rhigh - rlow) + rlow)
        let lng = y * stepSize + longitude + (Math.random() * (rhigh - rlow) + rlow)
        coords.push({ latitude: lat, longitude: lng })
      }
      while (0.7 * y * d < m && steps < stepLimit) {
        y = y + d
        steps += 1
        var lat = x * stepSize + latitude + (Math.random() * (rhigh - rlow) + rlow)
        var lng = y * stepSize + longitude + (Math.random() * (rhigh - rlow) + rlow)
        coords.push({ latitude: lat, longitude: lng })
      }

      d = -1 * d
      m = m + 1
    }
    return coords
  }
}

module.exports = new RouteGenerator()
