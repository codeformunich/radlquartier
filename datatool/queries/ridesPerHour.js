
// ride count per week
cursor = db.rides.aggregate([
    { 
        $project: {
            bikeNumber: "$bikeNumber",
            year: { $year: "$start.date"},
            month: { $month: "$start.date" },
            day: { $dayOfMonth: "$start.date" },
            hour: { $hour: "$start.date" },
            week: { $isoWeek: "$start.date" },
            dayOfWeek: { $isoDayOfWeek: "$start.date" }
        } 
    },
    { 
        $group: { 
            _id: { 
                year: "$year", 
                month: "$month", 
                day: "$day", 
                hour: "$hour",
            }, 
            count: { $sum: 1 }
        } 
    },
    { 
        $sort : { "_id.year": 1, "_id.month": 1, "_id.day": 1, "_id.hour": 1 } 
    }
]);
printjson(cursor.toArray());