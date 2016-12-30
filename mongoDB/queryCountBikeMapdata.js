
// all locations for a bike, here 97252

cursor = db.mapdatasets.aggregate( [
        { $group: { _id: { bike: "$bike" }, count: { $sum: 1 } } },
        { $sort : { count : -1 } }
    ] );
printjson( cursor.toArray() );