
// ride count per week
cursor = db.rides.aggregate([
    { 
        $project: {
            bikeNumber: "$bikeNumber",
            year: { $year: "$start.date"},
            month: { $month: "$start.date" },
            day: { $dayOfMonth: "$start.date" },
            // dayOfYear: { $dayOfYear: "$start.date" },
            dayOfWeek: { $dayOfWeek: "$start.date" },
            week: { $week: "$start.date" }
        } 
    },
    { 
        $group: { 
            _id: { 
                week: "$week",
                year: "$year", 
                month: "$month", 
                day: "$day", 
                // dayOfYear: "$dayOfYear",
                dayOfWeek: "$dayOfWeek" 
            }, 
            count: { $sum: 1 }
        } 
    },
    { 
        $sort : { "_id.year": 1, "_id.month": 1, "_id.day": 1 } 
    }
]);
printjson(cursor.toArray());