/**
 * @module sapimoveis - helper functions to get and process sapimoveis data
 */

'use strict';

module.exports = {
    /**
     * @function concatJSONs - concatenates all areas from array
     * @param {Array} areas - areas to be concatenated
     */
    concatJSONs: function(areas) {
        // use first area as base
        let unified = areas[0];
        let ids = unified.Imoveis.map(x => x.ID);
        let p = new Promise(resolve => {
            areas.forEach(area => {
                area.Imoveis.forEach(imovel => {
                    if (ids.indexOf(imovel.ID) === -1) {
                        unified.Imoveis.push(imovel);
                        ids.push(imovel.ID);
                    }
                });
            });
            unified.QuantidadeResultados = ids.length;
            resolve(unified);
        });

        return p;
    },

    /**
     * @typedef {Object} Coordinates
     * @property {Number} latmin
     * @property {Number} lonmin
     * @property {Number} latmax
     * @property {Number} lonmax
     */

    /**
     * @typedef {Object} Center
     * @property {Number} lat
     * @property {Number} lon
     */

    /**
     * @function getProperties - return properties from given area
     * @param {Coordinates} coordinates - Coordinates Object
     * @param {Center} center - circle center (sapimoveis api searches within radius)
     * @returns Promise that resolves to json of properties from given area
     */
    getProperties: function(coordinates, center) {
        let options = {
            url: 'http://www.zapimoveis.com.br' +
            '/BuscaMapa/ObterOfertasBuscaMapa/',
            method: 'POST',
            headers: {
                'cache-control': 'no-cache',
                'content-type': 'multipart/form-data',
                'Access-Control-Allow-Origin': true
            },
            formData: {
                parametrosBusca: JSON.stringify(parametrosBusca)
            },
            json: true
        };
        let xhr = new XMLHttpRequest();
        xhr.open('POST', options.url);
        let parametrosBusca = {
            CoordenadasAtuais: {
                Latitude: center.lat,
                Longitude: center.lon
            },
            CoordenadasMinimas: {
                Latitude: coordinates.latmin,
                Longitude: coordinates.lonmin
            },
            CoordenadasMaximas: {
                Latitude: coordinates.latmax,
                Longitude: coordinates.lonmax
            },
            Transacao: 'Venda',
            TipoOferta: 'Imovel'
        };


        let p = new Promise((resolve) => {
            request(options, (err, response, body) => {
                if (err) {
                    throw new Error(err);
                } else {
                    resolve(body.Resultado);
                }
            });
        });
        return p;
    },

    /**
     * @function getPropertyData
     * @param {Array} ids - array with ids of properties
     */
    getPropertyData: function(ids) {
        let p = new Promise(resolve => {
            let data = new FormData();
            data.append('listIdImovel', `[${ids.toString()}]`);

            let xhr = new XMLHttpRequest();
            xhr.withCredentials = true;

            xhr.addEventListener('readystatechange', function () {
                if (this.readyState === 4) {
                    console.log(this.responseText);
                    resolve(this.responseText);
                }
            });

            xhr.open(
                'POST',
                'http://www.zapimoveis.com.br/BuscaMapa' +
                    '/ObterDetalheImoveisMapa/',
                true
            );
            xhr.setRequestHeader('cache-control', 'no-cache');
            xhr.setRequestHeader('Access-Control-Allow-Origin', true);
            xhr.send(data);
        });
        // let options = {
        //     url: 'http://www.zapimoveis.com.br' +
        //         '/BuscaMapa/ObterDetalheImoveisMapa/',
        //     method: 'POST',
        //     headers: {
        //         'cache-control': 'no-cache',
        //         'content-type': 'multipart/form-data',
        //         'Access-Control-Allow-Origin': true
        //     },
        //     formData: {
        //         listIdImovel: `[${ids.toString()}]`
        //     },
        //     json: true
        // };
        // let p = new Promise((resolve) => {
        //     request(options, (err, response, body) => {
        //         if (err) {
        //             throw new Error(err);
        //         } else {
        //             resolve(body.Resultado);
        //         }
        //     });
        // });
        return p;
    },

    /**
     * @function getPropertiesArea
     * @param {Coordinates} coordinates - delimited area
     * @param {Number} grid_size - grid size for iterations
     * @return {Promise} p - resolves to json of properties
     */
    getPropertiesArea: function(coordinates, grid_size) {
        function getCenterCoordinates(coordinates) {
            let center = {};
            center.lat = (coordinates.latmin + coordinates.latmax) / 2;
            center.lon = (coordinates.lonmin + coordinates.lonmax) / 2;
            return center;
        }
        let properties = [];
        let latStep = Math.abs(
            coordinates.latmax - coordinates.latmin) / grid_size;
        let lonStep = Math.abs(
            coordinates.lonmax - coordinates.lonmin) / grid_size;
        let p = new Promise(resolve => {
            for (let itNumber = 0; itNumber < grid_size; itNumber++) {
                let c = {
                    latmin: coordinates.latmin + latStep * itNumber,
                    latmax: coordinates.latmin + latStep * (itNumber + 1),
                };
                for (let itNumber2 = 0; itNumber2 < grid_size; itNumber2++) {
                    c.lonmin = coordinates.lonmin + lonStep * itNumber2;
                    c.lonmax = coordinates.lonmax + lonStep * (itNumber2 + 1);
                    let req = this.getProperties(c, getCenterCoordinates(c));
                    req.then(result => {
                        properties.push(result);
                        // if this is the last pending request, concat jsons
                        if (properties.length === grid_size * grid_size) {
                            this.concatJSONs(properties).then(json => {
                                resolve(json);
                            });
                        }
                    });
                }
            }
        });

        return p;
     }
}
