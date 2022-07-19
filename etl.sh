#!/bin/bash

module="";
state="";
layer="";
force="";
mock="";
while getopts m:s:l:o:vftk flag
do
  case "${flag}" in
    m) module="-m ${OPTARG}";;
    s) state="-s ${OPTARG}";;
    l) layer="-l ${OPTARG}";;
    f) force="-f";;
    k) mock="-k";;
  esac
done
npm run etl -- $module $state $layer $force $mock | bunyan;
