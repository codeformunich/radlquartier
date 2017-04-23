
// all bikes by name

// printjson( db.places.distinct( "name", { "bike": 1 } ) );

cursor = db.nextbike.aggregate( [
        { $match: { bike: 1 } },
        { $group: { _id: { bike_numbers: "$bike_numbers" }, name: { $addToSet: "$name" } } }
    ] );
printjson( cursor.toArray() );