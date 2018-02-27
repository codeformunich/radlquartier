Command-line tools to parse scraped data from bike sharing operators and transform them into a standardized format.

## Tools

### mvgstate

Parses MVG-Bike data in the mvg-networkstate-mvgrad format

```
$ node ./mvgstate halt [directory]
```
Creates mvgStateHalts.json and mvgStateTemp.json.

```
$ node ./mvgstate station [directory]
```
Creates mvgStation.json.

## Data format

### halt

```javascript
{
  "id": "0a86f36e-8751-4697-854d-df4d63c07066",
  "bikeNumber": 96117,
  "loc": {
    "type": "Point",
    "coordinates": [
      11.586536407470703,
      48.16273498535156
    ]
  },
  "startDate": "2017-03-15T23:00:04.000Z",
  "endDate": "2017-03-15T23:09:29.000Z",
  "additionalData": {
    "provider": "MVG_RAD",
    "count": 3,
    "stationId": "e0abd646437e48f5fab78f18dffa073e",
    "district": "Schwabing-Freimann"
  }
}
```

### station

```javascript
{
  "id": "a4ea1ff1-e6a6-4bc2-b996-27db8219923f",
  "stationId": "00e6825bb9f1782eb8b298c79011fde4",
  "loc": {
    "type": "Point",
    "coordinates": [
      11.546428680419922,
      48.10127258300781
    ]
  },
  "firstAppearanceDate": "2017-03-15T23:00:11.000Z",
  "lastAppearanceDate": "2017-03-15T23:09:36.000Z",
  "additionalData": {
    "provider": "MVG_RAD",
    "stationName": "Thalkirchen (Tierpark)",
    "district": "Thalkirchen-Obersendling-Forstenried-Fürstenried-Solln"
  }
}
```
