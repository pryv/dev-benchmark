const superagent = require('superagent');
const charlatan = require('charlatan');
const config = require('../../config.json');

/**
 * Creates a user Accounts;
 * @returns {apiEndpoint}
 */
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
    const res = await superagent.post(pryv.register + 'user').send(data).set('Origin', config.trustedAppOrigin);
    data.apiEndpoint = res.body.apiEndpoint;
    return data;
  } catch (e) {
    console.log( e);
  }
}

module.exports = {
  create: create,
};