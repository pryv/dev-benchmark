const path = require('path');
const { spawn } = require('child_process');
const kill = require('tree-kill');

PATH_API_SERVER = '../../service-core/dist/components/api-server';


class ApiServer { 

  server;
  waitForReady;
  waitForKill;
  isReady;
  isKilled;

  constructor(config) {
    let readyResolve;
    this.waitForReady = new Promise((resolve, reject) => {
      readyResolve = resolve;
    });
    let killedResolve;
    this.waitForKill = new Promise((resolve, reject) => {
      killedResolve = resolve;
    });

    const params = configToParams(config);
    console.log(params);
    const options = {
      cwd: path.resolve(__dirname, PATH_API_SERVER),
      env: process.env,
      detached: false
    };

    this.server = spawn('yarn', ['start'].concat(params), options);

    this.server.stdout.on('data', (data) => {
      console.log(`stdout: ${data}`);
      if (data.includes('Startup sequence complete') && ! this.isReady) {
        this.isReady = true;
        readyResolve();
      }
    });

    this.server.stderr.on('data', (data) => {
      console.error(`stderr: ${data}`);
    });

    this.server.on('close', (code) => {
      console.log(`child process closed with code ${code}`);
    });

    this.server.on('exit', (code) => {
      this.isKilled = true;
      killedResolve();
      console.log(`child process exited with code ${code}`);
    });
  }

  async ready() {
    if (this.isReady) return true;
    await this.waitForReady;
  }

  async kill() {
    if (this.isKilled) return true;
    kill(this.server.pid, function(err) {
      console.log('Tree Kill done');
    });
    //this.server.kill();
    console.log("Kill pid: "+ this.server.pid);
    await this.waitForKill;
  }

}

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
  const s = new ApiServer(config);
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