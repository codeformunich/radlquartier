
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