var express = require('express');
var app = express();

var markerData = require('./markerData.js');

//define my static folder
app.use('/static', express.static(__dirname + "/public", { maxAge: 86400000 }));

app.get('/', function (req, res) {

  res.sendfile(__dirname + "/views/index.html");
});

app.get('/gyms', function (req, res) {
  res.send(JSON.stringify(markerData.getGymMarkers()));
});

app.get('/pokemons', function (req, res) {
  res.send(JSON.stringify(markerData.getPokemonMarkers()));
});

app.listen(3000);
console.log("Listening to port 3000");
