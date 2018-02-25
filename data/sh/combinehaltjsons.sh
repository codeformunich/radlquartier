#! /bin/zsh

cat *.geojson | sed '1d' | sed '$d' | sed -i '' -e '$a\' > test.tmp

echo "." | tee -a *.tmp