/*
 * Copyright (c) 2016, Hugo Freire <hugo@exec.sh>.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

angular
  .module('PokeGoRealtime', [])

  .run(function () {

    function isInsideCity (location, cityLocation) {
      var sw = new google.maps.LatLng(cityLocation.lat() - 0.05, cityLocation.lng() - 0.09);
      var ne = new google.maps.LatLng(cityLocation.lat() + 0.05, cityLocation.lng() + 0.09);
      var bounds = new google.maps.LatLngBounds(sw, ne);
      return bounds.contains(location);
    }

    var me;

    function addYourLocationButton (map) {
      var controlDiv = document.createElement('div');

      var firstChild = document.createElement('button');
      firstChild.style.backgroundColor = '#fff';
      firstChild.style.border = 'none';
      firstChild.style.outline = 'none';
      firstChild.style.width = '28px';
      firstChild.style.height = '28px';
      firstChild.style.borderRadius = '2px';
      firstChild.style.boxShadow = '0 1px 4px rgba(0,0,0,0.3)';
      firstChild.style.cursor = 'pointer';
      firstChild.style.marginRight = '10px';
      firstChild.style.padding = '0';
      firstChild.title = 'Your Location';
      controlDiv.appendChild(firstChild);

      var secondChild = document.createElement('div');
      secondChild.style.margin = '5px';
      secondChild.style.width = '18px';
      secondChild.style.height = '18px';
      secondChild.style.backgroundImage = 'url(https://maps.gstatic.com/tactile/mylocation/mylocation-sprite-2x.png)';
      secondChild.style.backgroundSize = '180px 18px';
      secondChild.style.backgroundPosition = '0 0';
      secondChild.style.backgroundRepeat = 'no-repeat';
      firstChild.appendChild(secondChild);

      google.maps.event.addListener(map, 'center_changed', function () {
        secondChild.style[ 'background-position' ] = '0 0';
      });

      firstChild.addEventListener('click', function () {
        var imgX = '0',
          animationInterval = setInterval(function () {
            imgX = imgX === '-18' ? '0' : '-18';
            secondChild.style[ 'background-position' ] = imgX + 'px 0';
          }, 500);

        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(function (position) {
            var latlng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
            var city = new google.maps.LatLng(59.3293477, 18.0684936);

            map.setCenter(latlng);
            map.setZoom(16);

            if (!me) {
              me = new GeolocationMarker(map);
              me.setCircleOptions({
                fillColor: 'red',
                strokeColor: 'red',
                fillOpacity: 0.1
              });
              me.setMarkerOptions({
                animation: google.maps.Animation.BOUNCE,
                icon: {
                  url: '/static/images/pokeball.png',
                  size: new google.maps.Size(30, 30),
                  scaledSize: new google.maps.Size(15, 15),
                  anchor: new google.maps.Point(7.5, 7.5),
                },
                map: map,
              });
            }


            clearInterval(animationInterval);
            secondChild.style[ 'background-position' ] = '-144px 0';
          });
        } else {
          clearInterval(animationInterval);
          secondChild.style[ 'background-position' ] = '0 0';
        }
      });

      controlDiv.index = 1;
      map.controls[ google.maps.ControlPosition.RIGHT_BOTTOM ].push(controlDiv);
    }

    function isMobile () {
      return isMobileiPhone() || isMobileAndroid();
    }

    function isMobileiPhone () {
      return navigator.userAgent.indexOf('iPhone') != -1;
    }

    function isMobileAndroid () {
      return navigator.userAgent.indexOf('Android') != -1;
    }

    var map = new google.maps.Map(document.getElementById("map"), {
      zoom: 15,
      minZoom: 13,
      center: new google.maps.LatLng(59.328221, 18.070394),
      mapTypeId: google.maps.MapTypeId.ROADMAP,
      mapTypeControl: false,
      zoomControl: !isMobile(),
      panControl: false,
      scaleControl: false,
      navigationControl: false,
      draggable: true,
      scrollwheel: false,
      streetViewControl: false,
      styles: [
        {
          "featureType": "all",
          "elementType": "labels",
          "stylers": [ { "visibility": "off" } ]
        },
        {
          "featureType": "all",
          "elementType": "geometry",
          "stylers": [ { "color": "#96d454" } ]
        },
        {
          "featureType": "water",
          "elementType": "geometry.fill",
          "stylers": [ { "saturation": "0" }, { "color": "#1297b1" }, { "visibility": "on" }, { "weight": "1" } ]
        },
        {
          featureType: "road",
          elementType: 'geometric',
          stylers: [ { visibility: "on" }, { "color": "#7dc23d" } ]
        },
        {
          "featureType": "transit",
          "elementType": "all",
          "stylers": [ { "visibility": "off" } ]
        },
        {
          "featureType": "administrative",
          "elementType": "all",
          "stylers": [ { "visibility": "on" } ]
        },
        {
          "featureType": "poi.park",
          "elementType": "all",
          "stylers": [ { "visibility": "on" } ]
        }
      ],
      backgroundColor: '#96d454'
    });
    var infoWindow;

    addYourLocationButton(map);

    var pokemonEncounterIds = {};
    var markerClusterer = new MarkerClusterer(map, [], {
      imagePath: 'static/images/markercluster/m',
      minimumClusterSize: 4
    });

    function getRoute (origin, destination) {
      $.get('/api/routes', { origin: origin, destination: destination },
        function (data) {

        }, "json")
        .fail(function () {
        })
        .always(function () {

        })
    }

    function getPokemons (callback) {
      function buildMarker (pokemon) {
        var pokedexId = pokemon.pokedex_id < 10 ? '00' + pokemon.pokedex_id :
          pokemon.pokedex_id < 100 ? '0' + pokemon.pokedex_id :
            pokemon.pokedex_id;

        var marker = new google.maps.Marker({
          encounter_id: pokemon.encounter_id,
          animation: google.maps.Animation.DROP,
          position: new google.maps.LatLng(pokemon.location.latitude, pokemon.location.longitude),
          icon: {
            url: '/static/images/pokedex/' + pokedexId + '.png',
            size: new google.maps.Size(120, 120),
            scaledSize: new google.maps.Size(60, 60),
            anchor: new google.maps.Point(30, 60),
          },
          expire_at: pokemon.expire_at,
          map: map,
        });

        marker.addListener('click', function () {
          if (infoWindow) {
            infoWindow.close();

            $("#map").off('click', '#take-me-there');
          }
          infoWindow = new google.maps.InfoWindow({
            pixelOffset: new google.maps.Size(-30, 10),
            content: '<div id="info-window">' +
            '  <div id="siteNotice"></div>' +
            '      <h1 id="firstHeading" class="firstHeading">' + pokemon.name + '</h1>' +
            '      <div id="bodyContent">' +
            '         <p>Disappears ' + moment.duration(pokemon.expire_at - new Date().getTime()).humanize(true) + '</p>' +
            '         <a id="take-me-there" class="waves-effect waves-light btn blue darken-1"><i class="material-icons left">navigation</i> Take me there!</a>' +
            '      </div>' +
            '  </div>' +
            '</div>'
          });

          $("#map").on('click', '#take-me-there', function () {
            navigator.geolocation.getCurrentPosition(function (location) {
              var origin = {
                latitude: location.coords.latitude,
                longitude: location.coords.longitude
              };
              var destination = {
                latitude: pokemon.location.latitude,
                longitude: pokemon.location.longitude
              };

              /*getRoute(orgin, destination);*/

              var parameters = '?saddr=' + origin.latitude + ',' + origin.longitude +
                '&daddr=' + destination.latitude + ',' + destination.longitude;

              // http://stackoverflow.com/questions/4642481/android-launch-google-map-via-web-url
              if (!isMobile()) {
                var ref = window.open('http://maps.google.com/maps' + parameters, '_self');
                if (ref) {
                  ref.focus();
                }

              } else {
                if (isMobileiPhone()) {
                  window.open('http://maps.apple.com/' + parameters, '_self');
                  // open Google Maps app in iOS?
                  // window.open('comgooglemaps://' + parameters, '_self');

                } else if (isMobileAndroid()) {
                  window.open('google.navigation:q=' + destination.latitude + ',' +
                    destination.longitude + '&mode=d', '_system');
                } else {
                  window.open('http://maps.google.com/maps' + parameters, '_self');
                }

              }
            });
          });

          infoWindow.open(map, marker);
        });

        return marker;
      }

      function cleanExpiredPokemonMarkers () {
        var now = new Date().getTime();
        var markers = markerClusterer.getMarkers();
        for (var i = 0; i < markers.length; i++) {
          if (markers[ i ].expire_at < now) {
            if (markers[ i ].infowindow) {
              markers[ i ].infowindow.close();
            }

            delete pokemonEncounterIds[ markers[ i ].encounter_id ];

            markerClusterer.removeMarker(markers[ i ]);
          }
        }
      }

      function addNewPokemonMarkers (pokemons) {
        var now = new Date().getTime();
        for (var i = 0; i < pokemons.length; i++) {
          if (pokemons[ i ].expire_at < now) continue;
          if (!pokemons[ i ]) continue; // TODO: api sending pokemon as null
          if (!pokemonEncounterIds[ pokemons[ i ].encounter_id ]) {
            var marker = buildMarker(pokemons[ i ]);
            markerClusterer.addMarker(marker);

            pokemonEncounterIds[ pokemons[ i ].encounter_id ] = true;
          }
        }
      }

      $.get('/api/pokemons', { latitude: 59.328152, longitude: 18.070033, radius: 20 },
        function (data) {
          cleanExpiredPokemonMarkers();

          return addNewPokemonMarkers(data);
        }, "json")

        .fail(function () {
        })
        .always(function () {
          if (callback) {
            callback();
          }

          window.setTimeout(getPokemons, 10000);
        });
    }

    getPokemons(function () {
    });

  });