#!/bin/sh

USERNAME="benchmark-ssd"; DOMAIN="pryv.io"; TOKEN="TesOkW8Uyi"

STREAMID="loadtest"

HEADER="application/json"

REQUESTS=1000
CONCURENCY=10

URL="https://benchmark-ssd.pryv.li/?auth=cj510f9oe00050bo59wcujon5";

#URL="http://perkikiki.rec.la:6000/events/batch?auth=${TOKEN}";

echo $URL;

ab -n $REQUESTS -c $CONCURENCY -p batch.json -T $HEADER  $URL
