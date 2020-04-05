// Define streetmap, satellite, & darkmap layers
 var streetmap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
   attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
   maxZoom: 18,
   id: "mapbox.streets",
   accessToken: "pk.eyJ1IjoiemxlaXN1cmUiLCJhIjoiY2swOW1oNnVkMDJoazNqcXZmM3hiMWRlMiJ9.CG86jvMwMrSGMDmZTsdbJg"
 });

var darkmap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
   attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
   maxZoom: 18,
   id: "mapbox.dark",
   accessToken: "pk.eyJ1IjoiemxlaXN1cmUiLCJhIjoiY2swOW1oNnVkMDJoazNqcXZmM3hiMWRlMiJ9.CG86jvMwMrSGMDmZTsdbJg"
 }); 

var satellite = L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
    maxZoom: 18,
    id: 'mapbox.satellite',
    accessToken: 'pk.eyJ1IjoiemxlaXN1cmUiLCJhIjoiY2swOW1oNnVkMDJoazNqcXZmM3hiMWRlMiJ9.CG86jvMwMrSGMDmZTsdbJg'
});

// create basemap to hold base layers
var baseMaps = {
   "Street Map": streetmap,
   "Dark Map": darkmap,
   "Satellite": satellite
 };

var tectonicPlates = new L.LayerGroup();

var overlayMaps = {
  "Tectonic Plates": tectonicPlates
};

 // Create map; default streetmap layer and earthquakes layers displayed
var myMap = L.map("map", {
  center: [20, 0],
  zoom: 2.4,
  layers: [satellite,darkmap,streetmap, tectonicPlates]
});

//function createMap(earthquakes) {

//satellite.addTo(myMap)

// Create a layer control
// Pass in our baseMaps and overlayMaps
// Add the layer control to the map
L.control.layers(baseMaps).addTo(myMap); //,  {collapsed: false
//}

//all earthquakes in last 30 days
var earthquakesUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson"
// tectonic plate boundaries URL
var plates_url = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json"

// Perform a GET request to the query URL
d3.json(earthquakesUrl, function(data) { //asychronous call
  // This function returns the style data for each of the earthquakes we plot on
  // the map. We pass the magnitude of the earthquake into two separate functions
  // to calculate the color and radius.
  function styleInfo(feature) {
    return {
      opacity: 1,
      fillOpacity: 1,
      fillColor: getColor(feature.properties.mag),
      color: "#000000",
      radius: getRadius(feature.properties.mag),
      stroke: true,
      weight: 0.5
    };
  }

  // This function determines the color of the marker based on the magnitude of the earthquake.
  function getColor(magnitude) {
    switch (true) {
    case magnitude > 5:
      return "#ea2c2c";
    case magnitude > 4:
      return "#ea822c";
    case magnitude > 3:
      return "#ee9c00";
    case magnitude > 2:
      return "#eecc00";
    case magnitude > 1:
      return "#d4ee00";
    default:
      return "#98ee00";
    }
  }

  // This function determines the radius of the earthquake marker based on its magnitude.
  // Earthquakes with a magnitude of 0 were being plotted with the wrong radius.
  function getRadius(magnitude) {
    if (magnitude === 0) {
      return 1;
    }

    return magnitude * 2;
  }  


  // Here we create a legend control object.
  var legend = L.control({
    position: "bottomright"
  });

  // Then add all the details for the legend
  legend.onAdd = function() {
    var div = L.DomUtil.create("div", "info legend");

    var grades = [0, 1, 2, 3, 4, 5];
    var colors = [
      "#98ee00",
      "#d4ee00",
      "#eecc00",
      "#ee9c00",
      "#ea822c",
      "#ea2c2c"
    ];

    // Looping through our intervals to generate a label with a colored square for each interval.
    for (var i = 0; i < grades.length; i++) {
      div.innerHTML +=
        "<i style='background: " + colors[i] + "'></i> " +
        grades[i] + (grades[i + 1] ? "&ndash;" + grades[i + 1] + "<br>" : "+");
    }
    return div;
  };

  // Finally, we our legend to the map.
  legend.addTo(myMap);
  

  // Here we add a GeoJSON layer to the map once the file is loaded.
  L.geoJson(data, {
    // We turn each feature into a circleMarker on the map.
    pointToLayer: function(feature, latlng) {  //arugment feature, point to layer key, 2 arguments: feature & latlng, order matters here
      return L.circleMarker(latlng);
    },
    // We set the style for each circleMarker using our styleInfo function.
    style: styleInfo,  //
    // We create a popup for each marker to display the magnitude and location of the earthquake after the marker has been created and styled
    onEachFeature: function(feature, layer) {  //
      layer.bindPopup("Magnitude: " + feature.properties.mag + "<br>Location: " + feature.properties.place);
    }
  }).addTo(myMap);
});

// create overlay to hold earthquake data layer
var overlayMaps = {
  //"Earthquakes": earthquakes,
  "Tectonic Plates": tectonicPlates
}; 

d3.json(plates_url, function(plateData) {
  // Adding our geoJSON data, along with style information, to the tectonicplates
  // layer.
  L.geoJson(plateData, {
    color: "yellow",
    weight: 1.0
  })
  .addTo(tectonicPlates);
});  

 

