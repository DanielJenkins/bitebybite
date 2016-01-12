# bitebybite

## It's a search tool for people who want to stop for food along a specified route

**Built Upon the Following Technologies:**
- Node
- Express
- Jade
- Google Maps JavaScript API
- Google Places API (JavaScript Library)
- Node-Yelp API

### To Run an Instance of this app, you need:

**1. Google Maps API Key**
- `index.jade` (or `index.html` if you are skipping jade conversion) holds your Google Maps API Key.
- You can get Google Maps API Keys by clicking `Get a Key` at:
  [https://developers.google.com/maps/documentation/javascript/](https://developers.google.com/maps/documentation/javascript/)

```
script(type="text/javascript" src="https://maps.googleapis.com/maps/api/js?key=YOUR-GOOGLE-MAPS-API-KEY-HERE&libraries=places,geometry")
```

**2. Yelp API Key**
- `yelp.js` holds your Yelp API Keys.
- You can get Yelp API Keys at:
  [https://www.yelp.com/login?return_url=/developers/manage_api_keys](https://www.yelp.com/login?return_url=/developers/manage_api_keys)
```
var client = yelp.createClient({ /n
  oauth: {
    "consumer_key": "YOUR-CONSUMER_KEY-HERE",
    "consumer_secret": "YOUR-CONSUMER_SECRET-HERE",
    "token": "YOUR-TOKEN-HERE",
    "token_secret": "YOUR-TOKEN_SECRET-HERE"
  },
  httpClient: {
    maxSockets: 25  // ~> Default is 10 
  }
});
```

**3. Install Dependencies**
- In your terminal window, run `npm install` to install dependencies

**4. Start Server**
- Run `node app.js` to start!

**5. Using the App**
- Navigate to `http://localhost:1337` in your web browser
- Enter an origin and destination, selecting options from the dropdown list
- Enter a type of food, business, or other yelp search term
- Click the `Search Along Your Route Button`
- View your results
- View a selection as a waypoint in your route by clicking on the result title or marker

![bitebybite Search Results](https://github.com/DanielJenkins/bitebybite/blob/master/mockups/screenshot.png)
