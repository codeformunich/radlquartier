#! /bin/zsh

echo "creating halts from networkstate-mvgrad files"
node ./../../datatool/obike/obike.js halt ./input

echo "creating geojson Points from halts"
node ./../../datatool/preprocess/preprocess.js halttopoint < ./output/obikeHalts.json

echo "creating geojson LineStrings from halts"
node ./../../datatool/preprocess/preprocess.js halttoline < ./output/obikeHalts.json
