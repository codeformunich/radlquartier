
// distinct list of bikes
db.bikeLocationJuli.distinct( "bike" )

// distinct count of bikes
db.bikeLocationJuli.distinct( "bike" ).length

// distinct list of stations
db.bikeLocationJuli.distinct( "stationName" )

// distinct count of stations
db.bikeLocationJuli.distinct( "stationName" ).length

// distinct list of stations all stations
db.placesjuli.distinct( "name", { "spot": 1 } )

// distinct list of stations with amount of rides to them
db.bikeLocationFebruar.aggregate( [
    { $group: { _id: { stationName: "$stationName"}, count: { $sum: 1 } } }
] )

// use printjson for cmd calls
printjson( db.bikeLocationJuli.distinct( "stationName" ) );


// all features with teh name "Amalienburgstraße"
cursor = db.features.find( { "properties.name": "Amalienburgstraße" } );
printjson( cursor.toArray() );



// // all features where bike_numbers is or contains 96570
cursor = db.features.find( { 
         "properties.date": { "$gt": new Date("2016-06-22T00:00:00") },
         "properties.date": { "$lt": new Date("2016-06-23T00:00:00") },
         "properties.bike_numbers": 96570 
    }//, { 
    //     type: 1, geometry: 1, "properties.name": 1, _id: 0
    //} 
);
printjson( cursor.toArray() );


// all features where bike_numbers is or contains 96570
cursor = db.features.find( { 
         "properties.date": { "$gt": new Date("2016-08-01T00:00:00") },
         "properties.date": { "$lt": new Date("2016-08-31T00:00:00") },
         "properties.bike_numbers": 96111,
         "properties.spot": 1
    }, { 
         type: 1, geometry: 1, "properties.name": 1, "properties.bike_numbers": 1, _id: 0
    } 
);
printjson( cursor.toArray() );


// // all stations
cursor = db.features.find( { 
        "properties.date": { "$eq": new Date("2016-06-22T06:00:00") },
        "properties.spot": 1
    }, { 
        type: 1, geometry: 1, "properties.name": 1, _id: 0
    }
);
printjson( cursor.toArray() );



// // all distinct names
 // printjson( db.features.distinct( "properties.name" ) );



// all stations
// printjson( db.features.distinct( "properties.name", { "properties.spot": 1 } )); //.sort( { user_id: -1 } ) );


// printjson( db.features.aggregate([
//     { $project: { properties.name: "$_id", _id: 0}},
//     { $sort: { properties.name: 1 } }
// ]));

// printjson(
// 	db.features.aggregate([
// 	    {$unwind: "$properties" },
// 	    { $project : { "$properties.name":{$toUpper:"$_id"} , _id:0 } },
// 	    { $sort: { "$properties.name": 1 } }
// 	 ])
// );

// printjson(
// 	db.features.aggregate(
// 		[ 
// 		    { "$project" : { "name" : "$properties.name" , "_id" : "$_id"}},
// 		    { "$unwind" : "$properties"},
// 		    { "$sort" : { "$properties.name": 1 } },
// 		    { "$project" : { "_id" : 0 , "texts" : 1}} 
// 		]
// 	)
// );

printjson(
	db.places.aggregate( [
	   	{ $match: { bike_numbers: 97252 } },
	   	{ $group: { _id: { bike_numbers: "$bike_numbers", lat: "$lat", lng: "$lng" }, count: { $sum: 1 } } }
	] )
);

printjson(
    db.nextbike.aggregate( [
        { $match: { bike: 1 } } 
    ] )
);

printjson(
    db.nextbike.aggregate( [
        { $match: { bike: 1 } },
        { $group: {
            _id: "$bike_numbers",
            firstAppearanceDate: { $min: "$date" },
            lastAppearanceDate: { $max: "$date" }
        } } 
    ] )
);

printjson(
    db.nextbike.aggregate( [
        { $group: {
            _id: "$bike_numbers",
            firstAppearanceDate: { $min: "$date" },
            lastAppearanceDate: { $max: "$date" }
        } } 
    ] )
);

db.nextbike.find( { "name": "Leopoldstr. vor der Mensa"} );

printjson(
    db.nextbike.aggregate( [
        { $match: { number: null, spot: 1} },
        { $group: { _id: "$name" } } 
    ] )
);

printjson(
    db.nextbike.aggregate( [
        { $match: { bike_racks: null, spot: 1} },
        { $group: { _id: "$name" } } 
    ] )
);

printjson(
    db.nextbike.aggregate( [
        { $match: { bike_numbers: null, bike: 1} },
        { $group: { _id: "$name" } } 
    ] )
);

printjson(
    db.nextbike.find({ bike_numbers: null, bike: 1})
);



// all locations for a bike, here 97252
cursor = db.places.aggregate( [
    { $match: { bike_numbers: 97252 } },
    { $group: { _id: { bike_numbers: "$bike_numbers", lat: "$lat", lng: "$lng" }, count: { $sum: 1 } } }
] );
printjson( cursor.toArray() );


// // // all bikes by name
// printjson( db.features.distinct( "properties.name", { "properties.bike": 1 } ) );



// all bikes by bike_numbers
printjson( db.features.distinct( "properties.bike_numbers", { "properties.bike": 1 } ) );


//bike nur, geo, data date and time sorted by bikes and date and time
cursor = db.features.find().sort({
    "properties.name": 1,
    "properties.date": 1
});
printjson( cursor.toArray() );


// all locations for a bike, here 97252
cursor = db.mapdatasets.aggregate( [
        { $group: { _id: { bike: "$bike" }, count: { $sum: 1 } } },
        { $sort : { count : -1 } }
    ] );
printjson( cursor.toArray() );

// while ( cursor.hasNext() ) {
//    printjson( cursor.next() );
// }
