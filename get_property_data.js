'use strict';

const fs = require('fs');
const colors = require('colors');
let json = require('./concat.json');
const sapimoveis = require('./sapimoveis');

let count = 1;
let total = json.Imoveis.slice(0, 1000).length;
json.Imoveis.slice(0, 1000).forEach(imovel => {
    sapimoveis.getPropertyData([imovel.ID]).then(res => {
        for (let key in res[0]) {
            imovel[key] = res[0][key];
        }
        count++;
        if (count === total) {
            let stream = fs.createWriteStream('bh-0-1000.json', 'utf-8');
            stream.write(JSON.stringify(json), 'utf-8', () => {
                console.log('saved!');
            });
        }
    });
});
