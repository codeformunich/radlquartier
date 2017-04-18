#! /bin/zsh

echo "convert XML to JSON"
for xml in ./*.xml
do
  xmlname=$(basename "$xml")
  xmlshort="${xmlname%.*}"
  
  echo "converting ${xmlname}"
  node ../nextbike/index.js xml2json < ${xml} > ${xmlshort}.rjson
done

echo "extract place elements"
for rjson in ./*.rjson
do
  rjsonname=$(basename "$rjson")
  rjsonshort="${rjsonname%.*}"

  echo "extracting ${rjsonname}"
  node ../nextbike/index.js extractplace < ${rjson} > ${rjsonshort}.pjson
done

echo "extende place elements with date from file name"
for pjson in ./*.pjson
do
  pjsonname=$(basename "$pjson")
  pjsonshort="${pjsonname%.*}"

  echo "extending ${pjsonname}"
  node ../nextbike/index.js adddate $pjsonshort < ${pjson} > ${pjsonshort}.djson
done

echo "import geojson into mongoDB"
for json in ./*.djson
do
  jsonname=$(basename "$json")
  jsonshort="${jsonname%.*}"

  mongoimport --db bikeproject --collection placesfebruar --type json --file $json --jsonArray
done
