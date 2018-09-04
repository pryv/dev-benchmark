#!/bin/bash

echo "events.get 10"
time curl -s "http://127.0.0.1:3000/benchmark/events/?auth=cizk09ayw0004p7ot4xv0sl3n&limit=10" > /dev/null
time curl -s "http://127.0.0.1:3000/benchmark/events/?auth=cizk09ayw0004p7ot4xv0sl3n&limit=10" > /dev/null
time curl -s "http://127.0.0.1:3000/benchmark/events/?auth=cizk09ayw0004p7ot4xv0sl3n&limit=10" > /dev/null

echo "events.get 100"
time curl -s "http://127.0.0.1:3000/benchmark/events/?auth=cizk09ayw0004p7ot4xv0sl3n&limit=100" > /dev/null
time curl -s "http://127.0.0.1:3000/benchmark/events/?auth=cizk09ayw0004p7ot4xv0sl3n&limit=100" > /dev/null
time curl -s "http://127.0.0.1:3000/benchmark/events/?auth=cizk09ayw0004p7ot4xv0sl3n&limit=100" > /dev/null

echo "events.get 1000"
time curl -s "http://127.0.0.1:3000/benchmark/events/?auth=cizk09ayw0004p7ot4xv0sl3n&limit=1000" > /dev/null
time curl -s "http://127.0.0.1:3000/benchmark/events/?auth=cizk09ayw0004p7ot4xv0sl3n&limit=1000" > /dev/null
time curl -s "http://127.0.0.1:3000/benchmark/events/?auth=cizk09ayw0004p7ot4xv0sl3n&limit=1000" > /dev/null

echo "events.get 10000"
time curl -s "http://127.0.0.1:3000/benchmark/events/?auth=cizk09ayw0004p7ot4xv0sl3n&limit=10000" > /dev/null
time curl -s "http://127.0.0.1:3000/benchmark/events/?auth=cizk09ayw0004p7ot4xv0sl3n&limit=10000" > /dev/null
time curl -s "http://127.0.0.1:3000/benchmark/events/?auth=cizk09ayw0004p7ot4xv0sl3n&limit=10000" > /dev/null

echo "events.get 100000"
time curl -s "http://127.0.0.1:3000/benchmark/events/?auth=cizk09ayw0004p7ot4xv0sl3n&limit=100000" > /dev/null
time curl -s "http://127.0.0.1:3000/benchmark/events/?auth=cizk09ayw0004p7ot4xv0sl3n&limit=100000" > /dev/null
time curl -s "http://127.0.0.1:3000/benchmark/events/?auth=cizk09ayw0004p7ot4xv0sl3n&limit=100000" > /dev/null
