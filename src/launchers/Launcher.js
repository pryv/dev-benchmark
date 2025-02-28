/**
 * @license
 * Copyright (C) Pryv https://pryv.com
 * This file is part of Pryv.io and released under BSD-Clause-3 License
 * Refer to LICENSE file
 */
const { spawn } = require('child_process');
const kill = require('tree-kill');

class Launcher { 

  server;
  waitForReady;
  waitForKill;
  isReady;
  isKilled;
  speak;

  constructor(cwd, command, params, readyLine, speak) {
    let readyResolve;
    this.speak = speak || false;
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

    this.log('Launcher: ' + command + ' ' + params.join(' '));
    this.server = spawn(command, params, options);
    

    this.server.stdout.on('data', (data) => {
      this.log(`stdout: ${data}`);
      if (data.includes(readyLine) && ! this.isReady) {
        this.isReady = true;
        readyResolve();
      }
    });

    this.server.stderr.on('data', (data) => {
      console.error(`stderr: ${data}`);
    });

    this.server.on('close', (code) => {
      this.log(`child process closed with code ${code}`);
    });

    this.server.on('error', (error) => {
      console.error(`error: ${error}`);
    });

    this.server.on('exit', (code) => {
      this.isKilled = true;
      killedResolve();
      this.log(`child process exited with code ${code}`);
    });
  }

  log(str) {
    if (this.speak || str.includes('err')) console.log(`Launcher [${this.speak}]: ${str}`);
  }

  async ready() {
    if (this.isReady) return true;
    await this.waitForReady;
  }

  async kill() {
    this.log('Kill request');
    if (this.isKilled) return true;
    const speak = this.speak;
    kill(this.server.pid,'SIGINT', function(err) {
      this.log('Tree Kill done');
    }.bind(this));
    //this.server.kill();
    this.log('Kill pid: '+ this.server.pid);
    await this.waitForKill;
  }

}

module.exports = Launcher;