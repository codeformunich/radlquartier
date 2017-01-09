
// all bikes by name

// printjson( db.places.distinct( "name", { "bike": 1 } ) );

cursor = db.places.find({bike_numbers: 96300});
printjson( cursor.toArray() );