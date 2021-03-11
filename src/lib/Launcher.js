const { spawn } = require('child_process');
const kill = require('tree-kill');

class Launcher { 

  server;
  waitForReady;
  waitForKill;
  isReady;
  isKilled;
  speak;

  constructor(cwd, command, params, readyLine, shush) {
    let readyResolve;
    this.speak = false;
    this.waitForReady = new Promise((resolve, reject) => {
      readyResolve = resolve;
    });
    let killedResolve;
    this.waitForKill = new Promise((resolve, reject) => {
      killedResolve = resolve;
    });

    const options = {
      cwd: cwd,
      env: process.env,
      detached: false
    };

    this.server = spawn(command, params, options);
    if (this.speak) console.log('Launcher: ' + command + ' ' + params);

    this.server.stdout.on('data', (data) => {
      if (this.speak) console.log(`stdout: ${data}`);
      if (data.includes(readyLine) && ! this.isReady) {
        this.isReady = true;
        readyResolve();
      }
    });

    this.server.stderr.on('data', (data) => {
      console.error(`stderr: ${data}`);
    });

    this.server.on('close', (code) => {
      if (this.speak) console.log(`child process closed with code ${code}`);
    });

    this.server.on('error', (error) => {
      console.error(`error: ${error}`);
    });

    this.server.on('exit', (code) => {
      this.isKilled = true;
      killedResolve();
      if (this.speak) console.log(`child process exited with code ${code}`);
    });
  }

  async ready() {
    if (this.isReady) return true;
    await this.waitForReady;
  }

  async kill() {
    if (this.speak) console.log('Kill request');
    if (this.isKilled) return true;
    const speak = this.speak;
    kill(this.server.pid, function(err) {
      if (speak) console.log('Tree Kill done');
    });
    //this.server.kill();
    if (this.speak) console.log("Kill pid: "+ this.server.pid);
    await this.waitForKill;
  }

}

module.exports = Launcher;