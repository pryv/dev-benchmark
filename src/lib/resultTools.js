/**
 * @license
 * Copyright (C) Pryv https://pryv.com
 * This file is part of Pryv.io and released under BSD-Clause-3 License
 * Refer to LICENSE file
 */
/**
 * Utils to name, save and show results
 */
const os = require('os');
const mkdirp = require('mkdirp');
const fs = require('fs');

const d = new Date();
const baseFileName = d.toISOString().replace(/:/g, '-').replace(/\./g, '-') + '-' + os.hostname();




/**
 * 
 * @param {string} version subdirectory in result dir
 * @param {string} name of the test (config key)
 * @param {*} data data to save 
 */
async function save(version, name, res) {
  const resultPath = 'results/' + version;
  await mkdirp(resultPath);
  fs.writeFileSync(resultPath + '/' + baseFileName + '-' + name + '-full.json', JSON.stringify(res.results, null, 2));
  fs.writeFileSync(resultPath + '/' + baseFileName + '-' + name + '.json', JSON.stringify(res.abstract, null, 2));
}

function show(name, res) {
  let output = name + ':>> ';
  let errors = [];
  for (const run of res.abstract.runs) {
    output += run.title + ': ' + run.rate;
    if (run.errors) output += ' with ' + run.errors + ' errors |';
    output += '  ';
  }
  console.log(output);
}

module.exports = {
  save,
  show
}