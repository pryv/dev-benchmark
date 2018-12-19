// create the users on Register's Redis DB for the API to work properly

// run using: /app/bin/mongo/bin/mongo localhost:27017/pryv-node user.js

var NUM_USERS = 1;

var conn = new Mongo();
var db = conn.getDB("pryv-node");


print(db.users.count());

for (var i=1; i<NUM_USERS; i++) {
  db.users.insertOne({
    username: "user-"+i,
    email: "user-" + i + "@bogus.tk",
    language: "en",
    passwordHash: "$2a$10$G7FlIbEQco9.lBn7VXS2BuZHSNTHpU4ta.I5OYrLbuiU5HsJ9GSC2", // ="testuser3"
    storageUsed: {
      dbDocuments: 0,
      attachedFiles: 0
    }
  });
}