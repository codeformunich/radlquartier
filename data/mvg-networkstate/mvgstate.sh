#! /bin/zsh

echo "call the mvgstate cmd on the mvg-networkstate folder"
for json in ./../test_data/mvg-networkstate/2017/03/*.json
# for json in ./../test_data/mvg-networkstate/*.json
do
  jsonname=$(basename "$json")
  jsonshort="${xmlname%.*}"
  
  echo "importing ${jsonname}"
  node ./../../datatool/mvgstate/mvgstate.js halt < ${json}
done
