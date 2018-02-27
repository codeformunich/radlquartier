#! /bin/zsh

echo "creating halts from networkstate-mvgrad files"
node ./../../datatool/mvgstate/mvgstate.js halt ./input

echo "creating stations from networkstate-mvgrad files"
node ./../../datatool/mvgstate/mvgstate.js station ./input

echo "creating geojson points from halts"
node ./../../datatool/preprocess/preprocess.js stationtopoint < ./output/mvgStation.json


# node ./../../datatool/mvgstate/mvgstate.js station ./input/2017/03
# node ./../../datatool/mvgstate/mvgstate.js halt ./input/2017/04
