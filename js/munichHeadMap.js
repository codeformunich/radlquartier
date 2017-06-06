
    var width = 960,
        height = 700,
        centered,
        districts;

    // Define color scale
    var color = d3.scaleLinear()
        .domain([0, 6000])
        .clamp(true)
        .range(['#fff', '#409A99']);

    // var color = d3.scaleSequential(d3.interpolateWarm)
    // .domain([6000, 0]);

    var projection = d3.geoMercator()
        .scale(110000)
        // Center the Map in Munich
        .center([11.55, 48.15])
        // .center([11.581980599999952, 48.1351253])
        .translate([width / 2, height / 2]);

    var path = d3.geoPath()
        .projection(projection);

    // Set svg width & height
    var svg = d3.select('svg')
        .attr('width', width)
        .attr('height', height);

    // Add background
    svg.append('rect')
        .attr('class', 'background')
        .attr('width', width)
        .attr('height', height)
        .on('click', clicked);

    var g = svg.append('g');

    var effectLayer = g.append('g')
        .classed('effect-layer', true);

    var mapLayer = g.append('g')
        .classed('map-layer', true);

    var dummyText = g.append('text')
        .classed('dummy-text', true)
        .attr('x', 10)
        .attr('y', 30)
        .style('opacity', 0);

    var bigText = g.append('text')
        .classed('big-text', true)
        .attr('x', 20)
        .attr('y', 45);

    // Load halts data
    d3.json('district.json', function(error, districtData) {
        districts = districtData.districts;
    });

    // Load map data
    d3.json('munich.geojson', function(error, mapData) {
        var features = mapData.features;

        // Update color scale domain based on data
        // color.domain([d3.max(features, nameLength), 0]);
        color.domain([0, d3.max(features, nameLength)]);

        // Draw each province as a path
        mapLayer.selectAll('path')
            .data(features)
            .enter().append('path')
            .attr('d', path)
            .attr('vector-effect', 'non-scaling-stroke')
            .style('fill', fillFn)
            .on('mouseover', mouseover)
            .on('mouseout', mouseout)
            .on('click', clicked);
    });

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
      return getDistrict(d).monthlyAverage;
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
                return centered && d === centered ? '#D5708B' : fillFn(d);
            });

        // Zoom
        g.transition()
            .duration(750)
            .attr('transform', 'translate(' + width / 2 + ',' + height / 2 + ')scale(' + k + ')translate(' + -x + ',' + -y + ')');
    }

    function mouseover(d) {
        // Highlight hovered province
        d3.select(this).style('fill', 'orange');

        // Draw effects
        textArt(getDistrict(d));
    }

    function mouseout(d) {
        // Reset province color
        mapLayer.selectAll('path')
            .style('fill', function(d) {
                return centered && d === centered ? '#D5708B' : fillFn(d);
            });

        // Remove effect text
        effectLayer.selectAll('text').transition()
            .style('opacity', 0)
            .remove();

        // Clear province name
        bigText.text('');
    }

    // Gimmick
    // Just me playing around.
    // You won't need this for a regular map.

    function textArt(district) {
        bigText
        // .style('font-family', fontFamily)
            .text(district.name + ': sum ' + district.totalCount + ' monthly average ' + district.monthlyAverage);

    }
