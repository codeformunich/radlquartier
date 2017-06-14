Geo Json map of Colombia
========================

Based on the [Map of Thailand](https://gist.github.com/kristw/7fbf031e3205a8a453a8) by Master [Krist Wongsuphasawat](twitter.com/kristw), a simple map of Colombia using [GeoJSON and D3.js](https://github.com/mbostock/d3/wiki/Geo-Paths)

As in Krist example:

* Each province is color-coded by the length of its name in English.
* Hover each province to see text effects.
* New font is chosen randomly every time you change the province.
* Click on a province to zoom in. Click somewhere else to zoom out.

I obtained the [Colombian GeoJSON](https://gist.githubusercontent.com/john-guerra/43c7656821069d00dcbc/raw/be6a6e239cd5b5b803c6e7c2ec405b793a9064dd/Colombia.geo.json) by transforming the [Colombian shapefiles by Maurix Suárez](https://sites.google.com/site/seriescol/shapes), using:

```
ogr2ogr   -f GeoJSON -t_srs EPSG:4326  Colombia.geo.json   depto.shp
```
