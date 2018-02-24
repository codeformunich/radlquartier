# MVG-Bike-Data

Command-line tools to parse scraped data from bike sharing operators and transform them into a standardized format. 

## Tools

### mvgstate
Parses MVG Bike data

```
$ node ./mvgstate halt < "file"
```


 
## Data format

### halt

```javascript
{
  "id": "f7d1c4b7-627c-45b4-b78b-ff75755c57a0",
  "bikeNumber": 96204,
  "loc": {
    "type": "Point",
     "coordinates": [
        11.576512336730957,
        48.12044143676758
      ]
    },
    "startDate": "2017-03-15T23:00:04.000Z",
    "endDate": "2017-03-15T23:09:29.000Z",
    "additionalData": {
      "operator"; 
      "count": 3,
      "dates": [
        "2017-03-15T23:00:04.000Z",
        "2017-03-15T23:05:21.000Z",
        "2017-03-15T23:09:29.000Z"
      ],
      "stationId": "6e597af21fd05db44602bd8f25ee691d"
      "stationName": "Laimerplatz"
    }
  }
```