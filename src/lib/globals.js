/**
 * Set a Pryv lib-js instance "Global"
 */

const config = require('../../config.json');
const Pryv = require('pryv');

async function init() {
  const service = new Pryv.Service(config.serviceInfo);
  const pryv = await service.info();
  pryv.service = service;
  Object.assign(global, {pryv: pryv});
}


module.exports = {
  init: init,
}