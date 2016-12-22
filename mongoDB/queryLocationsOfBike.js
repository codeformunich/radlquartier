
// all locations for a bike, here 97252

cursor = db.places.aggregate( [
        { $match: { bike_numbers: 97252 } },
        { $group: { _id: { bike_numbers: "$bike_numbers", lat: "$lat", lng: "$lng" }, count: { $sum: 1 } } }
    ] );
printjson( cursor.toArray() );