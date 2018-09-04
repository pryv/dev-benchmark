const fs = require('fs');
var parse = require('csv-parse/lib/sync');

const OUTPUT_FILENAME = __dirname + '/users/obpm-dev.io/users.json';
const SOURCE_DIR = __dirname + '/users/obpm-dev.io';

let files = fs.readdirSync(SOURCE_DIR);
const userCredsFiles = [];

files.forEach((f) => {
    if (f.startsWith('myUsers')) {
        userCredsFiles.push(f);
    }
});
console.log('files', userCredsFiles)

const totalUsers = [];

userCredsFiles.forEach((f) => {
    const input = fs.readFileSync(__dirname + '/users/obpm-dev.io/' + f);
    console.log('read file', f, 'size', input.length)
    const records = parse(input, {columns: true});    
    
    console.log('parsed', records.length, 'items');
    records.forEach((r) => {
        //console.log(r)
        if (r.token != 'undefined') {
            totalUsers.push(r);
        }
    })
})

console.log('got', totalUsers.length, 'users')

fs.writeFileSync(OUTPUT_FILENAME, JSON.stringify(totalUsers));
