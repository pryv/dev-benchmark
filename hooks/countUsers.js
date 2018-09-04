const fs = require('fs');

let files = fs.readdirSync('./hooks');

let count = 0;

for(;count<files.length; count++) {
    if (files[count].startsWith('n0yy5queapfnjwaxd8cnszp')) {
        break;
    }
}
