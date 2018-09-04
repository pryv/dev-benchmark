const fs = require('fs');
var parse = require('csv-parse/lib/sync');

const OUTPUT_FILENAME = 'users.json';

let files = fs.readdirSync('./');
const userCredsFiles = [];

files.forEach((f) => {
    if (f.startsWith('myUsers')) {
        userCredsFiles.push(f);
    }
});
console.log('files', userCredsFiles)

const totalUsers = [];

userCredsFiles.forEach((f) => {
    const input = fs.readFileSync(f);
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
