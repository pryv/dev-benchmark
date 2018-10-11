const fs = require('fs');


const redisUsersRaw = fs.readFileSync(__dirname + '/obpmprod.ch/users.redis.txt', {encoding: 'utf8'});

const redisUsersLines = redisUsersRaw.split('\n');
//console.log('lines', redisUsersLines);

const redisUsers = [];

redisUsersLines.forEach((line) => {
  const splitLine = line.split(':');
  redisUsers.push(splitLine[0]);
})

//console.log('users', redisUsers)

const allUsersRaw = fs.readFileSync(__dirname + '/obpmprod.ch/all-users.txt', { encoding: 'utf8' });
const allUsersLines = allUsersRaw.split('\n');

const allUsers = [];
allUsersLines.forEach((line, i) => {
  if (!line) return
  allUsers.push(JSON.parse(line))
})
//console.log(allUsers)

const usersWithAccessesRaw = fs.readFileSync(__dirname + '/obpmprod.ch/users-with-accesses.txt', { encoding: 'utf8' });
const usersWithAccessesLines = usersWithAccessesRaw.split('\n');

const usersWithAccessesIds = [];
usersWithAccessesLines.forEach((line) => {
  const splitLine = line.split('.');
  usersWithAccessesIds.push(splitLine[0]);
})
//console.log(usersWithAccessesIds)

const usersNotInReg = [];

allUsers.forEach((user) => {
  if (redisUsers.indexOf(user.username) < 0) {
    usersNotInReg.push(user);
  }
});

const howThe = [];

usersNotInReg.forEach((user) => {
  const found = usersWithAccessesIds.indexOf(user._id);
  console.log(found)
  if (found > -1) {
    howThe.push(user);
  }
})

console.log('users in invalid state in core gandi fr:', usersNotInReg.length)
console.log('total:', allUsers.length)
console.log('ratio:', (usersNotInReg.length / allUsers.length) * 100, '\%')
console.log('users not in reg, but with data', howThe.length)


console.log(usersNotInReg)

