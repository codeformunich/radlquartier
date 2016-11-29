
// conn = new Mongo();
// db = conn.getDB("infovis");


// cursor = db.features.find( { "properties.name": "Amalienburgstraße" } );

// all features where bike_numbers is or contains 96570
cursor = db.features.find( { 
		"properties.date": { "$gt": new Date("2016-06-22T00:00:00") },
		"properties.date": { "$lt": new Date("2016-06-23T00:00:00") },
		"properties.bike_numbers": 96570 
	}, { 
         type: 1, geometry: 1, "properties.name": 1, _id: 0
    } 
);

// all stations
// cursor = db.features.find( { 
//         "properties.date": { "$eq": new Date("2016-06-22T06:00:00") },
//         "properties.spot": 1
//     }, { 
//         type: 1, geometry: 1, "properties.name": 1, _id: 0
//     }
// );
// all bike numbers
//cursor = db.features.distinct( "properties.bike_numbers", { "properties.bike": 1 } );
cursor = db.features.distinct( "properties.name", { properties: { bike: 1 }  } );

printjson( cursor.toArray() );

// while ( cursor.hasNext() ) {
//    printjson( cursor.next() );
// }
