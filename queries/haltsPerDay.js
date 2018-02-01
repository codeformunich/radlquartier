
// ride count per week
cursor = db.halts.aggregate([
    {
        $project: {
            bikeNumber: "$bikeNumber",
            year: { $year: "$startDate"},
            month: { $month: "$startDate" },
            day: { $dayOfMonth: "$startDate" },
            hour: { $hour: "$startDate" },
            week: { $isoWeek: "$startDate" },
            dayOfWeek: { $isoDayOfWeek: "$startDate" }
        }
    },
    {
        $group: {
            _id: {
                year: "$year",
                month: "$month",
                day: "$day",
                week: "$week",
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