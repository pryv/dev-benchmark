const { spawn } = require('child_process');
const kill = require('tree-kill');

class Launcher { 

  server;
  waitForReady;
  waitForKill;
  isReady;
  isKilled;

  constructor(cwd, command, params, readyLine) {
    let readyResolve;
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
    console.log('Launcher: ' + command + ' ' + params);

    this.server.stdout.on('data', (data) => {
      console.log(`stdout: ${data}`);
      if (data.includes(readyLine) && ! this.isReady) {
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

    this.server.on('error', (error) => {
      console.error(`error: ${error}`);
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
    console.log('Kill request');
    if (this.isKilled) return true;
    kill(this.server.pid, function(err) {
      console.log('Tree Kill done');
    });
    //this.server.kill();
    console.log("Kill pid: "+ this.server.pid);
    await this.waitForKill;
  }

}

module.exports = Launcher;