#! /bin/bash

module="";
state="";
layer="";
offset="";
validate="";
force="";
while getopts m:s:l:o:vf flag
do
  case "${flag}" in
    m) module="-m ${OPTARG}";;
    s) state="-s ${OPTARG}";;
    l) layer="-l ${OPTARG}";;
    o) offset="-o ${OPTARG}";;
    v) validate="-v";;
    f) force="-f";;
  esac
done
npm run etl -- $module $state $layer $offset $validate $force;
