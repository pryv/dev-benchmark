const superagent = require('superagent');
const charlatan = require('charlatan');

async function create(apiEndPoint, streamData) {
  apiEndPoint = apiEndPoint || pryv.account.apiEndpoint;
  streamData = streamData || {name: charlatan.Name.name() }
  try {
    const res = await superagent.post(apiEndPoint + 'streams').send(streamData);
    return res.body.stream;
  } catch (e) {
    console.log(e.response.text);
  }
}

module.exports = {
  create: create,

};