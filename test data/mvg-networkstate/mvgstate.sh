#! /bin/zsh

echo "import raw data into mongoDB"
for json in ./*.json
do
  jsonname=$(basename "$json")
  jsonshort="${xmlname%.*}"
  
  echo "importing ${jsonname}"
  node ../../mvgstate/index.js importrawdata < ${json}
done
