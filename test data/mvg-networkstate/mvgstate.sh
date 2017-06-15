#! /bin/zsh

echo "import halt data into mongoDB"
for json in ./*.json
do
  jsonname=$(basename "$json")
  jsonshort="${xmlname%.*}"0    
  
  echo "importing ${jsonname}"
  node ../../mvgstate/index.js halt < ${json}
done
