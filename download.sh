#! /bin/bash

module="";
state="";
layer="";
force=false;
while getopts m:s:l:f flag
do
  case "${flag}" in
    m) module="-m ${OPTARG}";;
    s) state="-s ${OPTARG}";;
    l) layer="-l ${OPTARG}";;
    f) force="-f";;
  esac
done
npm run download -- $module $state $layer $force | bunyan;
