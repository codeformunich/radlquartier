#! /bin/zsh

# echo "creating halts from networkstate-mvgrad files"
# node ./../../datatool/mvgstate/mvgstate.js halt ./input
# echo "creating stations from networkstate-mvgrad files"
# node ./../../datatool/mvgstate/mvgstate.js station ./input

# echo "creating geojson Points from halts"
# node ./../../datatool/preprocess/preprocess.js halttopoint < ./output/mvgStateHalts.json
# echo "creating geojson LineStrings from halts"
# node ./../../datatool/preprocess/preprocess.js halttoline < ./output/mvgStateHalts.json
# echo "creating geojson Points from stations"
# node ./../../datatool/preprocess/preprocess.js stationtopoint < ./output/mvgStation.json



# echo "creating halts from networkstate-mvgrad files"
# node ./../../datatool/mvgstate/mvgstate.js halt ./input/2017/04
# echo "creating stations from networkstate-mvgrad files"
# node ./../../datatool/mvgstate/mvgstate.js station ./input/2017/04

# echo "creating geojson Points from halts"
# node ./../../datatool/preprocess/preprocess.js halttopoint < ./output/mvgStateHalts.json
# echo "creating geojson LineStrings from halts"
# node ./../../datatool/preprocess/preprocess.js halttoline < ./output/mvgStateHalts.json
# echo "creating geojson Points from stations"
# node ./../../datatool/preprocess/preprocess.js stationtopoint < ./output/mvgStateStation.json

echo "creating json counting halts"
node ./../../datatool/preprocess/preprocess.js counthalts ./output/halt