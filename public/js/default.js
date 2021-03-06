var backBtnEl = document.getElementById('backBtnEl');
var destinationElement = document.getElementById('destination');
var detailsHolder = document.getElementById('detailsHolder');
var holderEl = document.getElementById('holderEl');
var loadingEl = document.getElementById('loadingEl');
var originElement = document.getElementById('origin');
var search = document.getElementById('search');
var searchResultsEl = document.getElementById('searchResults');
var searchTermEl = document.getElementById('category');
var destination;
var destinationAutocomplete;
var destinationLatLng;
var detailsMap;
var map;
var origin;
var originAutocomplete;
var originLatLng;
var searchTerm;
var waypoint = [];

search.addEventListener('click',searchRequested,false);
backBtnEl.addEventListener('click',function() {changeView('results');},false);
google.maps.event.addDomListener(window, 'load', init);

//Initializes Google Places Autocomplete feature
function init() {
  originAutocomplete = new google.maps.places.Autocomplete(originElement);
  destinationAutocomplete = new google.maps.places.Autocomplete(destinationElement);
  google.maps.event.addDomListener(originElement, 'keydown', function(e) {
    if (e.keyCode == 13) {
      e.preventDefault();
    }
  });
  google.maps.event.addDomListener(destinationElement, 'keydown', function(e) {
    if (e.keyCode == 13) {
      e.preventDefault();
    }
  });
}

//Runs when a search is requested
function runSearch() {
  //Get origin and destination lat&lng
  searchTerm = JSON.stringify(searchTermEl.value);
  origin = originAutocomplete.getPlace();
  var originLat = origin.geometry.location.lat();
  var originLng = origin.geometry.location.lng();
  originLatLng = new google.maps.LatLng({lat: originLat, lng: originLng});
  destination = destinationAutocomplete.getPlace();
  var destinationLat = destination.geometry.location.lat();
  var destinationLng = destination.geometry.location.lng();
  destinationLatLng = new google.maps.LatLng({lat: destinationLat, lng: destinationLng});
  //Generate map and get step coordinates
  createMapEl();
}

//Generate Map El
function createMapEl() {
  changeView('loading');
  while (holderEl.firstChild) {
    holderEl.removeChild(holderEl.firstChild);
  }
  waypoint = [];
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

//Generate Results Map
function initMap() {
  var directionsService = new google.maps.DirectionsService;
  var directionsDisplay = new google.maps.DirectionsRenderer;
  map = new google.maps.Map(document.getElementById('resultMap'), {
    zoom: 8,
    scrollwheel: false,
    center: {lat: 33.6694600, lng: -117.8231100}
  });
  directionsDisplay.setMap(map);
  calculateAndDisplayRoute(directionsService, directionsDisplay);
}

//Generate Directions and Get Step Coordinates
function calculateAndDisplayRoute(directionsService, directionsDisplay) {
  directionsService.route({
    origin: originLatLng,
    waypoints: waypoint,
    destination: destinationLatLng,
    travelMode: google.maps.TravelMode.DRIVING
  }, function(response, status) {
    if (status === google.maps.DirectionsStatus.OK) {
      directionsDisplay.setDirections(response);
      var searchPlaces = [];
      getSearchPlaces(response,searchPlaces);

      //Send Request to Yelp
      var jsonSearchPlaces = JSON.stringify(searchPlaces);
      var xhr = new XMLHttpRequest();
      xhr.open('POST','/yelp/search',true);
      xhr.send(jsonSearchPlaces);
      //Get Results from Yelp
      xhr.onload = function() {
        if (xhr.status == 200) {
          var yelpResults = JSON.parse(xhr.responseText);
          changeView('results');
          google.maps.event.trigger(map, 'resize');
          addResultsToPage(yelpResults,origin,destination);
        }
        else {
          changeView('results');
          google.maps.event.trigger(map, 'resize');
          console.log('error: ' + err);
        }
      }
    }
    else {
      window.alert('Directions request failed due to ' + status);
    }
  });
}

//Determines which locations yelp searches will be run on
function getSearchPlaces(response,searchPlaces) {
  var navSteps = [];
  var theRoute = response.routes[0].legs[0];
  for (var s = 0; s < theRoute.steps.length; s++) {
    navSteps[s] = (theRoute.steps[s].start_location);
  }

  /*This segment may be used in place of the segment marked below
  //-------------------Start Segment
  //This block runs searches along a straight line between the origin and destination
  var numSearches = 4; //Starts at 0
  var LatLngObj;
  searchPlaces[0] = originLatLng;
  for (var i = 0; i <= numSearches; i++) {
    LatLngObj = google.maps.geometry.spherical.interpolate(originLatLng, destinationLatLng, (i/numSearches));
    searchPlaces[i] = {searchTerm: searchTerm, lat: LatLngObj.lat(), lng: LatLngObj.lng()};
  };
  //--------------End Segment
  */

  //-------------------Start Segment
  //This block runs searches at steps along a navigation route and various midpoints between them.
  var allNavSteps = [];
  allNavSteps[0] = originLatLng;
  for (var i = 0; i < navSteps.length; i++) {
    allNavSteps.push(navSteps[i]);
  };
  allNavSteps.push(destinationLatLng);
  for (var i = 0; i < allNavSteps.length; i++) {
    if (searchPlaces.length==0) {
      searchPlaces.push({searchTerm: searchTerm, lat: allNavSteps[i].lat(), lng: allNavSteps[i].lng(), source: 'steps'});
    }
    var previousSearch = new google.maps.LatLng(searchPlaces[searchPlaces.length-1].lat, searchPlaces[searchPlaces.length-1].lng);
    if((google.maps.geometry.spherical.computeDistanceBetween(previousSearch,allNavSteps[i]))>4828.03) {
      searchPlaces.push({searchTerm: searchTerm, lat: allNavSteps[i].lat(), lng: allNavSteps[i].lng(), source: i + 'steps'});
    }
    if(i < allNavSteps.length-1) {
      var distance = google.maps.geometry.spherical.computeDistanceBetween(allNavSteps[i],allNavSteps[i+1]);
      if (distance > 16093.4) {
        var numSearches = (distance-(distance%4828.03))/4828.03;
        for (var k = 0; k < numSearches; k++) {
          var LatLngObj = google.maps.geometry.spherical.interpolate(allNavSteps[i], allNavSteps[i+1], (k/numSearches));
          searchPlaces.push({searchTerm: searchTerm, lat: LatLngObj.lat(), lng: LatLngObj.lng(), source: i + ' calculation'});
        };
      };
    }
  };
  //--------------End Segment
};

//Adds Yelp Results as a list and as markers on the map
function addResultsToPage(searchResults,origin,destination) {
  var bound = new google.maps.LatLngBounds();
  var resultMarker = [];
  var addressEl = [];
  var nameEl = [];
  for (var i = 0; i < searchResults.length; i++) {
    (function () {
      //Adding Markers to Map
      var currentResult = searchResults[i];
      var resultLat = searchResults[i].coordinates.latitude;
      var resultLng = searchResults[i].coordinates.longitude;
      var resultLatLng = {lat: resultLat, lng: resultLng};
      resultMarker[i] = new google.maps.Marker({
        position: resultLatLng,
        title: searchResults[i].name + ' - ' + searchResults[i].rating + ' stars'
      });
      resultMarker[i].setMap(map);
      bound.extend(resultMarker[i].getPosition());

      //Adding Results to List
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
      nameEl[i].href = "#backBtnEl";
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
      var mySelection = [];
      nameEl[i].addEventListener('click',function() {
        waypoint[0] = {location: resultLatLng};
        mySelection = currentResult;
        loadDetails(mySelection);
      },false);
      resultMarker[i].addListener('click',function() {
        waypoint[0] = {location: resultLatLng};
        mySelection = currentResult;
        loadDetails(mySelection);
      },false);
    }());
  };
  map.fitBounds(bound);
}

function loadDetails(selection) {
  //Generate Map with Waypoint
  while (detailsHolder.firstChild) {
    detailsHolder.removeChild(detailsHolder.firstChild);
  }
  var detailsMapRow = document.createElement('div');
  detailsMapRow.className = 'row';
  detailsMapRow.id = 'detailsMapRow';
  detailsHolder.appendChild(detailsMapRow);
  var detailsMapEl = document.createElement('div');
  detailsMapEl.className = 'col-xs-12 col-sm-offset-1 col-sm-10 col-md-offset-2 col-md-8';
  detailsMapEl.id = 'detailsMap';
  detailsMapRow.appendChild(detailsMapEl);

  //Generate Selection Details
  var selctionRow = document.createElement('div');
  selctionRow.className = 'row';
  detailsHolder.appendChild(selctionRow);
  var selectionEl = document.createElement('div');
  selectionEl.className = 'col-xs-12 col-sm-offset-1 col-sm-10 col-md-offset-2 col-md-8 darkredBackground';
  selectionEl.id = 'selectionEl';
  selctionRow.appendChild(selectionEl);
  //Selection Name
  var selectionNameEl = document.createElement('h2');
  selectionNameEl.className = 'brightred selectionName';
  var selectionName = document.createTextNode(selection.name);
  selectionNameEl.appendChild(selectionName);
  //SelectionRating
  var selectionRatingEl = new AddRating(selection);
  //URL
  var selectionUrlEl = document.createElement('a');
  selectionUrlEl.href = selection.url;
  selectionUrlEl.target = '_blank';
  var selectionUrl = document.createTextNode('View this Result on Yelp');
  selectionUrlEl.appendChild(selectionUrl);
  //SelectionAddress
  var selectionAddress = selection.location.display_address;
  var selectionAddressEl = document.createElement('p');
  selectionAddressEl.className = 'addressText redgrey';
  for (var k = 0; k < selectionAddress.length; k++) {
    if (k !== 0) {
      var selectionBr = document.createElement('br');
      selectionAddressEl.appendChild(selectionBr);
    };
    var selectionNewline = document.createTextNode(selectionAddress[k]);
    selectionAddressEl.appendChild(selectionNewline);
  };
  var selectionLeft = document.createElement('div');
  var selectionRight = document.createElement('div');
  selectionLeft.className = 'col-xs-offset-1 col-xs-11 col-sm-offset-0 col-sm-7 col-md-7';
  selectionRight.className = 'col-xs-offset-1 col-xs-11 col-sm-offset-0 col-sm-5 col-md-5 selectionRight';
  selectionEl.appendChild(selectionLeft);
  selectionEl.appendChild(selectionRight);
  selectionLeft.appendChild(selectionNameEl);
  selectionLeft.appendChild(selectionRatingEl);
  selectionLeft.appendChild(selectionUrlEl);
  selectionRight.appendChild(selectionAddressEl);

  //Generate Navigation Instructions
  var instructionsRow = document.createElement('div');
  instructionsRow.className = 'row';
  detailsHolder.appendChild(instructionsRow);
  var instructionsEl = document.createElement('div');
  instructionsEl.className = 'col-xs-12 col-sm-offset-1 col-sm-10 col-md-offset-2 col-md-8';
  instructionsEl.id = 'instructions';
  instructionsRow.appendChild(instructionsEl);
  changeView('details');
  initDetailsMap();
}

//Generate Results Map
function initDetailsMap() {
  var detailsDirectionsService = new google.maps.DirectionsService;
  var detailsDirectionsDisplay = new google.maps.DirectionsRenderer;
  detailsMap = new google.maps.Map(document.getElementById('detailsMap'), {
    zoom: 8,
    scrollwheel: false,
    center: {lat: 33.6694600, lng: -117.8231100}
  });
  detailsDirectionsDisplay.setMap(detailsMap);
  detailsDirectionsDisplay.setPanel(document.getElementById('instructions'));
  routeDetails(detailsDirectionsService,detailsDirectionsDisplay);
}

function routeDetails(directionsService, directionsDisplay) {
  var request = {
    origin: originLatLng,
    waypoints: waypoint,
    destination: destinationLatLng,
    travelMode: google.maps.TravelMode.DRIVING
  };
  directionsService.route(request, function(response, status) {
    if (status === google.maps.DirectionsStatus.OK) {
      directionsDisplay.setDirections(response);
      var theRoute = response.routes[0].legs[0];
    }
    else {
      window.alert('Directions request failed due to ' + status);
    }
  });
}

function AddRating(business) {
  ratingsEl = document.createElement('div');
  var rating;
  switch(business.rating) {
    case 1:
      rating = '1';
      break;
    case 1.5:
      rating = '1-half';
      break;
    case 2:
      rating = '2';
      break;
    case 2.5:
      rating = '2-half';
      break;
    case 3:
      rating = '3';
      break;
    case 3.5:
      rating = '3-half';
      break;
    case 4:
      rating = '4';
      break;
    case 4.5:
      rating = '4-half';
      break;
    case 5:
      rating = '5';
      break;
    default:
      rating = null;
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

function changeView(page) {
  if (page == 'details') {
    loadingEl.style.display = 'none';
    holderEl.style.display = 'none';
    backBtnEl.style.display = 'block';
    detailsHolder.style.display = 'block';
  }
  else if (page == 'results') {
    loadingEl.style.display = 'none';
    holderEl.style.display = 'block';
    backBtnEl.style.display = 'none';
    detailsHolder.style.display = 'none';
  }
  else if (page == 'loading') {
    loadingEl.style.display = 'block';
    holderEl.style.display = 'none';
    backBtnEl.style.display = 'none';
    detailsHolder.style.display = 'none';
  };
}
