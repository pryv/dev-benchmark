#!/usr/bin/env bash

# working dir fix
SCRIPT_FOLDER=$(cd $(dirname "$0"); pwd)
cd $SCRIPT_FOLDER/../.. # root

for i in `seq 1 10`;
do
  node src/benchmark/emfit-requests.js $i
  echo "DONE FOR $i"
done