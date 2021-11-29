const superagent = require('superagent');
const config = require('../config.json');
const charlatan = require('charlatan');
const Pryv = require('pryv');

const userData = {
  username: charlatan.Lorem.characters(7),
  password: charlatan.Internet.password(),
  email: charlatan.Internet.email()
}


/**
 * Creates a user Accounts;
 * @returns {apiEndpoint}
 */
async function create() {
  try {
    const data = {
      "appId": "default", // appId for new method
      "username": userData.username,
      "password": userData.password,
      "email": userData.email,
    };
    const res = await superagent.post('http://localhost:3000/users').send(data).set('Origin', config.trustedAppOrigin);
    data.apiEndpoint = res.body.apiEndpoint;
    
    return data;
  } catch (e) {
    end('create', e)
  }
}

async function createData(user) {
  try {
    const { token } = Pryv.utils.extractTokenAndApiEndpoint(user.apiEndpoint);
    // create access
    const res1 = await superagent.post(user.apiEndpoint + 'accesses')
      .set('Origin', config.trustedAppOrigin)
      .send({"expireAfter": 5184000,"type": "app", "name":"test by amourier", "permissions":[{"level":"manage", "streamId":"*"},{"defaultName": "ACCOUNT", "streamId":":_system:account","level":"manage"}]});
    const access = res1.body.access;
    if (access == null) {
      end('create access', res1.body);
    }
    const res2 = await superagent.post(access.apiEndpoint)
      .set('Origin', config.trustedAppOrigin)
      .send([{
          method: 'streams.create',
          params: {
            id: 'default',
            name: 'default',
          }
        },
        {
          method: 'events.create',
          params: {
            "streamId": "default",
            "type": "note/text",
            "content": "Hello World"
          }
        }
      ]);
    data = res2.body;
    return data;
  } catch (e) {
    end('data', e)
  }
}

 async function deleteU(user) {
  try {
    const { token } = Pryv.utils.extractTokenAndApiEndpoint(user.apiEndpoint);
    const res = await superagent.delete('http://localhost:3000/users/' + user.username)
      .set('Authorization', token)
      .set('Origin', config.trustedAppOrigin);
    data = res.body;
    return data;
  } catch (e) {
    end('delete', e)
  }
}

function end(task, e) {
  console.log(task, e.status, e.response?.body || e);
  process.exit(1);
}

(async () => { 
  let i = 0;
  while (i < 100) {
    const user = await create();
    const data = await createData(user);
    const deletion = await deleteU(user);
    console.log(i, deletion.userDeletion)
    i++;
  }
})();