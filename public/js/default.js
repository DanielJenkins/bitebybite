function init() {
  var originElement = document.getElementById('origin');
  var destinationElement = document.getElementById('destination');
  var originAutocomplete = new google.maps.places.Autocomplete(originElement);
  var destinationAutocomplete = new google.maps.places.Autocomplete(destinationElement);
}

google.maps.event.addDomListener(window, 'load', init);

var categoryElement = document.getElementById('category');

var search = document.getElementById('search');
search.addEventListener('click',runSearch,false);

function runSearch() {
  var origin = originAutocomplete.getPlace();
  var destination = destinationAutocomplete.getPlace();
}
