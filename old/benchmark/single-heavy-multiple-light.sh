#!/bin/bash

echo "########################"
echo "##### heavy: 500k ######"
echo "########################"
time curl -s "http://127.0.0.1:3000/benchmark/events/?auth=cizk09ayw0004p7ot4xv0sl3n&limit=500000" > /dev/null &

echo "########################"
echo "#### 20 light : 20 #####"
echo "########################"
ab -n 20 -c 10 -l "http://127.0.0.1:3000/benchmark/events/?auth=cizk09ayw0004p7ot4xv0sl3n&limit=20"