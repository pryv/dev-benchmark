const fs = require('fs');

const USERS_FILE = __dirname + '/users.json';
const USERS_TOKENS_FILE = __dirname + '/usersWithTokens.json';

const users = JSON.parse(fs.readFileSync(USERS_FILE));

const usersTokens = [];

users.forEach((u) => {
    usersTokens.push({
        username: u.username,
        password: u.password,
        appid: 'benchmark-app',
    });
});

writeToJSON(usersTokens, USERS_TOKENS_FILE);

function writeToJSON(content, file) {
    fs.writeFileSync(file, JSON.stringify(content, null, 2));
}