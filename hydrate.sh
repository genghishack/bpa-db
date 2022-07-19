#! /bin/bash

module="";
state="";
layer="";
while getopts m:s:l: flag
do
  case "${flag}" in
    m) module="-m ${OPTARG}";;
    s) state="-s ${OPTARG}";;
    l) layer="-l ${OPTARG}";;
  esac
done
npm run hydrate -- $module $state $layer | bunyan;
