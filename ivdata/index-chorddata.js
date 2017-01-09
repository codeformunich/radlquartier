"use strict";

process.stdin.resume();
process.stdin.setEncoding('utf8');

var mongodb = require('mongodb');
var assert = require('assert');
var MongoClient = mongodb.MongoClient;
var express = require('express');

var url = 'mongodb://localhost:27017/infovis';


MongoClient.connect(url, function (err, db) {
  if (err) {
    console.log('Unable to connect to the mongoDB server. Error:', err);
  } else {
    //HURRAY!! We are connected. :)
    console.log('Connection established to', url);

    //prüfe ob vorherige koordinate && bikenumber == folgender koordinaten und bikenummber
    // wenn ja lösche datensatz wenn nein prüfe ob was start und endkoordinaten sind
    //Fälle: frei frei , station frei (nicht stationspendler), station station, frei station (Stationspendler)
    //FAll eins speicher ab counter nicht pendler +1
    //Fall zwei counter pendler +1 + Linie zur station

    router.get('/get-dataForChord', function (req, res, next) {
        var resultArray = [];
        var Uni_Station = [8851, 8853, 8935, 8926, 8893];
        var counter8851 = 0;
        var counter8853 = 0;
        var counter8935 = 0;
        var counter8926 = 0;
        var counter8893 = 0;
        var counterSomething = 0;


        var BikeNum;
        var lat;
        var lng;
        var nextLat;
        var next Lgn;
        var nextBikeNum;

        var cursor = db.places.find().sort({
        "bike_numbers": 1,
        "date": 1

        });

        
           cursor.forEach(function(doc, err) {

            BikeNum = doc.bike_numbers;
            lat = doc.lat;
            lng = doc.lng;
            nextLat = doc.lat.next();
            nextLgn = doc.lng.next();
            nextBikeNum = doc.bike_numbers.next();
            //1 somewhere to somewhere,2 station to somewhere,3 somewhere  to station,4 station to station
            var flag;

            if (BikeNum === nextBikeNum && lat != nextLat && lng != next lng) {
                if (doc.spot = 1 && doc.spot.next()) {
                    flag = 1;

                } else if (cursor.name in)



            } else if (BikeNum === nextBikeNum && lat =! nextLat && lng === next lng) {

            } else if (BikeNum === nextBikeNum && lat === nextLat && lng =! next lng) {

            } else if (BikeNum === nextBikeNum && lat === nextLat && lng === next lng) {

            } else if (BikeNum === nextBikeNum && lat === nextLat && lng === next lng) {

            } else {

            }

            
            assert.(null, err);
            resultArray.push(doc);
        }, function() {

db.close();
res.render('index', {items: resultArray})
        });
    });

