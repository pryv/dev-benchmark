const path = require('path');

const Launcher = require('./lib/Launcher');

PATH_API_SERVER = '../../service-core/dist/components/api-server';

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


async function withConfig(config) {
  const cwd = path.resolve(__dirname, PATH_API_SERVER);
  const strParams = configToParams(config);
  console.log('Launching api Server with: ' + strParams);
  const params = ['start'].concat(strParams);
  const s = new Launcher(cwd, 'yarn', params, 'Startup sequence complete');
  await s.ready();
  console.log('Server Ready');
  return s;
}


if (false) {
  (async () => {
    const s = await withConfig();
    await s.kill();
    console.log('Server Killed');
  })();
}


module.exports = {
  withConfig: withConfig
}