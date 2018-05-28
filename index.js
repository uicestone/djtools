const fs = require('fs');
const { arcgisToGeoJSON } = require('@esri/arcgis-to-geojson-utils');
var geojson2svg = require('geojson2svg');

const jsonString = fs.readFileSync('./data/raw.json');
const arcGisData = JSON.parse(jsonString);
const geoJsonData = arcgisToGeoJSON(fixArcGisData(arcGisData));
fs.writeFileSync('./data/geo.json', JSON.stringify(geoJsonData), 'utf8');

const converter = geojson2svg({
  viewportSize: { width:800, height:800 },
  attributes: {
    'style': 'stroke:#006600; fill: #F0F8FF; stroke-width:0.5px;',
    'vector-effect':'non-scaling-stroke'
  },
  explode: false,
  mapExtent: findBorders(geoJsonData)
});

const svgStrings = converter.convert(geoJsonData);

fs.writeFileSync(`./maps/map-unprojected.svg`, `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="800">${svgStrings}</svg>`, 'utf8');

function fixArcGisData (polygonArcGisData) {
  polygonArcGisData.features.forEach(feature => {
    feature.geometry.Polygon.forEach(polygon => {
      polygon.forEach(point => {
        point[0] += 0.0045;
        point[1] -= 0.0019;
      })
    });
    feature.geometry = {rings:feature.geometry.Polygon}
  });
  return polygonArcGisData;
}

function findBorders (geoJsonData) {
  let top, right, bottom, left;
  
  geoJsonData.features.forEach(feature => {
    feature.geometry.coordinates.forEach(coordinate => {
      coordinate.forEach(point => {
        if (!top || point[1] > top)
          top = point[1];
        if (!right || point[0] > right)
          right = point[0];
        if (!bottom || point[1] > bottom)
          bottom = point[1];
        if (!left || point[0] < left)
          left = point[0];
      });
    })
  });

  return { top, right, bottom, left };
}
