var dataURLPoly = './data/geo.json';
// countries data taken from https://github.com/johan/world.geo.json 
fetch(dataURLPoly).then(function (res) {
  return res.json()
})
.then(function (geojson) {
  var point = { type: 'Point', coordinates: [121.265374, 31.375869]};
  geojson.features.push({ geometry: point, type: 'Feature', properties: { name: '嘉定区政府' } });
  return geojson;
})
.then(drawGeoJsonToSvg);
//var dataURLPoint = './data/capitals.json';
//getjson(dataURLPoint,drawGeoJSON);

function drawGeoJsonToSvg(geojson, elementId) {
  // covert wgs84 data to Web Mercator projection
  var geojson3857 = reproject.reproject(
    geojson,'EPSG:4326','EPSG:3857',proj4.defs);
  var svgMap = document.getElementById(elementId || 'map');
  var convertor = geojson2svg(
    { 
      viewportSize: { width:800, height:700 },
      attributes: [
        {
          property: 'properties.Name',
          type: 'dynamic',
          key: 'name'
        },
        {
          property: 'style',
          type: 'static',
          value: 'stroke:#006600; fill: #F0F8FF; stroke-width:0.5px;'
        },
        {
          property: 'vector-effect',
          type: 'static',
          value: 'non-scaling-stroke'
        }
      ],
      explode: false,
      mapExtent: {
        left: 13481300,
        right: 13508425,
        bottom: 3666700,
        top: 3697700
      }
    }
  );
  var svgElements = convertor.convert(geojson3857);
  var parser = new DOMParser();
  svgElements.forEach(function(svgStr) {
    var svg = parseSVG(svgStr);
    svgMap.appendChild(svg);
  });
}
//parseSVG from http://stackoverflow.com/questions/3642035/jquerys-append-not-working-with-svg-element
function parseSVG(s) {
  var div= document.createElementNS('http://www.w3.org/1999/xhtml', 'div');
  div.innerHTML= '<svg xmlns="http://www.w3.org/2000/svg">'+s+'</svg>';
  var frag= document.createDocumentFragment();
  while (div.firstChild.firstChild)
      frag.appendChild(div.firstChild.firstChild);
  return frag;
}
