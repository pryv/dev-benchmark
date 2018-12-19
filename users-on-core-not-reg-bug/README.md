# tools to investigate GH issue #8 on register

[link to GH issue](https://github.com/pryv/service-register/issues/8)

## Find out size of the bug

In order to prioritize the fix of this issue, we must know how often it happens. For this, we compute the following:
- users on core, but not on redis
- from these, which ones have accesses (ie.: which ones have managed to create data)

### Fetch data on core

1. ssh to core
2. enter mongodb container: `docker exec -ti pryv_mongodb_1 /app/bin/mongodb/bin/mongo`
3. `cd /app/log`
4. `cat get-all-users.mongo | /app/bin/mongodb/bin/mongo > all-users.txt`
5. `cat get-collections.mongo | /app/bin/mongodb/bin/mongo | grep accesses > user-ids-with-accesses.txt`
6. exit container: `CTRL-D`
7. scp to local storage from `/var/pryv/core-v1.3/mongodb/log/*`

### Fetch data on register

1. ssh to register slave
2. enter redis container: `docker exec -ti pryv_redis_1 /bin/bash`
3. `cd /app/log`
4. `redis-cli keys *:users > users.redis.txt`
5. exit container: `CTRL-D`
6. scp to local storage from `/var/pryv/reg-slave/redis/log/users.redis.txt`
