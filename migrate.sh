#! /bin/bash

module="";
start="";
end="";
clear="";
while getopts m:s:e:c flag
do
  case "${flag}" in
    m) module="-m ${OPTARG}";;
    s) start="-s ${OPTARG}";;
    e) end="-e ${OPTARG}";;
    c) clear="-c";;
  esac
done
npm run migrate -- $module $start $end $clear;
