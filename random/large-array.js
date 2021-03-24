const fs = require('fs');

const res = [];
for (let i = 0; i < (3600 * 100); i++) {
  res.push(Math.round(Math.random() * 1000000)/1000);
}

fs.writeFileSync('./tmp/large-array.json', JSON.stringify(res));