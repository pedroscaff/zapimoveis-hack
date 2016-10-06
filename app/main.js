'use strict';

let L = require('leaflet');
require('leaflet.markercluster');

let map = new L.Map('map', {
        center: [-19.91946, -43.94274],
        zoom: 13
    })
    .addLayer(new L.TileLayer(
        'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
    ));

function onMarkerClick(e) {
    console.log(e);
}

let markers = new L.markerClusterGroup();
markers.on('click', onMarkerClick);

const bh = require('json!./../data/concat.json');
bh.Imoveis.forEach(imovel => {
    let lat = imovel.Coordenadas.Latitude;
    let lon = imovel.Coordenadas.Longitude;
    markers.addLayer(L.marker([lat, lon], {title: imovel.ID}));
});

map.addLayer(markers);
