var express = require('express');
var yelpRouter = express.Router();
var yelp = require('yelp-fusion');
var parser = require('body-parser');
yelpRouter.use(parser.text());


var apiKey = "YOUR_API_KEY_HERE";

var client = yelp.client(apiKey);

yelpRouter.post('/search', function(req,res){
  var responseBody = JSON.parse(req.body);
  var responses = 0;
  var businesses = [];
  var searchResults = [];
  var allResults = [];
  var uniqueResults = [];
  var allUrls = [];
  var uniqueUrls = [];

  //Requests search results from yelp
  function mySearch(m) {
    var query = {
      term: responseBody[m].searchTerm,
      latitude: responseBody[m].lat,
      longitude: responseBody[m].lng
    };

    setTimeout(function(){
      client.search(query)
      .then(function (data) {
        businesses = data.jsonBody.businesses;
        if(responseBody.length > 3) {
          businesses = businesses.slice(0, 5);
        }
        searchResults[m] = businesses;
        responses++;
        //Runs once all search results have been received from yelp
        if(responses===responseBody.length) {
          var currentBusinesses = [];
          for (var k = 0; k < searchResults.length; k++) {
            currentBusinesses = searchResults[k];
            for (var d = 0; d < currentBusinesses.length; d++) {
              allResults.push(currentBusinesses[d]);
              allUrls.push(currentBusinesses[d].url);
            };
          };
          //Removes Duplicated Search Results
          uniqueUrls = allUrls.filter(function(elem, pos) {
            return allUrls.indexOf(elem) == pos;
          });
          for (var q = 0; q < uniqueUrls.length; q++) {
            for (var w = 0; w < allResults.length; w++) {
              if (uniqueUrls[q] == allResults[w].url) {
                uniqueResults[q] = allResults[w];
              };
            };
          };
          JSON.stringify(uniqueResults);
          res.send(uniqueResults);
        }
      })
      .catch(function (err) {
        console.log('yelp error: ' + err);
      });
    }, m*200);
  }

  //Loops through all search latLng
  for (var i = 0; i < responseBody.length; i++) {
    mySearch(i);
  };
});

module.exports = yelpRouter;
