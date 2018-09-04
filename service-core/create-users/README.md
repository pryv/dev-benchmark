# benchmark-max-users
Benchmarking 100k users on core-hooks engine system

## Usage

### create users 

creates users with tokens and streams.

Run `node createUsers.js NUM_USERS | tee output.csv` 

Then parse the csv using `node parse.js output.csv`

As this task can be quite long, it is recommended to run it on an available server. Customize `sync.sh` to rsync this file where you wish to execute it.