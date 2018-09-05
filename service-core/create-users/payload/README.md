# Create users payload

## Usage

### user.create

`node createUsersPayload.js NUM_USERS` will generate an array of payloads to send to `https://reg.DOMAIN/user`. The payload will be written in [users.json](users.json).

Please specify the `DOMAIN` and `HOSTING` in the `createUsersPayload.js` file according to the platform's config.

### auth.login

`node createTokens.js` will take an input of usernames and produce the payload for an `auth.login call`.

The API call with be done on `https://USERNAME.DOMAIN/auth/login` with the `Origin` header set to `https://sw.DOMAIN`.


