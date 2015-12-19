var originElement = document.getElementById('origin');
var destinationElement = document.getElementById('destination');
var searchTermEl = document.getElementById('category');
var search = document.getElementById('search');
var searchResultsEl = document.getElementById('searchResults');
var originAutocomplete;
var destinationAutocomplete;
var yelpResults;
var origin;
var originLat;
var originLng;
var originLatLng;
var destination;
var destinationLat;
var destinationLng;
var destinationLatLng;
var searchPlaces = [];
var nameEl = []

search.addEventListener('click',searchRequested,false);
google.maps.event.addDomListener(window, 'load', init);

function init() {
  originAutocomplete = new google.maps.places.Autocomplete(originElement);
  destinationAutocomplete = new google.maps.places.Autocomplete(destinationElement);
}

function runSearch() {
  //Get origin and destination lat&lng
  var searchTerm = JSON.stringify(searchTermEl.value);
  origin = originAutocomplete.getPlace();
  originLat = origin.geometry.location.lat();
  originLng = origin.geometry.location.lng();
  originLatLng = new google.maps.LatLng({lat: originLat, lng: originLng}); 
  destination = destinationAutocomplete.getPlace();
  destinationLat = destination.geometry.location.lat();
  destinationLng = destination.geometry.location.lng();
  destinationLatLng = new google.maps.LatLng({lat: destinationLat, lng: destinationLng}); 

  var numSearches = 4; //Starts at 0
  var LatLngObj;
  searchPlaces[0] = originLatLng;
  for (var i = 0; i <= numSearches; i++) {
    LatLngObj = google.maps.geometry.spherical.interpolate(originLatLng, destinationLatLng, (i/numSearches));
    searchPlaces[i] = {searchTerm: searchTerm, lat: LatLngObj.lat(), lng: LatLngObj.lng()};
  };
  var jsonSearchPlaces = JSON.stringify(searchPlaces);
  var xhr = new XMLHttpRequest();
  xhr.open('POST','/yelp/search',true);
  xhr.send(jsonSearchPlaces);

  xhr.onload = function() {
    if (xhr.status == 200) {
      console.log('Search results received by default.js');
      yelpResults = JSON.parse(xhr.responseText);
      console.log('First yelp result name: ' + yelpResults[0].name);

      loadMap(yelpResults,origin,destination);
      changeView('resultsScreen');
    }
    else {
      console.log('error: ' + err);
    }
  }
}

function loadMap(searchResults,origin,destination) {
  for (var i = 0; i < searchResults.length; i++) {
    console.log('text: ' + searchResults[i].name);
    var nameText = document.createTextNode(searchResults[i].name);
    nameEl[i] = document.createElement('p');
    console.log(nameEl[i]);
    nameEl[i].appendChild(nameText);
    searchResultsEl.appendChild(nameEl[i]);
  };
}

////Change visibility of parts of the page
function changeView(view) {
  console.log('Changing page view to ' + view);
  if (view === 'loadScreen') {
  }
  if (view === 'resultsScreen') {
  };
  if (view === 'expandedOption'){
  }
}

function searchRequested(e) {
  e.preventDefault();
  changeView('loadScreen');
  runSearch();
}