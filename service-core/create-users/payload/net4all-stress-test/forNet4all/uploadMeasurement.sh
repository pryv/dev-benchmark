#!/bin/bash

curl -i -H 'Authorization: cjmaijiqz000h15s57h7jnrhc' -F 'event={"streamId":"riva-obpm-app-input","type":"obpm-csem-algo/v1","tags":["toProcess"]}'  -F "file=@measurement.data" "https://oyos0d.pryv-n4a.ch/obpminput"