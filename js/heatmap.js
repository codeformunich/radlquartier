var Heatmap = (function(window, d3) {
    var svg,
        rect,
        g,
        data,
        color,
        projection,
        path,
        effectLayer,
        mapLayer,
        features,
        dummyText,
        bigText,
        centered,
        districts,
        margin = {},
        width,
        height,
        div;

    // sets width and height, necessary for mapLayer
    updateDimensions();

    // Load halts data
    d3.json('data/district_halts.json', function(error, districtData) {
        districts = districtData;
    });

    // Load map data
    d3.json('data/munich.geojson', init);

    function init(error, heatData){
        features = heatData.features;

        div = d3.select(".toolTip");

        // Define color scale
        // Update color scale domain based on data
        color = d3.scaleLinear()
            .domain([1, 100, 1000, 3000, d3.max(features, nameLength)])
            // .domain([0, 100, 1000, 3000, 6000])
            .clamp(true)
            .range(['#fff', '#86ccd1', '#17b0da', '#6265ac', '#3a2a85']);

        // Define color scale
        // Update color scale domain based on data
        // var color = d3.scaleSequential(d3.interpolateWarm)
        // .domain([6000, 0]);
        // color.domain([d3.max(features, nameLength), 0]);
        // color.domain([0, d3.max(features, nameLength)]);


        // Create the legend to illustrate the color scale being divergent
        var legendEntries = ['5500', '3000', '1000', '100', '0'];
        var legend = d3.select('.heatmapLegend').selectAll('.legend-entry').data(legendEntries).enter().append('div').attr('class', 'legend-entry');
        legend.append('div').attr('class', 'color-tile').style('background-color', function(d, i) { return color(d); });
        legend.append('div').attr('class', 'description').text(function(d) {
            if( d === '0' ) {
                return d + ' Fahrten';
            }
            else {
                return d;
            }
        });



        // Set svg width & height
        svg = d3.select('#heatmap').select('svg');

        // Add background
        rect = svg.append('rect')
            .attr('class', 'background')
            .on('click', clicked);

        g = svg.append('g');

        effectLayer = g.append('g')
            .classed('effect-layer', true);

        mapLayer = g.append('g')
            .classed('map-layer', true);

        dummyText = g.append('text')
            .classed('dummy-text', true)
            .attr('x', 10)
            .attr('y', 30)
            .style('opacity', 0);

        bigText = g.append('text')
            .classed('big-text', true)
            .attr('x', 20)
            .attr('y', 45);

        projection = d3.geoMercator()
                .scale( width * 150)
                // Center the Map in Munich
                .center([11.542, 48.155])
                .translate([width / 2, height / 2]);

        path = d3.geoPath()
            .projection(projection);

        // Draw each province as a path
        mapLayer.selectAll('path')
            .data(features)
            .enter().append('path')
            .attr('d', path)
            .attr('vector-effect', 'non-scaling-stroke')
            .style('fill', fillFn)
            .style('opacity', 0.9)
            .on('mouseover', mouseover)
            .on('mouseout', mouseout)
            .on('mousemove', mousemove)
            .on('click', clicked);

        render();
    }

    function render() {
        //get dimensions based on window size
        updateDimensions();

        //update svg elements to new dimensions
        svg
          .attr('width', width)
          .attr('height', height);

        rect
            .attr('width', width)
            .attr('height', height);

        projection
            .scale( width * 150 )
            .translate([width / 2, height / 2]);

        d3.selectAll("path").attr('d', path);
    }

    function updateDimensions() {
        width = parseInt(d3.select('#heatmap').style('width'));
        // width = width;
        height = 0.78 * width; //aspect ratio is 0.78
    }



    // Get province name
    function nameFn(d) {
        return d && d.properties ? d.properties.name : null;
    }

    // Get province name length
    function getDistrict(d) {
        var n = nameFn(d);

        var index = districts.findIndex(function (district) {
          return district.name === n;
        });

        return districts[index];
    }

    // Todo rename getTotalCount
    function nameLength(d) {
      return getDistrict(d).meanMonth;
    }

    // Get province color
    function fillFn(d) {
        return color(nameLength(d));
    }

    // When clicked, zoom in
    function clicked(d) {
        var x, y, k;

        // Compute centroid of the selected path
        if (d && centered !== d) {
            var centroid = path.centroid(d);
            x = centroid[0];
            y = centroid[1];
            k = 4;
            centered = d;
        } else {
            x = width / 2;
            y = height / 2;
            k = 1;
            centered = null;
        }

        // Highlight the clicked province
        mapLayer.selectAll('path')
            .style('fill', function(d) {
                return centered && d === centered ? '#ffc484' : fillFn(d);
            });


        if (centered === null) {
            App.selectNewDistrict(0);
        }
        else {
            App.selectNewDistrict(d.properties.cartodb_id);
        }

        // // Zoom
        // g.transition()
        //     .duration(750)
        //     .attr('transform', 'translate(' + width / 2 + ',' + height / 2 + ')scale(' + k + ')translate(' + -x + ',' + -y + ')');
    }

    // $('#hexmapCollapse').on('shown.bs.collapse', function () {
    //     // Hexmap.init();
    //     Hexmap.loadDistrict(d.properties.cartodb_id);
    // });

    function mouseover(d) {

        // Highlight hovered province
        d3.select(this).style('fill', '#ffc484');

        // Draw effects
        textArt(getDistrict(d));
    }

    function mouseout(d) {

        // Reset province color
        mapLayer.selectAll('path')
            .style('fill', function(d) {
                return centered && d === centered ? '#ffc484' : fillFn(d);
            });

        // Remove effect text
        effectLayer.selectAll('text').transition()
            .style('opacity', 0)
            .remove();

        // Clear province name
        bigText.text('');

        div.style("display", "none");
    }

    function mousemove(d) {
        var district = getDistrict(d);

        div.style("left", d3.event.pageX + 10 + "px");
        div.style("top", d3.event.pageY - 25 + "px");
        div.style("display", "inline-block");
        div.html((district.name) + "<br>" + (Math.round(district.meanMonth)) + " Fahrten");
    }

    // Gimmick
    // Just me playing around.
    // You won't need this for a regular map.

    function textArt(district) {
        bigText.text(district.name);
            // .text(district.name + ': ' + Math.round(district.meanMonth) + ' Fahrten enden im Monat hier');

    }

    return {
        render : render
    };
})(window, d3);

