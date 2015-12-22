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
var addressElLine1 = [];
var addressElLine2 = [];

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
      changeView('resultsScreen',null);
    }
    else {
      console.log('error: ' + err);
    }
  }
}

function loadMap(searchResults,origin,destination) {
  holderEl = document.createElement('div');
  searchResultsEl.appendChild(holderEl);
  for (var i = 0; i < searchResults.length; i++) {
    nameEl[i] = document.createElement('a');
    var nameText = document.createTextNode(searchResults[i].name);
    nameEl[i].appendChild(nameText);
    nameEl[i].addEventListener('click',changeView('expandedOption',searchResults[i]),false);
    holderEl.appendChild(nameEl[i]);
    holderEl.appendChild(new AddRating(searchResults[i]));
    var displayAddress = searchResults[i].location.display_address;
    var addressLine1Text = document.createTextNode(displayAddress[0]);
    var addressLine2Text = document.createTextNode(displayAddress[1]);
    addressElLine1[i] = document.createElement('p');
    addressElLine1[i].appendChild(addressLine1Text);
    addressElLine2[i] = document.createElement('p');
    addressElLine2[i].appendChild(addressLine2Text);
    ////MORE LINES OF TEXT
    holderEl.appendChild(addressElLine1[i]);
    holderEl.appendChild(addressElLine2[i]);
  };
}

function AddRating(business) {
  ratingsEl = document.createElement('div');
  var rating;
  if(business.rating == 1) {
    rating = '1';
  }
  else if (business.rating == 1.5) {
    rating = '1-half';
  }
  else if (business.rating == 2) {
    rating = '2';
  }
  else if (business.rating == 2.5) {
    rating = '2-half';
  }
  else if (business.rating == 3) {
    rating = '3';
  }
  else if (business.rating == 3.5) {
    rating = '3-half';
  }
  else if (business.rating == 4) {
    rating = '4';
  }
  else if (business.rating == 4.5) {
    rating = '4-half';
  }
  else if (business.rating == 5) {
    rating = '5';
  }
  ratingsEl.className = 'rating rating-' + rating;
  star1 = document.createElement('i');
  star2 = document.createElement('i');
  star3 = document.createElement('i');
  star4 = document.createElement('i');
  star5 = document.createElement('i');
  star1.appendChild(document.createTextNode('★'));
  star2.appendChild(document.createTextNode('★'));
  star3.appendChild(document.createTextNode('★'));
  star4.appendChild(document.createTextNode('★'));
  star5.appendChild(document.createTextNode('★'));
  star1.className = 'star-1';
  star2.className = 'star-2';
  star3.className = 'star-3';
  star4.className = 'star-4';
  star5.className = 'star-5';
  ratingsEl.appendChild(star1);
  ratingsEl.appendChild(star2);
  ratingsEl.appendChild(star3);
  ratingsEl.appendChild(star4);
  ratingsEl.appendChild(star5);
  return ratingsEl;
}

////Change visibility of parts of the page
function changeView(view,business) {
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
  changeView('loadScreen',null);
  runSearch();
}