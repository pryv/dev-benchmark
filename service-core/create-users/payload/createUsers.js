const request = require('superagent');

const payload = require('./users.json')[0];

request.post('https://reg.obpmprod.ch/user')
    .send(payload)
    .then(res => {
        console.log(res.body)
    })
    .catch((e) => {
        console.log('got err', e)
    })