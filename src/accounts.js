const superagent = require('superagent');
const charlatan = require('charlatan');

async function create() {
  try {
    const data = {
      "appid": "default", // appId for new method
      "username": charlatan.Lorem.characters(7),
      "password": charlatan.Internet.password(),
      "email": charlatan.Internet.email(),
      "invitationtoken": "o3in4o2",
      "language": "en",
      "referer": "hospital-A",
      "hosting": "pilot"
    };
    const res = await superagent.post(pryv.register + 'user').send(data).set('Origin', 'http://l.rec.la');
    //const res = await superagent.post('https://co1.rec.la/users').send(data).set('Origin', 'http://l.rec.la');
    data.apiEndpoint = res.body.apiEndpoint;
    return data;
  } catch (e) {
    console.log( e);
  }
}

module.exports = {
  create: create,

};