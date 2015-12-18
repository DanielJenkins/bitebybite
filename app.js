var express = require('express');
var app = express();
var path = require('path');
var yelpRouter = require('./yelp.js');

app.use(express.static('public'));

app.get('/', function(req, res) {
  res.sendFile(path.join(__dirname+'/index.html'));
});

app.use('/yelp',yelpRouter);

app.listen(1337);
console.log('Server is running');