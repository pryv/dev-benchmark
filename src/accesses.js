const superagent = require('superagent');
const charlatan = require('charlatan');

async function create(apiEndPoint, permissions) {
  if (pryv.account && pryv.account.apiEndpoint) {
    apiEndPoint = apiEndPoint || pryv.account.apiEndpoint;
  }
  permissions = permissions || [{streamId: '*', level: 'manage'}];
  try {
    const data = {
      name: charlatan.Name.name(),
      permissions: permissions
    };

    const res = await superagent.post(apiEndPoint + 'accesses').send(data);
    return res.body.access;
  } catch (e) {
    const msg = e.response ? e.response.text : e.message;
    console.log( msg);
  }
}

module.exports = {
  create: create,

};