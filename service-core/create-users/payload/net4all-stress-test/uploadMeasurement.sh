#!/bin/bash

curl -i -H 'Authorization: cjn0dper100021fmijjexaab2' -F 'event={"streamId":"riva-obpm-app-input","type":"obpm-csem-algo/v1","tags":["toProcess"]}'  -F "file=@measurement.data" "https://fg2zyi.pryv-n4a.ch/obpminput"