//bike nur, geo, data date and time sorted by bikes and date and time

cursor = db.features.find().sort({
    "properties.name": 1,
    "properties.date": 1
});

printjson( cursor.toArray() );