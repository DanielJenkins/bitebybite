var originElement = document.getElementById('origin');
var destinationElement = document.getElementById('destination');
var searchTermEl = document.getElementById('category');
var search = document.getElementById('search');
var searchResultsEl = document.getElementById('searchResults');
var bound;
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
var map;
var holderEl;
var waypoint = [];
var navSteps = [];
var searchPlaces = [];
var searchResult = [];
var nameEl = []
var addressEl = [];
var resultMarker = [];

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
  //Generate map and get step coordinates
  createMapEl();

  console.log('originLatLng: ' + originLatLng);
  console.log('destinationLatLng: ' + destinationLatLng);
  console.log('nav steps 1: ' + navSteps[0]);

  //Get Yelp Search Locations
  var numSearches = 4; //Starts at 0
  var LatLngObj;
  searchPlaces[0] = originLatLng;
  for (var i = 0; i <= numSearches; i++) {
    LatLngObj = google.maps.geometry.spherical.interpolate(originLatLng, destinationLatLng, (i/numSearches));
    searchPlaces[i] = {searchTerm: searchTerm, lat: LatLngObj.lat(), lng: LatLngObj.lng()};
  };
  //Send Request to Yelp
  var jsonSearchPlaces = JSON.stringify(searchPlaces);
  var xhr = new XMLHttpRequest();
  xhr.open('POST','/yelp/search',true);
  xhr.send(jsonSearchPlaces);
  //Get Results from Yelp
  xhr.onload = function() {
    if (xhr.status == 200) {
      yelpResults = JSON.parse(xhr.responseText);
      addResultsToPage(yelpResults,origin,destination);
    }
    else {
      console.log('error: ' + err);
    }
  }
}

//Generate Map El
function createMapEl() {
  while (searchResultsEl.firstChild) {
    searchResultsEl.removeChild(searchResultsEl.firstChild);
  }
  waypoint = [];
  holderEl = document.createElement('div');
  searchResultsEl.appendChild(holderEl);
  var resultMapRow = document.createElement('div');
  resultMapRow.className = 'row';
  resultMapRow.id = 'resultMapRow';
  holderEl.appendChild(resultMapRow);
  var mapEl = document.createElement('div');
  mapEl.className = 'col-xs-12 col-sm-offset-1 col-sm-10 col-md-offset-2 col-md-8';
  mapEl.id = 'resultMap';
  resultMapRow.appendChild(mapEl);
  initMap();
}

//Generate Map
function initMap() {
  var directionsService = new google.maps.DirectionsService;
  var directionsDisplay = new google.maps.DirectionsRenderer;
  map = new google.maps.Map(document.getElementById('resultMap'), {
    zoom: 8,
    center: {lat: 33.6694600, lng: -117.8231100}
  });
  calculateAndDisplayRoute(directionsService, directionsDisplay, navSteps);
}

//Generate Directions and Get Step Coordinates
function calculateAndDisplayRoute(directionsService, directionsDisplay, navSteps) {
  directionsService.route({
    origin: originLatLng,
    waypoints: waypoint,
    destination: destinationLatLng,
    travelMode: google.maps.TravelMode.DRIVING
  }, function(response, status) {
    if (status === google.maps.DirectionsStatus.OK) {
      directionsDisplay.setDirections(response);
      navSteps = [];
      var theRoute = response.routes[0].legs[0];
      console.log('originLatLng: ' + originLatLng);
      for (var s = 0; s < theRoute.steps.length; s++) {
        navSteps[s] = (theRoute.steps[s].start_location);
        console.log('step ' + s + ' ' + navSteps[s]);
      }
      console.log('destinationLatLng: ' + destinationLatLng);
    }
    else {
      window.alert('Directions request failed due to ' + status);
    }
  });
  directionsDisplay.setMap(map);
}

//Adds Yelp Results as a list and as markers on the map
function addResultsToPage(searchResults,origin,destination) {
  bound = new google.maps.LatLngBounds();
  for (var i = 0; i < searchResults.length; i++) {
    (function () {
      var resultLat = searchResults[i].location.coordinate.latitude;
      var resultLng = searchResults[i].location.coordinate.longitude;
      var resultLatLng = {lat: resultLat, lng: resultLng};
      resultMarker[i] = new google.maps.Marker({
        position: resultLatLng,
        title: searchResults[i].name + ' - ' + searchResults[i].rating + ' stars'
      });
      resultMarker[i].setMap(map);
      bound.extend(resultMarker[i].getPosition());

      var searchResultRow = document.createElement('div');
      searchResultRow.className = 'row';
      holderEl.appendChild(searchResultRow);
      var searchResultContent = document.createElement('div');
      searchResultContent.className = 'col-xs-12 col-sm-offset-1 col-sm-10 col-md-offset-2 col-md-8 searchResult darkredBackground';
      searchResultRow.appendChild(searchResultContent);
      var searchResultContentRow = document.createElement('div');
      searchResultContent.appendChild(searchResultContentRow);
      searchResultContentRow.className = 'row';
      var searchResultLeft = document.createElement('div');
      var searchResultRight = document.createElement('div');
      searchResultLeft.className = 'col-xs-offset-1 col-xs-11 col-sm-offset-0 col-sm-7 col-md-7';
      searchResultRight.className = 'col-xs-offset-1 col-xs-11 col-sm-offset-0 col-sm-5 col-md-5 searchResultRight';
      searchResultContentRow.appendChild(searchResultLeft);
      searchResultContentRow.appendChild(searchResultRight);
      nameEl[i] = document.createElement('a');
      nameEl[i].className = 'brightred resultName';
      var nameText = document.createTextNode(searchResults[i].name);
      nameEl[i].appendChild(nameText);
      searchResultLeft.appendChild(nameEl[i]);
      searchResultLeft.appendChild(new AddRating(searchResults[i]));
      var displayAddress = searchResults[i].location.display_address;
      addressEl[i] = document.createElement('p');
      addressEl[i].className = 'addressText redgrey';
      for (var k = 0; k < displayAddress.length; k++) {
        if (k !== 0) {
          var br = document.createElement('br');
          addressEl[i].appendChild(br);
        };
        var newline = document.createTextNode(displayAddress[k]);
        addressEl[i].appendChild(newline);
      };
      searchResultRight.appendChild(addressEl[i]);

      //Adds Waypoint to map
      nameEl[i].addEventListener('click',function() {
        waypoint[0] = {location: resultLatLng};
        initMap();
      },false);
      resultMarker[i].addListener('click',function() {
        waypoint[0] = {location: resultLatLng};
        initMap();
      },false);
    }());
  };
  map.fitBounds(bound);
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
  var star1 = document.createElement('i');
  var star2 = document.createElement('i');
  var star3 = document.createElement('i');
  var star4 = document.createElement('i');
  var star5 = document.createElement('i');
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
  var reviewCount = document.createElement('p');
  reviewCount.appendChild(document.createTextNode(' ' + business.review_count + ' reviews'));
  reviewCount.className = 'reviewText redgrey';
  ratingsEl.appendChild(reviewCount);
  return ratingsEl;
}

function searchRequested(e) {
  e.preventDefault();
  runSearch();
}