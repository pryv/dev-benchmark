const superagent = require('superagent');
const charlatan = require('charlatan');

async function create(apiEndPoint, permissions) {
  apiEndPoint = apiEndPoint || pryv.account.apiEndpoint;
  permissions = permissions || [{streamId: '*', level: 'manage'}];
  try {
    const data = {
      name: charlatan.Name.name(),
      permissions: permissions
    };
    const res = await superagent.post(apiEndPoint + 'accesses').send(data);
    return res.body.access;
  } catch (e) {
    console.log(e.response.text);
  }
}

module.exports = {
  create: create,

};