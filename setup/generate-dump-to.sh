#!/bin/sh
# start a mongodb database then run this to generate a dump of the running database, providing the outputfolder as argument
../mongodb-osx-x86_64-2.6.0/bin/mongodump -o $1
