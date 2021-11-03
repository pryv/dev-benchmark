var http = require('http');
const { Readable } = require('stream');

//create a server object:
http.createServer(function (req, res) {
  console.log(req.url);
  switch (req.url) {
    case '/':
      for (let i = 0; i < 10; i++) {
        res.write('Hello World!'); //write a response to the client
      }
      res.end(); //end the response
      break;
    case '/streamed':
      streamData(res);
      break;
    default:
    res.statusCode = 400;
    res.write('Unkown'); //write a response to the client
    res.end(); //end the response
  } 
}).listen(8080); //the server object listens on port 8080

console.log('Ready');

function streamData(res) {
  
  const readable = new Readable()

  readable.pipe(res)

  for (let i = 0 ; i < 10; i++) {
    readable.push('Hello World!');
  }
  // no more data
  readable.push(null)

}