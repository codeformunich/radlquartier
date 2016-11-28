
// conn = new Mongo();
// db = conn.getDB("infovis");


// cursor = db.features.find( { "properties.name": "Amalienburgstraße" } );

// all features where bike_numbers is or contains 96570
// cursor = db.features.find( { "properties.bike_numbers": 96570 }, { _id: 0 } );

// all stations
cursor = db.features.find( { 
        "properties.date": { "$eq": new Date("2016-06-22T06:00:00") },
        "properties.spot": 1
    }, { 
        type: 1, geometry: 1, "properties.name": 1, _id: 0
    }
);

printjson( cursor.toArray() );

// while ( cursor.hasNext() ) {
//    printjson( cursor.next() );
// }
