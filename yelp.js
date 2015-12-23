var express = require('express');
var yelpRouter = express.Router();
var yelp = require("node-yelp");
var parser = require('body-parser');
yelpRouter.use(parser.text());

var client = yelp.createClient({
  oauth: {
    "consumer_key": "AP6CYcgjBZCKzR7mDQFLrQ",
    "consumer_secret": "xw0F4fOitGKou8B7I0Gpt0QrxqI",
    "token": "DCF4uG8gxdBMAfOMw4mWTZHWciMQcph7",
    "token_secret": "czysvKMSpgOoVFidLy3eRf-uDl0"
  },
  httpClient: {
    maxSockets: 25  // ~> Default is 10 
  }
});

yelpRouter.post('/search', function(req,res){
  responseBody = JSON.parse(req.body);

  var responses = 0;
  var businesses = [];
  var searchResults = [];
  var allResults = [];

  //Requests search results from yelp
  function mySearch(m) {
    client.search({term: responseBody[m].searchTerm,ll: latLng})
    .then(function (data) {
      businesses = data.businesses;
      searchResults[m] = businesses;
      console.log('Yelp results returned for ' + m + 'th search at ' + latLng);

      responses++;
      //Runs once all search results have been received from yelp
      if(responses===responseBody.length) {
        for (var k = 0; k < searchResults.length; k++) {
          var currentBusinesses = searchResults[k];
          for (var d = 0; d < currentBusinesses.length; d++) {
            allResults.push(currentBusinesses[d]);
          };
        };

        //Removes Duplicated Search Results
        console.log('Results with duplicates: ' + allResults.length);
        uniqueResults = allResults.filter(function(elem, pos) {
          return allResults.indexOf(elem) == pos;
        })
        console.log('Results with duplicates removed: ' + uniqueResults.length);
        console.log('Exporting yelp search results to default.js');
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