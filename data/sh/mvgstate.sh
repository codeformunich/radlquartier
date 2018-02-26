#! /bin/zsh

# node ./../../datatool/mvgstate/mvgstate.js halt ./../test_data/mvg-networkstate
# node ./../../datatool/mvgstate/mvgstate.js halt ./../test_data/mvg-networkstate/2017/03

node ./../../datatool/mvgstate/mvgstate.js station ./../test_data/mvg-networkstate
# node ./../../datatool/mvgstate/mvgstate.js station ./../test_data/mvg-networkstate/2017/03

# echo "call the mvgstate cmd on the mvg-networkstate folder"
# for json in ./../test_data/mvg-networkstate/2017/03/*.json
# # for json in ./../test_data/mvg-networkstate/*.json
# do
#   jsonname=$(basename "$json")
#   jsonshort="${xmlname%.*}"
  
#   echo "importing ${jsonname}"
#   node ./../../datatool/mvgstate/mvgstate.js halt < ${json}
# done
