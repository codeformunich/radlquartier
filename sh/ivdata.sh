#! /bin/zsh

echo "convert XML to JSON"
for xml in ./*.xml
do
  xmlname=$(basename "$xml")
  xmlshort="${xmlname%.*}"
  
  echo "converting ${xmlname}"
  node ../ivdata/index.js xml2json < ${xml} > ${xmlshort}.rjson
done

echo "extract place elements"
for rjson in ./*.rjson
do
  rjsonname=$(basename "$rjson")
  rjsonshort="${rjsonname%.*}"

  echo "extracting ${rjsonname}"
  node ../ivdata/index.js extractplace < ${rjson} > ${rjsonshort}.pjson
done

echo "extende place elements with date from file name"
for pjson in ./*.pjson
do
  pjsonname=$(basename "$pjson")
  pjsonshort="${pjsonname%.*}"

  echo "extending ${pjsonname}"
  node ../ivdata/index.js adddate $pjsonshort < ${pjson} > ${pjsonshort}.djson
done

# echo "transform place elements to geojson feature elements"
# for djson in ./*.djson
# do
#   djsonname=$(basename "$djson")
#   djsonshort="${djsonname%.*}"

#   echo "transforming ${djsonname}"
#   node ../ivdata/index.js geojson < ${djson} > ${djsonshort}.gjson
# done

echo "import geojson into mongoDB"
for json in ./*.djson
do
  jsonname=$(basename "$json")
  jsonshort="${jsonname%.*}"

  mongoimport --db bikeproject --collection placesfebruar --type json --file $json --jsonArray
done
