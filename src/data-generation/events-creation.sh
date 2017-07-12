#!/usr/bin/env bash

# batchSize, requestsCount, parallelRequetsMax

#node events.js 2000 10 1 | tee results/2000-10-1.txt
#node events.js 2000 10 2 | tee results/2000-10-2.txt
#node events.js 2000 10 3 | tee results/2000-10-3.txt
#node events.js 2000 10 4 | tee results/2000-10-4.txt
#node events.js 2000 10 5 | tee results/2000-10-5.txt
#node events.js 2000 10 6 | tee results/2000-10-6.txt
#node events.js 2000 10 7 | tee results/2000-10-7.txt
#node events.js 2000 10 8 | tee results/2000-10-8.txt
#node events.js 2000 10 9 | tee results/2000-10-9.txt
#node events.js 2000 10 10 | tee results/2000-10-10.txt

node events.js 5000 60 4 | tee results/5000-60-4.txt

