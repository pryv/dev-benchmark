#!/bin/sh
# start a mongodb database then run this providing a the dump of the pryv-node db as argument
../mongodb-osx-x86_64-2.6.0/bin/mongorestore --db pryv-node --drop --verbose $1