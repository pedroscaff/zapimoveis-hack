/**
 * @file concatenate all areas from given folder
  */
'use strict';

const argv = require('minimist')(process.argv.slice(2));
const colors = require('colors');
if (!argv.folder || typeof argv.folder !== 'string') {
    console.log(colors.red.bold('invalid folder'));
    process.exit(1);
}
let folder = argv.folder;
if (folder[folder.length - 1] !== '/') {
    folder = folder + '/';
}
const path = require('path');
const fs = require('fs');
let normalizedPath = path.join(__dirname, folder);
let allAreas = [];
fs.readdirSync(normalizedPath).forEach(file => {
    allAreas.push(require('./' + folder + file));
});
const sapimoveis = require('./sapimoveis');
const dest = argv.dest || 'concat.json';
sapimoveis.concatJSONs(allAreas, dest).then(json => {
    let stream = fs.createWriteStream(dest, 'utf-8');
    stream.write(JSON.stringify(json), 'utf-8', () => {
        console.log(colors.green.bold(`saved to ${dest}`));
        console.log(colors.green.bold(
            `total properties: ${json.QuantidadeResultados}`
        ));
    });
});
