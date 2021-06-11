var express = require('express');
const {MongoClient} = require('mongodb');
const config = require('../../config.json');

const app = express();
app.use(express.json());
const port = 8080;

const client = new MongoClient(config.mongoURI);

let db;
let collection;

app.get('/', (req, res) => {
  collection.find({}).limit(20).toArray((err, dbRes) => {
    res.send(dbRes)
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
