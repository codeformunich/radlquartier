#! /bin/zsh

for file in ./*
do
  xml2json < ${file} > ${file}.json
done