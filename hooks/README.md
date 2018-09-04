# Benchmarking tools for hook-engine

Tools for benchmarking Hooks-engine.

### createHooks.js

From a file of username, password, token objects, creates hooks that can be copied to a hook-engine and loaded in it.
It also requires to add some parameters, available in the config file of the hook-engine.

Run `node createHooks.js`

Copy these hooks to the hook-engine using `sync.sh`.

### countUsers.js

From a file containing users, counts the position of a certain user.

