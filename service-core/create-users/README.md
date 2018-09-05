# Create users

Creates users with tokens and streams.

## Usage

Run `node createUsers.js NUM_USERS | tee output.csv` 

Then parse the csv using `node parse.js output.csv`

As this task can be quite long, it is recommended to run it on an available server. Customize `sync.sh` to rsync this file where you wish to execute it.

### Payload

For customers such as Net4all who have their own tools to execute the benchmarking, this provides the URLs and payloads for creating users tests.