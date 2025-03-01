/**
 * @license
 * Copyright (C) Pryv https://pryv.com
 * This file is part of Pryv.io and released under BSD-Clause-3 License
 * Refer to LICENSE file
 */
const {MongoClient} = require('mongodb');
const config = require('../config.json');

const client = new MongoClient(config.mongoURI);

let db;

/**
 * Create "N" streams on Mongo in a sucession of parents and childs
 * @param {*} user 
 * @param {*} count 
 */
async function insertStreams(user, count) {
  const streams = [];
  for (let i = 0; i < count; i++) {
    const base = Math.random();
    const parentId =  i ? base+"b"+(i -1) : null ;
    streams.push(
      {
        "name": base+"b"+i,
        "parentId" : null,
        "created" : 1614939523.951,
        "createdBy" : "cklw5anod000djfvnu1081g71",
        "modified" : 1614939523.951,
        "modifiedBy" : "cklw5anod000djfvnu1081g71",
        "streamId" :  base+"b"+i,
        "parentId" : parentId,
        "deleted" : null,
        "userId" : user
      });
  }
  try {
    console.time("insert");
    const res = await db.collection("streams").insertMany(streams);   
    console.log("Insert: ",res.insertedCount );
    console.timeEnd("insert");
  } catch (err) {
    console.log(err);
  };


  console.log('Stream Count:' + await db.collection("streams").count())
  
}


(async () => {
  await client.connect();
  const dbs = await listDatabases(client);
  console.log(dbs);
  db = client.db('pryv-node');
  
  const res = await db.collection('events').find({streamIds: { $in: ['.username']}}).toArray();
  for (let u of res) {
    //console.log(u);
    console.log(u.userId, u.content);
    await insertStreams(u.userId, 200);
  }
  //console.log(res);
  
  
})();


async function listDatabases(client){
  databasesList = await client.db().admin().listDatabases();

  console.log("Databases:");
  databasesList.databases.forEach(db => console.log(` - ${db.name}`));
};

// db.events.find({streamids: { $in: ['.username']}});