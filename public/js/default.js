function init() {
  var originElement = getElementById('origin');
  var destinationElement = getElementById('destination');
  var originAutocomplete = new google.maps.places.Autocomplete(originElement);
  var destinationAutocomplete = new google.maps.places.Autocomplete(destinationElement);
}

google.maps.event.addDomListener(window, 'load', init);

var search getElementById('search');

