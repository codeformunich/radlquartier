#! /bin/zsh

# for xml in ../*.xml
# do
#   xmlname=$(basename "$xml")
#   xmlshort="${xmlname%.*}"

#   node ../ivdata/index.js xml2json < ${xml} > ${xmlshort}.rjson
# done

# for rjson in ./*.rjson
# do
#   rjsonname=$(basename "$rjson")
#   rjsonshort"${rjsonname%.*}"

#   node ../ivdata/index.js extractplace < $rjson > ${rjsonshort}.pjson
# done

# for pjson in ./*.pjson
# do
#   pjsonname=$(basename "$pjson")
#   pjsonshort="${pjsonname%.*}"

#   node ../ivdata/index.js adddate $pjsonshort < ${pjson} > ${pjsonshort}.djson
# done

for djson in ./*.djson
do
  djsonname=$(basename "$djson")
  djsonshort="${djsonname%.*}"

  node ../ivdata/index.js geojson < ${djson} > ${djsonshort}.json
done

# for json in ./*.json
# do
#   jsonname=$(basename "$json")
#   jsonshort="${jsonname%.*}"

#   mongoimport --db infovis --collection place --type json --file $json --jsonArray
# done
