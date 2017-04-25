
// all stations by name
cursor = db.nextbike.aggregate( [
    { $match: { spot: 1 } },
    { $group: { _id: { uid: "$uid" }, name: { $addToSet: "$name" } } },
    { $sort : { name : 1 } }
] );
printjson(cursor.toArray());