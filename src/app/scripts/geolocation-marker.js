(function () {
  /*
   geolocation-marker version 2.0.4
   @copyright 2012, 2015 Chad Killingsworth
   @see https://github.com/ChadKillingsworth/geolocation-marker/blob/master/LICENSE.txt
   */
  'use strict';
  var $jscomp = {
    scope: {},
    getGlobal: function (a) {return "undefined" != typeof window && window === a ? a : "undefined" != typeof global ? global : a}
  };
  $jscomp.global = $jscomp.getGlobal(this);
  $jscomp.initSymbol = function () {
    $jscomp.global.Symbol || ($jscomp.global.Symbol = $jscomp.Symbol);
    $jscomp.initSymbol = function () {}
  };
  $jscomp.symbolCounter_ = 0;
  $jscomp.Symbol = function (a) {return "jscomp_symbol_" + a + $jscomp.symbolCounter_++};
  $jscomp.initSymbolIterator = function () {
    $jscomp.initSymbol();
    $jscomp.global.Symbol.iterator || ($jscomp.global.Symbol.iterator = $jscomp.global.Symbol("iterator"));
    $jscomp.initSymbolIterator = function () {}
  };
  $jscomp.makeIterator = function (a) {
    $jscomp.initSymbolIterator();
    if (a[ $jscomp.global.Symbol.iterator ])return a[ $jscomp.global.Symbol.iterator ]();
    if (!(a instanceof Array || "string" == typeof a || a instanceof String))throw new TypeError(a + " is not iterable");
    var b = 0;
    return {
      next: function () {
        return b == a.length ? { done: !0 } : {
          done: !1,
          value: a[ b++ ]
        }
      }
    }
  };
  $jscomp.arrayFromIterator = function (a) {
    for (var b, c = []; !(b = a.next()).done;)c.push(b.value);
    return c
  };
  $jscomp.arrayFromIterable = function (a) {return a instanceof Array ? a : $jscomp.arrayFromIterator($jscomp.makeIterator(a))};
  $jscomp.arrayFromArguments = function (a) {
    for (var b = [], c = 0; c < a.length; c++)b.push(a[ c ]);
    return b
  };
  $jscomp.inherits = function (a, b) {
    function c () {}

    c.prototype = b.prototype;
    a.prototype = new c;
    a.prototype.constructor = a;
    for (var d in b)if ($jscomp.global.Object.defineProperties) {
      var e = $jscomp.global.Object.getOwnPropertyDescriptor(b, d);
      void 0 !== e && $jscomp.global.Object.defineProperty(a, d, e)
    } else a[ d ] = b[ d ]
  };
  var module$src$geolocation_marker = {}, GeolocationMarker$$module$src$geolocation_marker = function (a, b, c) {
    google.maps.MVCObject.call(this);
    this.circle_ = this.marker_ = null;
    this.watchId_ = -1;
    var d = {
      clickable: !1,
      cursor: "pointer",
      draggable: !1,
      flat: !0,
      icon: {
        url: "https://chadkillingsworth.github.io/geolocation-marker/images/gpsloc.png",
        size: new google.maps.Size(34, 34),
        scaledSize: new google.maps.Size(17, 17),
        origin: new google.maps.Point(0, 0),
        anchor: new google.maps.Point(8, 8)
      },
      optimized: !1,
      position: new google.maps.LatLng(0,
        0),
      title: "Current location",
      zIndex: 2
    };
    b && (d = this.copyOptions_(d, b));
    b = {
      clickable: !1,
      radius: 0,
      strokeColor: "1bb6ff",
      strokeOpacity: .4,
      fillColor: "61a0bf",
      fillOpacity: .4,
      strokeWeight: 1,
      zIndex: 1
    };
    c && (b = this.copyOptions_(b, c));
    this.marker_ = new google.maps.Marker(d);
    this.circle_ = new google.maps.Circle(b);
    google.maps.MVCObject.prototype.set.call(this, "accuracy", null);
    google.maps.MVCObject.prototype.set.call(this, "position", null);
    google.maps.MVCObject.prototype.set.call(this, "map", null);
    this.set("minimum_accuracy",
      null);
    this.set("position_options", { enableHighAccuracy: !0, maximumAge: 1E3 });
    this.circle_.bindTo("map", this.marker_);
    a && this.setMap(a)
  };
  $jscomp.inherits(GeolocationMarker$$module$src$geolocation_marker, google.maps.MVCObject);
  GeolocationMarker$$module$src$geolocation_marker.prototype.set = function (a, b) {
    if (GeolocationMarker$$module$src$geolocation_marker.invalidPropertiesExpr_.test(a))throw"'" + a + "' is a read-only property.";
    "map" === a ? this.setMap(b) : google.maps.MVCObject.prototype.set.call(this, a, b)
  };
  GeolocationMarker$$module$src$geolocation_marker.prototype.getMap = function () {return this.get("map")};
  GeolocationMarker$$module$src$geolocation_marker.prototype.getPositionOptions = function () {return this.get("position_options")};
  GeolocationMarker$$module$src$geolocation_marker.prototype.setPositionOptions = function (a) {this.set("position_options", a)};
  GeolocationMarker$$module$src$geolocation_marker.prototype.getPosition = function () {return this.get("position")};
  GeolocationMarker$$module$src$geolocation_marker.prototype.getBounds = function () {return this.get("position") ? this.circle_.getBounds() : null};
  GeolocationMarker$$module$src$geolocation_marker.prototype.getAccuracy = function () {return this.get("accuracy")};
  GeolocationMarker$$module$src$geolocation_marker.prototype.getMinimumAccuracy = function () {return this.get("minimum_accuracy")};
  GeolocationMarker$$module$src$geolocation_marker.prototype.setMinimumAccuracy = function (a) {this.set("minimum_accuracy", a)};
  GeolocationMarker$$module$src$geolocation_marker.prototype.setMap = function (a) {
    google.maps.MVCObject.prototype.set.call(this, "map", a);
    a ? this.watchPosition_() : (this.marker_.unbind("position"), this.circle_.unbind("center"), this.circle_.unbind("radius"), google.maps.MVCObject.prototype.set.call(this, "accuracy", null), google.maps.MVCObject.prototype.set.call(this, "position", null), navigator.geolocation.clearWatch(this.watchId_), this.watchId_ = -1, this.marker_.setMap(a))
  };
  GeolocationMarker$$module$src$geolocation_marker.prototype.setMarkerOptions = function (a) {this.marker_.setOptions(this.copyOptions_({}, a))};
  GeolocationMarker$$module$src$geolocation_marker.prototype.setCircleOptions = function (a) {this.circle_.setOptions(this.copyOptions_({}, a))};
  GeolocationMarker$$module$src$geolocation_marker.prototype.updatePosition_ = function (a) {
    var b = new google.maps.LatLng(a.coords.latitude, a.coords.longitude), c = null == this.marker_.getMap();
    if (c) {
      if (null != this.getMinimumAccuracy() && a.coords.accuracy > this.getMinimumAccuracy())return;
      this.marker_.setMap(this.getMap());
      this.marker_.bindTo("position", this);
      this.circle_.bindTo("center", this, "position");
      this.circle_.bindTo("radius", this, "accuracy")
    }
    this.getAccuracy() != a.coords.accuracy && google.maps.MVCObject.prototype.set.call(this,
      "accuracy", a.coords.accuracy);
    !c && null != this.getPosition() && this.getPosition().equals(b) || google.maps.MVCObject.prototype.set.call(this, "position", b)
  };
  GeolocationMarker$$module$src$geolocation_marker.prototype.watchPosition_ = function () {navigator.geolocation && (this.watchId_ = navigator.geolocation.watchPosition(this.updatePosition_.bind(this), this.geolocationError_.bind(this), this.getPositionOptions()))};
  GeolocationMarker$$module$src$geolocation_marker.prototype.geolocationError_ = function (a) {google.maps.event.trigger(this, "geolocation_error", a)};
  GeolocationMarker$$module$src$geolocation_marker.prototype.copyOptions_ = function (a, b) {
    for (var c in b)!0 !== GeolocationMarker$$module$src$geolocation_marker.DISALLOWED_OPTIONS[ c ] && (a[ c ] = b[ c ]);
    return a
  };
  GeolocationMarker$$module$src$geolocation_marker.DISALLOWED_OPTIONS = {
    map: !0,
    position: !0,
    radius: !0
  };
  GeolocationMarker$$module$src$geolocation_marker.invalidPropertiesExpr_ = /^(?:position|accuracy)$/i;
  var $jscompDefaultExport$$module$src$geolocation_marker = GeolocationMarker$$module$src$geolocation_marker;
  module$src$geolocation_marker.default = $jscompDefaultExport$$module$src$geolocation_marker;
  (function (a, b) {"function" === typeof a.define && a.define.amd ? a.define([], b) : "object" === typeof a.exports ? a.module.exports = b() : a.GeolocationMarker = b()})(this, function () {
    module$src$geolocation_marker.default.prototype.getAccuracy = module$src$geolocation_marker.default.prototype.getAccuracy;
    module$src$geolocation_marker.default.prototype.getBounds = module$src$geolocation_marker.default.prototype.getBounds;
    module$src$geolocation_marker.default.prototype.getMap = module$src$geolocation_marker.default.prototype.getMap;
    module$src$geolocation_marker.default.prototype.getMinimumAccuracy = module$src$geolocation_marker.default.prototype.getMinimumAccuracy;
    module$src$geolocation_marker.default.prototype.getPosition = module$src$geolocation_marker.default.prototype.getPosition;
    module$src$geolocation_marker.default.prototype.getPositionOptions = module$src$geolocation_marker.default.prototype.getPositionOptions;
    module$src$geolocation_marker.default.prototype.setCircleOptions = module$src$geolocation_marker.default.prototype.setCircleOptions;
    module$src$geolocation_marker.default.prototype.setMap = module$src$geolocation_marker.default.prototype.setMap;
    module$src$geolocation_marker.default.prototype.setMarkerOptions = module$src$geolocation_marker.default.prototype.setMarkerOptions;
    module$src$geolocation_marker.default.prototype.setMinimumAccuracy = module$src$geolocation_marker.default.prototype.setMinimumAccuracy;
    module$src$geolocation_marker.default.prototype.setPositionOptions = module$src$geolocation_marker.default.prototype.setPositionOptions;
    return module$src$geolocation_marker.default
  });
}).call(this)