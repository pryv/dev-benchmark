const http = require('http');
const fs = require('fs');
const path = require('path');

const port = process.argv[2];

const hosts = {};

//create a server object:
http.createServer(function (req, res) {
  const host = req.headers.host;
  if (! hosts[host]) hosts[host] = 0;
  hosts[host]++;
  setTimeout(function() {
    res.write('Hello World!'); //write a response to the client
    res.end(); //end the response
  }, 2000 * Math.random());
}).listen(port); //the server object listens on port 8080


process.on('SIGINT', function() {
  console.log('Closing ' + port);
  const filePath = path.resolve(__dirname, './result-' + port + '.json');
  fs.writeFileSync(filePath, JSON.stringify(hosts, null, 2));
  process.exit();
});

console.log('Ready ' + port);