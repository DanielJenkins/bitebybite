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

  var allResults = [];
  for (var i = 0; i < responseBody.length; i++) {
    console.log(i + 'th iteration');
    
    var businesses = [];
    var latLng = responseBody[i].lat + ", " + responseBody[i].lng;

    client.search({term: responseBody[i].searchTerm,ll: latLng})
    .then(function (data) {
      console.log('DATA FROM YELP FOR ' + i);
      businesses = data.businesses;
      for (var j = 0; j < businesses.length; j++) {
        console.log('business: ' + businesses[j].name);
      };
    })
    .catch(function (err) {
      console.log('yelp error: ' + err);
    });

    /* Add this back in once the previous part is working
    for (var j = 0; j < businesses.length; j++) {
      allResults.push(businesses[j]);
      console.log('Results: ' + i + ": " + businesses[j].name);
    };
    */
  };

  JSON.stringify(allResults);
  res.send('hello');
});

module.exports = yelpRouter;