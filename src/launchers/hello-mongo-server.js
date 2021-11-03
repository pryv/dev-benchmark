var express = require('express');
const { MongoClient } = require('mongodb');
const config = require('../../config.json');
const { Readable, Transform } = require('stream');

const app = express();
app.use(express.json());
const port = 8080;

const client = new MongoClient(config.mongoURI);

let db;
let collection;

app.get('/', (req, res) => {
  collection.find({}).limit(10).toArray((err, dbRes) => {
    res.send(dbRes)
  });
 
})

app.get('/streamed', (req, res) => {
  const cursor = collection.find({}).limit(10);

  async function* iterate() {
    let r = null;
    do {
      r = await cursor.next();
      if (r != null) yield r
    } while (r != null);
  }

  const stream = Readable.from(iterate(), {objectMode: true, highWaterMark: 4000});
  
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Transfer-Encoding', 'chunked');
  res.statusCode = 200;

  stream.pipe(new ResultStream()).pipe(res);
})


app.get('/raw-streamed', (req, res) => {
  const cursor = collection.find({}).limit(10);

  async function* iterate() {
    let r = null;
    for (let i = 0 ; i < 10; i++) {
      yield '{"_id":"61817a4a37e46944a7789d53","streamIds":["weight"],"type":"mass/kg","content":90},{"_id":"61817a4a37e46944a7789d54","streamIds":["weight"],"type":"mass/kg","content":90}';
    }
  }

  const stream = Readable.from(iterate(), {objectMode: true, highWaterMark: 4000});
  
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Transfer-Encoding', 'chunked');
  res.statusCode = 200;

  stream.pipe(res);
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
    await insert20();
    app.listen(port, () => {
      console.log(`Ready`)
    })
  } catch (e) {
    console.log(e);
  }
})();


async function insert20() {
  for (let i = 0; i < 20; i++) {
    await collection.insertOne({"streamIds":["weight"],"type":"mass/kg","content":90});
  } 
}

class ResultStream extends Transform {
  isStart;
  tracing;
  
  constructor() {
    super({objectMode: true, highWaterMark: 4000});
    this.isStart = true;
  }
  
  _transform(data, encoding, callback) {
    if (this.isStart) {
      this.isStart = false;
      this.push('{ events: [' + JSON.stringify(data));
    } else {
      this.push(',' + JSON.stringify(data));
    }
    callback();
  }
  
  _flush(callback) {
    const thing = '], "meta": ' + JSON.stringify({'hello': 'bob'});
    this.push(thing + '}');
    if (this.tracing != null) this.tracing.finishSpan('result.resultStream');
    callback();
  }
}