#! /bin/zsh

echo "creating halts from networkstate-mvgrad files"
node ./../../../datatool/mvgstate/mvgstate.js halt ./2017/04
node ./../../../datatool/mvgstate/mvgstate.js halt ./2017/05
node ./../../../datatool/mvgstate/mvgstate.js halt ./2017/07
node ./../../../datatool/mvgstate/mvgstate.js halt ./2017/08
node ./../../../datatool/mvgstate/mvgstate.js halt ./2017/09
node ./../../../datatool/mvgstate/mvgstate.js halt ./2017/10
node ./../../../datatool/mvgstate/mvgstate.js halt ./2017/11
node ./../../../datatool/mvgstate/mvgstate.js halt ./2017/12

# echo "creating stations from networkstate-mvgrad files"
# node ./../../../datatool/mvgstate/mvgstate.js station ./2017/03

# echo "creating geojson Points from halts"
# node ./../../datatool/preprocess/preprocess.js halttopoint < ./output/mvgStateHalts.json
# echo "creating geojson LineStrings from halts"
# node ./../../datatool/preprocess/preprocess.js halttoline < ./output/mvgStateHalts.json
# echo "creating geojson Points from stations"
# node ./../../datatool/preprocess/preprocess.js stationtopoint < ./output/mvgStateStation.json

# echo "creating json counting halts"
# node ./../../datatool/preprocess/preprocess.js counthalts ./output/halt