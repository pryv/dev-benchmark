#!/bin/bash

echo TODO

echo "########################"
echo "######### 10k ##########"
echo "########################"
#ab -n 10 -c 10 -l "http://127.0.0.1:3000/benchmark/events/?auth=cizk09ayw0004p7ot4xv0sl3n&limit=1000
ab -n 10 -c 10 -l "https://benchmark-ssd.pryv.li/events/?auth=cj510f9oe00050bo59wcujon5&limit=10000"

echo "########################"
echo "######### 100k #########"
echo "########################"
#ab -n 10 -c 10 -l "http://127.0.0.1:3000/benchmark/events/?auth=cizk09ayw0004p7ot4xv0sl3n&limit=100000"
ab -n 10 -c 10 -l "https://benchmark-ssd.pryv.li/events/?auth=cj510f9oe00050bo59wcujon5&limit=100000"