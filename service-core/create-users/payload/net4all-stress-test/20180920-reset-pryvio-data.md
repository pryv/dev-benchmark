### Réinitialiser données sur Pryv.io

Sur la machine reg-master (register01):

- `cd /var/pryv`

- `./stop-containers`
- `rm -rf /var/pryv/reg-master/redis/data/*`
- `./run-reg-master`

Sur la machine core01:

- `cd /var/pryv`

- `./stop-containers`
- `rm -rf /var/pryv/core-v1.3/core/data/*`
- `rm -rf /var/pryv/core-v1.3/mongodb/data/*`
- `./run-core-v1.3`

Sur la machine queue01:

- `cd /var/pryv`

- `./stop-containers`
- `rm -rf /var/pryv/hook/api/data/hooks/*`
- `rm -rf /var/pryv/hook/api/data/hooksDeactivated/*`
- `./run-hook`