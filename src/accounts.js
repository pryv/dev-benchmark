const superagent = require('superagent');
const charlatan = require('charlatan');

async function create() {
  try {
    const data = {
      "appid": "default",
      "username": charlatan.Internet.userName().replace('_','-'),
      "password": charlatan.Internet.password(),
      "email": charlatan.Internet.email(),
      "invitationtoken": "o3in4o2",
      "language": "en",
      "referer": "hospital-A"
    };
    const res = await superagent.post(pryv.register + 'user').send(data).set('Origin', 'http://l.rec.la');
    data.apiEndpoint = res.body.apiEndpoint;
    return data;
  } catch (e) {
    console.log( e);
  }
}

module.exports = {
  create: create,

};