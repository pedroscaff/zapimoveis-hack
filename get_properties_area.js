/**
  @file saves all properties on given area
 */

'use strict';

const colors = require('colors');
const argv = require('minimist')(process.argv.slice(2));
if (
    (!argv.latmin || !argv.latmax || !argv.lonmin || !argv.lonmax) &&
    !argv.coordfile
) {
    console.log(colors.red.bold(
        `missing coordinates, define an area with one of these options:
        --> latmin, latmax, lonmin, lonmax
        --> a json with those four properties (--coordfile)`
    ));
    process.exit(1);
}

const dest = argv.dest || 'properties.json';
const fs = require('fs');
const sapimoveis = require('./sapimoveis');

let coordinates;
if (argv.coordfile) {
    coordinates = require(`./${argv.coordfile}`);
} else {
    coordinates.latmin = Number(argv.latmin);
    coordinates.latmax = Number(argv.latmax);
    coordinates.lonmin = Number(argv.lonmin);
    coordinates.lonmax = Number(argv.lonmax);
}

const grid_size = Number(argv.gridsize) || 20;
sapimoveis.getPropertiesArea(coordinates, grid_size).then(json => {
    let stream = fs.createWriteStream(dest, 'utf-8');
    stream.write(JSON.stringify(json), 'utf-8', () => {
        console.log(colors.green.bold(`saved to ${dest}`));
        console.log(colors.green.bold(
            `total properties: ${json.QuantidadeResultados}`
        ));
    })
});
