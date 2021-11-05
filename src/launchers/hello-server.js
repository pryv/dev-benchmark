var http = require('http');
const { Readable, PassThrough } = require('stream');

const amount = 10000;

//create a server object:
http.createServer(function (req, res) {
  console.log(req.url);
  switch (req.url) {
    case '/':
      let x = '';
      for (let i = 0; i < amount; i++) {
        x += 'Hello World!';
        //res.write('Hello World!'); // equivalent to streaming when growing in size (amount)
      }
      res.write(x);
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

// buffered reading -- 240 / s
streamData = function streamDataBufferedReading(res) {
  const BUFSIZ = 2048;
  const readable = new Readable()
  readable.on('readable', _ => {
    let chunk;
    while (null !== (chunk = readable.read(BUFSIZ))) {
      res.write(chunk);
    }
  });
  readable.on('end', () => {
    res.end();
  });

  for (let i = 0 ; i < amount; i++) {
    readable.push('Hello World!');
  }
  // no more data
  readable.push(null);
}



// stream to write -- 32 / s
function streamDataStreamToWrite(res) {
  const readable = new Readable()
  readable.on('data', (dt) => { res.write(dt);});
  readable.on('end', () => {  res.end(); });

  for (let i = 0 ; i < amount; i++) {
    readable.push('Hello World!');
  }
  // no more data
  readable.push(null);
}


// 12 chunks -- 104 / s
function streamDataChunks(res) {
  const readable = new Readable()
  let chunk;
  let maxchunkSize = 10000; // total size is arround 12K
  readable.on('data', (dt) => { 
    chunk +=dt 
    if (chunk.length > maxchunkSize) {
      res.write(chunk); 
      chunk = '';
    }
  });
  readable.on('end', () => { res.write(chunk); res.end(); });

  for (let i = 0 ; i < amount; i++) {
    readable.push('Hello World!');
  }
  // no more data
  readable.push(null);
}

// OneChunk -- 106 / s
function streamDataOneChunk(res) {
  const readable = new Readable()
  let chunk;
  readable.on('data', (dt) => { chunk +=dt });
  readable.on('end', () => { res.write(chunk); res.end(); });

  for (let i = 0 ; i < amount; i++) {
    readable.push('Hello World!');
  }
  // no more data
  readable.push(null);
}

// Pipe -- 38 / s
function streamDataPipe(res) {
  const readable = new Readable()
  readable.pipe(res)

  for (let i = 0 ; i < amount; i++) {
    readable.push('Hello World!');
  }
  // no more data
  readable.push(null);
}


// Pull -- 42 / s
function streamDataPull(res) {
  const readable = new Readable({ highWaterMark: 4000,
    read() { add(true) }
  })
  
  let i = 0;
  function add(doNotPushOnMyOwn) {
    if (i >= amount ) {
      readable.push(null);
      return;
    }
    i++;
    readable.push('Hello World!');
  }

  readable.pipe(res);
}