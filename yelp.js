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

  function mySearch(m) {
    client.search({term: responseBody[m].searchTerm,ll: latLng})
    .then(function (data) {
      businesses = data.businesses;
      searchResults[m] = businesses;

      responses++;
      if(responses===responseBody.length) {
        for (var k = 0; k < searchResults.length; k++) {
          var currentBusinesses = searchResults[k];
          for (var d = 0; d < currentBusinesses.length; d++) {
            allResults.push(currentBusinesses[d]);
          };
        };

        // for (var f = 0; f < allResults.length; f++) {
        //   console.log(allResults[f].name);
        // };

        JSON.stringify(allResults);
        res.send('hello');
      }
    })
    .catch(function (err) {
      console.log('yelp error: ' + err);
    });

  }


  for (var i = 0; i < responseBody.length; i++) {
    var latLng = responseBody[i].lat + ", " + responseBody[i].lng;
    mySearch(i);
    
  };
});

module.exports = yelpRouter;