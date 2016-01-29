var express = require('express');
var yelpRouter = express.Router();
var yelp = require("node-yelp");
var parser = require('body-parser');
yelpRouter.use(parser.text());

var client = yelp.createClient({
  oauth: {
    "consumer_key": "AP6CYcgjBZCKzR7mDQFLrQ",
    "consumer_secret": "xw0F4fOitGKou8B7I0Gpt0QrxqI",
    "token": "nE_7HBSXTLpCXKs7wJaw1ILIAkvggifU",
    "token_secret": "3iyos4ZDtU3F2O1YssxAUCRAvi8"
  },
  httpClient: {
    maxSockets: 25  // ~> Default is 10 
  }
});

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
    client.search({term: responseBody[m].searchTerm,ll: latLng})
    .then(function (data) {
      businesses = data.businesses;
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
  }

  //Loops through all search latLng
  for (var i = 0; i < responseBody.length; i++) {
    var latLng = responseBody[i].lat + ", " + responseBody[i].lng;
    mySearch(i);
  };
});

module.exports = yelpRouter;