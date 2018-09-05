const fs = require('fs');

const DOMAIN = 'obpmprod.ch';
const HOSTING = 'exoscale.ch-ch1';

const USERS_FILE = __dirname + '/users.json';

if (process.argv.length < 3) {
    console.log('please provide a number');
    process.exit(1);
}
let NUM_USERS = process.argv[2];

const userCreations = [];

for (let i = 0; i < NUM_USERS; i++) {
    const username = generateUsername();
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