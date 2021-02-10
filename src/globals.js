const superagent = require('superagent');
const serviceInfo = 'http://127.0.0.1:3000/reg/service/info';
const Pryv = require('pryv');

async function init() {
  const service = new Pryv.Service(serviceInfo);
  const pryv = await service.info();
  pryv.service = service;
  Object.assign(global, {pryv: pryv});
}


module.exports = {
  init: init,
}