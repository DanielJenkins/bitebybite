var originElement = document.getElementById('origin');
var destinationElement = document.getElementById('destination');
var originAutocomplete;
var destinationAutocomplete;


function init() {
  originAutocomplete = new google.maps.places.Autocomplete(originElement);
  destinationAutocomplete = new google.maps.places.Autocomplete(destinationElement);
}
google.maps.event.addDomListener(window, 'load', init);

var searchTermEl = document.getElementById('category');

var search = document.getElementById('search');
search.addEventListener('click',runSearch,false);

function changeView() {
  ////Change visibility of parts of the page
}

var origin;
var originLat;
var originLng;
var originLatLng;
var destination;
var destinationLat;
var destinationLng;
var destinationLatLng;
var searchPlaces = [];
function runSearch(e) {
  e.preventDefault();
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
      responseBody = xhr.responseText;
      //responseBody = JSON.parse(xhr.responseText);
    }
    else {
      console.log('error: ' + err);
    }
  }

}



