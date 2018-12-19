const fs = require('fs');
const pad = require('pad');

const DOMAIN = 'pryv-n4a.ch';
const HOSTING = 'exoscale.ch-ch1';

const USERS_FILE = __dirname + '/pryv-n4a-users.json';

if (process.argv.length < 3) {
    console.log('please provide a number');
    process.exit(1);
}
let NUM_USERS = process.argv[2];

const userCreations = [];

for (let i = 0; i < NUM_USERS; i++) {
    const username = generateCountUsername(i);
    userCreations.push({
        username: username,
        hosting: HOSTING,
        appid: 'benchmark-user-creations',
        email: username + '@' + DOMAIN,
        password: username,
        invitationtoken: 'enjoy'
    })
}

writeToJSON(userCreations, USERS_FILE);

function writeToJSON(content, file) {
    fs.writeFileSync(file, JSON.stringify(content, null, 2));
}

function generateCountUsername(num) {
    return 'bench-' + pad(6,num, '0');
}

function generateRandomUsername() {
    var username = '';
    var dictionnary = 'abcdefghijklmnopqrstuvwxyz0123456789';

    for (var i = 0; i < 23; i++) {
        username += dictionnary.charAt(Math.floor(Math.random() * dictionnary.length));
    }
    return username;
}