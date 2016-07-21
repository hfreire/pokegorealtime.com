$(document).ready(function () {

  var map;

  //Used to remember markers
  var gymMarkerStore = [];
  var pokemonMarkerStore = [];

  function getGymMarkers () {
    $.get('/gyms', {}, function (res, resp) {
      // Clean the existing markers
      gymMarkerStore = [];

      for (var i = 0, len = res.length; i < len; i++) {

        //Do we have this marker already?
        if (gymMarkerStore.hasOwnProperty(res[ i ].id)) {
          gymMarkerStore[ res[ i ].id ].setPosition(new google.maps.LatLng(res[ i ].position.lat, res[ i ].position.long));
        } else {
          var image;
          if (res[ i ].icon) {
            image = {
              url: res[ i ].icon,
              size: new google.maps.Size(128, 128),
              origin: new google.maps.Point(0, 0),
              anchor: new google.maps.Point(64, 128)
            };
          }

          var marker = new google.maps.Marker({
            position: new google.maps.LatLng(res[ i ].position.lat, res[ i ].position.long),
            title: res[ i ].name,
            icon: image,
            map: map
          });
          gymMarkerStore[ res[ i ].id ] = marker;
        }
      }
      window.setTimeout(getGymMarkers, 40000);
    }, "json");
  }

  function getPokemonMarkers () {
    $.get('/pokemons', {}, function (res, resp) {
      // Clean the existing markers
      for (var i = 0, len = pokemonMarkerStore.length; i < len; i++) {
        pokemonMarkerStore[i].setMap(null);
      }

      pokemonMarkerStore.length = 0;

      for (i = 0, len = res.length; i < len; i++) {
        var marker = new google.maps.Marker({
          position: new google.maps.LatLng(res[ i ].position.lat, res[ i ].position.long),
          title: res[ i ].name,
          icon: {
            url: res[ i ].icon,
            size: new google.maps.Size(128, 128),
            origin: new google.maps.Point(0, 0),
            anchor: new google.maps.Point(64, 128)
          },
          map: map
        });

        pokemonMarkerStore.push(marker);
      }

      window.setTimeout(getPokemonMarkers, 10000);
    }, "json");
  }


  navigator.geolocation.getCurrentPosition(function (location) {
    map = new google.maps.Map(document.getElementById("map"), {
      zoom: 14,
      center: new google.maps.LatLng(location.coords.latitude, location.coords.longitude),
      mapTypeId: google.maps.MapTypeId.ROADMAP,
    });

    getGymMarkers();
    getPokemonMarkers()
  });

});
