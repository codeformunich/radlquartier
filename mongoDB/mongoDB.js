
// conn = new Mongo();
// db = conn.getDB("infovis");


// cursor = db.features.find( { "properties.name": "Amalienburgstraße" } );

// all features where bike_numbers is or contains 96570
// cursor = db.features.find( { "properties.bike_numbers": 96570 }, { _id: 0 } );

// all stations
cursor = db.features.find( { "properties.spot": 1, "properties.date" : "2016-06-20T22:00:00.000Z" }, { _id: 0 } );



printjson( cursor.toArray() );

// while ( cursor.hasNext() ) {
//    printjson( cursor.next() );
// }
