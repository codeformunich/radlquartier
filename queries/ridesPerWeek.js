
// ride count per week
cursor = db.rides.aggregate([
    { 
        $project: {
            bikeNumber: "$bikeNumber",
            year : { $year:"$start.date"},
            week : { $week: '$start.date' }
        } 
    },
    { 
        $group: { 
            _id: { year: "$year", week: "$week"}, 
            count: { $sum: 1 }
        } 
    },
    { 
        $sort : { "_id.year": 1, "_id.week": 1 } 
    }
]);
printjson(cursor.toArray());