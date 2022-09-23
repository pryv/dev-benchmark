const path = require('path');
const Launcher = require('./Launcher');
const config = require('../../config.json');

PATH_API_SERVER = '../../' + config.serviceCorePath+ '/dist/components/api-server';

function configToParams(config) {
  if (! config) return [];
  const res = [];

  function inspect(path, o) {
    if (typeof o !== 'object') {
      let v = o;
      if (typeof v === 'boolean') {
        v = o ? 1 : 0; // convert boolean to integers because nconf parse them as "string"
      }

      res.push('--' + path.join('.') + '=' + v);
      return;
    }
    if (Array.isArray(o)) throw(new Error('Array not supported ' + path + ' => ' + o));
    for (let key of Object.keys(o)) {
      const newPath = path.slice(); // make a copy
      newPath.push(key);
      inspect(newPath, o[key]);
    }
  }
  inspect([], config);
  return res;
}


async function withConfig(config, speak) {
  const cwd = path.resolve(__dirname, PATH_API_SERVER);
  const strParams = configToParams(config);
  console.log('Launching api Server with params: ' + strParams.join(' '));
  const params = ['start','api-server'].concat(strParams);
  
  const s = new Launcher(cwd, 'just', params, 'Startup sequence complete', speak);
  await s.ready();
  console.log('Server Ready');
  return s;
}

module.exports = {
  withConfig: withConfig
}