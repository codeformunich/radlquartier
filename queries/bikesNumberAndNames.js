
// all bikes by name
cursor = db.nextbike.aggregate( [
        { $match: { bike: 1 } },
        { $group: { _id: { bike_numbers: "$bike_numbers" }, name: { $addToSet: "$name" } } },
        { $sort : { "_id.bike_numbers": 1 } }
    ] );
printjson( cursor.toArray() );