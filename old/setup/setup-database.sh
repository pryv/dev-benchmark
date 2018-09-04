#!/bin/bash

# Sets up the dev environment on a 64-bit OSX system.

# working dir fix
SCRIPT_FOLDER=$(cd $(dirname "$0"); pwd)
cd $SCRIPT_FOLDER/.. # root


export MONGO_NAME=mongodb-osx-x86_64-2.6.0
export MONGO_DL_BASE_URL=http://fastdl.mongodb.org/osx
export MONGO_BASE_FOLDER=$DATA_FOLDER
export MONGO_DATA_FOLDER=$DATA_FOLDER/mongodb-data

curl -s -L https://raw.github.com/pryv/dev-scripts/master/setup-mongodb.bash | bash
EXIT_CODE=$?
if [[ ${EXIT_CODE} -ne 0 ]]; then
  echo ""
  echo "Error setting up database; setup aborted"
  echo ""
  exit ${EXIT_CODE}
fi


echo ""
echo "Setup complete!"
echo ""