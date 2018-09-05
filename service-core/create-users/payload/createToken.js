const fs = require('fs');

const DOMAIN = 'obpmprod.ch';
const HOSTING = 'exoscale.ch-ch1';

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
    fs.writeFileSync(file, JSON.stringify(content));
}

function generateUsername() {

    var username = '';
    var dictionnary = 'abcdefghijklmnopqrstuvwxyz0123456789';

    for (var i = 0; i < 23; i++) {
        username += dictionnary.charAt(Math.floor(Math.random() * dictionnary.length));
    }
    return username;
}