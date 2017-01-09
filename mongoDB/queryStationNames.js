
// all bikes by name

// printjson( db.places.distinct( "name", { "bike": 1 } ) );

cursor = db.places.aggregate( [
        { $match: { spot: 1 } },
        { $group: { _id: { uid: "$uid" }, name: { $addToSet: "$name" } } },
        { $sort : { name : 1 } }
    ] );
printjson( cursor.toArray() );