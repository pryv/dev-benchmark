var express = require('express');
const { MongoClient } = require('mongodb');
const config = require('../../config.json');
const { Readable, Transform } = require('stream');

const app = express();
app.use(express.json());
const port = 8080;

const client = new MongoClient(config.mongoURI);

const COUNT = 100;

let db;
let collection;

// (best from 400 / crash over 300K) 1575 / sec (10 elements) -- 975 (100 el) -- 208 (10000 el) -- 21.9 (10000 el) -- 2.14 (100000 el)
app.get('/', (req, res) => {
  collection.find({}).limit(COUNT).toArray((err, dbRes) => {
    res.send(dbRes)
  });
 
}) 
// 179.5 / sec (10 elements) -- 178 (100 el) -- 147 (1000 el) -- 16.7 (10000 elements) -- 1.6 (100000 el)
app.get('/streamed-pipe', (req, res) => {
  const cursor = collection.find({}).limit(COUNT);
  const stream = Readable.from(cursor, {objectMode: true, highWaterMark: 4000});
  
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Transfer-Encoding', 'chunked');
  res.statusCode = 200;
  stream.pipe(new ResultStream()).pipe(res);
})

// (best up to 400) 2123 / sec (10 elements) -- 993.67 (100 el) -- 164 (1000 el) -- 16 (10000 elements) -- 1.6 (100000 el)
app.get('/streamed-write', (req, res) => {
  const cursor = collection.find({}).limit(COUNT);
  const stream = Readable.from(cursor, {objectMode: true, highWaterMark: 4000});

  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Transfer-Encoding', 'chunked');
  res.statusCode = 200;

  const BUFSIZ = 128 * 1024; 
  const resultStream = stream.pipe(new ResultStream(BUFSIZ));
  
  resultStream.on('readable', _ => {
    let chunk;
    while (null !== (chunk = resultStream.read())) {
      //console.log(chunk.length);
      res.write(chunk);
    }
  });
  resultStream.on('end', () => {
    res.end();
  });
})


app.post('/', async (req, res) => {
  const data = req.body;
  const dbRes = await collection.insertOne(data);
  res.send(dbRes.ops)
});


(async () => {
  try {
    await client.connect();
    db = client.db('load-test');
    collection = db.collection('data');
    const toAdd = COUNT - (await check());
    if (toAdd > 0) {
      console.log('adding :' + toAdd);
      await insert(toAdd);
    }
    app.listen(port, () => {
      console.log(`Ready`)
    })
  } catch (e) {
    console.log(e);
  }
})();

async function check() {
  return await collection.countDocuments({});
}

async function insert(num) {
  for (let i = 0; i < num; i++) {
    await collection.insertOne({"streamIds":["weight"],"type":"mass/kg","content":i});
  } 
}

class ResultStream extends Transform {
  isStart;
  tracing;
  buffer;
  bufferSize;
  
  constructor(bufferSize) {
    super({objectMode: true, highWaterMark: 4000});
    this.bufferSize = bufferSize || 2048 ;
    this.isStart = true;
    this.buffer = '';
  }

  xpush(data) {
    this.buffer += data;
    if (this.buffer.length >= this.bufferSize) {
      this.push(this.buffer);
      this.buffer = '';
    }
  }
  
  _transform(data, encoding, callback) {
    if (this.isStart) {
      this.isStart = false;
      this.xpush('{ events: [' + JSON.stringify(data));
    } else {
      this.xpush(',' + JSON.stringify(data));
    }
    callback();
  }
  
  _flush(callback) {
    this.xpush('], "meta": ' + JSON.stringify({'hello': 'bob'}) + '}');
    if (this.buffer.length > 0) this.push(this.buffer);
    callback();
  }
}