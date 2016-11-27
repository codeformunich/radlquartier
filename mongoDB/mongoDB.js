
// conn = new Mongo();
// db = conn.getDB("infovis");

// cursor = db.features.find( { "properties.name": "Amalienburgstraße" } );

cursor = db.features.find( { "properties.bike_numbers": "96486" } );

printjson( cursor.toArray() );

// while ( cursor.hasNext() ) {
//    printjson( cursor.next() );
// }
