# Benchmarking tools for Pryv.io

Client and database components to benchmark Pryv.io.  
Start a database and a certain version of core, run the tests, save the times, then do the same with another version.

## Benchmark scenarii

### Domo-Safety

`src/benchmark/domo-requests.js` holds requests to simulate Domo-Safety's single core instance, as of May 2017: Medium instance on Exoscale.

#### launch multiple concurrency sets

`sh scripts/domo-safety/emfit-requests.sh` makes 10 runs of batch events.create. Each run has a different concurrency setup, from 1 to 10, ie.: first makes each request in serie, second has 2 parallel requests, third has 3, etc.  
The results are written in `results/domo-safety/`.

## Generators

You will find a few NodeJS scripts for generating data in `src/data-generation/`


### Users

`node src/data-generation/users.js [options]` creates users and stores their username/password into `json-data/users.json`

#### options

- `--domain=SS` defines the domain on which the users will be created, defaults to `pryv.li`
- `--hosting=SS` defines the hosting on which the users will be created (see register config), defaults to `exoscale.ch-ch2`
- `--num=NN` defines the number of users to create, defaults to 100
- `--prefix=SS` defines the prefix to the username/password pair, defaults to `testuser-`
- `--output=SS` defines the location of the output file from the root, defaults to `json-data/users.json`

#### Output

`json-data/users.json` will contain an array of username/password in the following format:
```javascript
{
  "username": "testuserN",
  "password": "testuserN"
}
```


### Tokens

`node src/data-generation/tokens.js` reads users saved in `json-data/users.json` and obtains a personal token for each of them, writing the result in the same place.

### Streams

`node src/data-generation/streams.js` reads users saved in `json-data/users.json` and creates a stream for them.


### events

TODO

## Apache Benchmark scripts

In `benchmark/`, you will find a few scripts used to benchmark a Pryv core service running locally


### `single-heavy-requests.sh`

Events.get requests from 100k to 500k


### `progressive-gets.sh`

Events.get requests by sizes of 10, 100, 1k, 10k, 100k


### `pryv-me-like.sh`

Access logs from 19/08/2016


### `single-heavy-multiple-light.sh`

One heavy Events.get request in parallel with multiple light ones. The light ones should not be blocked.


### `multiple-heavy.sh`

Multiple heavy Events.get requests. The requests should be handled in parallel.


### `multiple-light.sh`

Multiple light Events.get requests. The requests should be handled in parallel.


## Datasets

### Dumps

Here you will find links to database dumps available for benchmarking


#### 1M dump (MongoDB 2.4)

A dump containing 1M numerical events, downloadable [here](https://drive.google.com/open?id=0B6hiVSUep65UV2FMMHNzYkoyS3c).  
**Username** benchmark  
**db userID** ciwrtttr70001b5g4jsrae21b  
**password** 1l0v3p0t1r0nZ  
**password hash** $2a$10$ehVgDzGOXrui271ZMLv2gu5bgz3QdsEQXHdx0FRug2BJNaqLLhwIK  
**App token**: cizk09ayw0004p7ot4xv0sl3n  
**personal token** generate if needed (cizk08abd0002p7otzv9r4f1l)

#### 4M dump (MongoDB 3.4)
A dump containing 4M numerical events, downloadable [here](https://drive.google.com/open?id=0B6hiVSUep65UeVpjOUF2QlFwYVk)
**Username** testuser
**password** testuser
**App token** cj3n192pp00150cpky9gxpyrp

### Load dump

#### `setup-database.sh`

Installs MongoDB 2.6.0 in `../mongodb-osx-x86_64-2.6.0`


#### `start-database.sh`

Starts local MongoDB process.


#### `load-dump-from.sh ${db-dump-folder}`

Loads a running MongoDB with the contents of the dump provided as parameters (erasing existing entries).
  
  
#### Users

`json-data/pryvli-exoscale1.json` & `json-data/pryvli-exoscale2.json` hold arrays of already created users on `pryv.li` with personal tokens. When needed, they can be regenerated using `node src/data-generation/tokens.js`.  
Each array item:  
```javascript
{
  "username": "testuser1",
  "password": "testuser1",
  "token": "cj2ruhpxn007y0w57j1whz8m7"
}
```


## Useful cURL commands

### CREATE USER

`curl -i -X POST -H 'Content-Type: application/json' -H 'authorization: OVERRIDE ME' -d '{"username": "benchmark","passwordHash": "$2a$10$ehVgDzGOXrui271ZMLv2gu5bgz3QdsEQXHdx0FRug2BJNaqLLhwIK", "email": "benchmark@benchmark.com","language": "fr"}' "http://127.0.0.1:3000/system/create-user/"`


### LOGIN (generate personal token)

`curl -i -H "Content-Type: application/json" -H "Origin: https://sw.rec.la" -X POST -d '{"username":"benchmark","password":"1l0v3p0t1r0nZ","appId":"pryv-benchmark"}' "http://127.0.0.1:3000/benchmark/auth/login"`


### CREATE APP TOKEN

`curl -i -X POST -H 'Content-Type: application/json' -d '{"name":"for benchmarking","permissions":[{"streamId":"*","level":"manage"}]}' "http://127.0.0.1:3000/benchmark/accesses?auth=cizk08abd0002p7otzv9r4f1l"`


### CREATE STREAM

`curl -i -X POST -H 'Content-Type: application/json' -d '{"id":"rootStream","name":"Root Stream"}' "http://127.0.0.1:3000/benchmark/streams?auth=cizk09ayw0004p7ot4xv0sl3n"`


### CREATE EVENT

`curl -i -X POST -H 'Content-Type: application/json' -d '{"streamId":"supportStream","type":"mass/kg","content":90}' "http://127.0.0.1:3000/benchmark/events/?auth=cizk09ayw0004p7ot4xv0sl3n"`


### GET EVENTS

`curl -i "http://127.0.0.1:3000/benchmark/events/?auth=cizk09ayw0004p7ot4xv0sl3n"`

