var Chart = (function(window, d3) {
    //https://bl.ocks.org/mbostock/3885304

    var month = [
        'Januar',
        'Februar',
        'März',
        'April',
        'Mai',
        'Juni',
        'Juli',
        'August',
        'September',
        'Oktober',
        'November',
        'Dezember'
    ];

    var week = [
        'Montag',
        'Dienstag',
        'Mittwoch',
        'Donnerstag',
        'Freitag',
        'Samstag',
        'Sonntag'
    ];

    var year = [
        'Viertel',
        'Absolut'
    ];

    var districtsData,
        selectedData,
        selectedDistrict = null,
        selectedChart = 'week',
        selectedMean = 0,
        yDomainMax = 300;

    var parentWidth,
        parentHeight;

    // sets width and height for the bar chart
    updateDimensions();

    d3.select("input[value=\"week\"]").property("checked", true);

    d3.selectAll("input").on("change", selectDataset);

    function selectDataset() {
        selectedChart = this.value;
        selectionChanged();
    }

    var div = d3.select(".toolTip");

    var svg = d3.select("#barchart").select('svg'),
        margin = { top: 20, right: 20, bottom: 50, left: 40 },
        // width = +svg.attr("width") - margin.left - margin.right,
        // height = +svg.attr("height") - margin.top - margin.bottom;
        width = parentWidth - margin.left - margin.right,
        height = parentHeight - margin.top - margin.bottom;

    var x, //= d3.scaleBand().rangeRound([0, width]).padding(0.1),
        y; //= d3.scaleLinear().rangeRound([height, 0]);

    var g = svg.append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


    d3.json('data/district_halts.json', function(error, json) {
        if (error) throw error;

        districtsData = json;
        // selectionChanged();
        loadDistrict(13);
    });

    function render() {
        //get dimensions based on window size
        updateDimensions();

        // //line function for averageLine
        // var averageline = d3.line()
        //     .x(function(d) { return x(d.name); })
        //     .y(function(d) { return y(selectedMean); });
        //     // .y(function(d) { return y(d.value); });


        var t = d3.transition()
            .duration(1000)
            .ease(d3.easeLinear);

        svg
            .attr('width', parentWidth)
            .attr('height', parentHeight);

        width = parentWidth - margin.left - margin.right;
        height = parentHeight - margin.top - margin.bottom;

        x = d3.scalePoint()
            .range([0, width]);
            // .padding(1.);
        // x = d3.scaleLinear().rangeRound([0, width]);
        y = d3.scaleLinear().rangeRound([height, 0]);

        // x.domain(data.map(function(d) { return d.letter; }));

        x.domain(selectedData[0].values.map(function(d) {
            return d.name;
        }));
        //  d3.max(selectedData, function(d) {
        //     return d.value; })]);
        y.domain([0, yDomainMax]);

        svg.select(".axis.axis--y").remove();
        svg.select(".axis.axis--x").remove();

        // Add the X Axis
        g.append("g")
            .attr("class", "axis axis--x")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(x));

        // Add the Y Axis
        g.append("g")
            .attr("class", "axis axis--y")
            .call(d3.axisLeft(y).ticks(10, "s"))
            .append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 6)
            .attr("dy", "0.71em")
            .attr("text-anchor", "end")
            .text("Test");

        // Define the line
        var priceline = d3.line()
            .x(function(d) { return x(d.name); })
            .y(function(d) { return y(d.value); });

        // set the colour scale
        var color = d3.scaleOrdinal(d3.schemeCategory10);

        legendSpace = width/selectedData.length; // spacing for the legend

        // Loop through each symbol / key
        selectedData.forEach(function(d, i) {

            g.append("path")
                .attr("class", "line")
                .style("stroke", function() { // Add the colours dynamically
                    return d.color = color(d.key);
                })
                .attr("id", 'tag' + d.key.replace(/\s+/g, '')) // assign an ID
                .attr("d", priceline(d.values))
            .on('mouseout', mouseout)
            .on('mousemove', mousemove);

            // Add the Legend
            g.append("text")
                .attr("x", (legendSpace / 2) + i * legendSpace) // space legend
                .attr("y", height + (margin.bottom / 2) + 5)
                .attr("class", "legend") // style the legend
                .style("fill", function() { // Add the colours dynamically
                    return d.color = color(d.key);
                })
                .on("click", function() {
                    // Determine if current line is visible
                    var active = d.active ? false : true,
                        newOpacity = active ? 0 : 1;
                    // Hide or show the elements based on the ID
                    d3.select("#tag" + d.key.replace(/\s+/g, ''))
                        .transition().duration(100)
                        .style("opacity", newOpacity);
                    // Update whether or not the elements are active
                    d.active = active;
                })
                .text(d.key);

        });


        // var bar = g.selectAll(".bar")
        //     .remove()
        //     .exit()
        //     .data(selectedData);

        // // bar.exit().remove();

        // bar.enter().append("rect")
        //     .attr("class", "bar")
        //     .attr("x", function(d) {
        //         return x(d.name); })
        //     .attr("y", function(d) {
        //         return y(d.value); })
        //     // .attr("y", function(d) { return y(0); })
        //     .attr("width", x.bandwidth())
        //     .attr("height", function(d) { return height - y(d.value); })
        // .on('mouseout', mouseout)
        // .on('mousemove', mousemove);
        // // .attr("height", function(d) { return height - y(0); })
        // // .merge(bar);

        // removed data:
        // bar.exit().remove();

        // updated data:
        // bar
        //   .transition(t)
        //   .attr("x", function(d) { return x(d.name); })
        //   .attr("y", function(d) { return y(d.value); })
        //   .attr("width", x.bandwidth())
        //   .attr("height", function(d) { return height - y(d.value); });


        // // add lien to chart
        // svg.select(".line").remove();

        // // var line = g.selectAll(".line")
        //     g.append("path")        // Add the valueline path.
        //     .attr("class", "line")
        //     .attr("d", averageline(selectedData));
    }

    function mouseout(d) {
        div.style("display", "none");
    }

    function mousemove(d) {
        div.style("left", d3.event.pageX + 10 + "px");
        div.style("top", d3.event.pageY - 25 + "px");
        div.style("display", "inline-block");
        div.html((Math.round(d.value)) + " Fahrten");
    }


    function updateDimensions() {
        parentWidth = parseInt(d3.select('#barchart').style('width'));
        parentHeight = 0.4 * parentWidth; //aspect ratio is 0.78
    }

    function loadDistrict(id) {
        selectedDistrict = districtsData.districts.find(function(district) {
            return district.id === id;
        });

        selectionChanged();
    }

    function selectionChanged() {
        if (selectedDistrict === null) {
            return;
        }

        if (selectedChart == "week") {
            yDomainMax = 250;
            selectedMean = d3.mean(selectedDistrict.meanWeekDays);
            selectedData = weekData(selectedDistrict);
            render();
        } else if (selectedChart == "month") {
            yDomainMax = 10000;
            selectedMean = selectedDistrict.meanMonth;
            selectedData = monthData(selectedDistrict);
            render();
        } else if (selectedChart == "year") {
            yDomainMax = 500000;
            selectedData = yearData(selectedDistrict);
            render();
        }
    }

    function weekData(district) {
        var data = [{
            "key": "week",
            "values": []
        }, {
            "key": "mean",
            "values": []
        }, {
            "key": "allmean",
            "values": []
        }, ];

        for (var i = 0; i < week.length; i++) {
            data[0].values.push({ 'name': week[i], 'value': district.meanWeekDays[i] });
            data[1].values.push({ 'name': week[i], 'value': district.meanDays });
            data[2].values.push({ 'name': week[i], 'value': districtsData.meanWeekDays[i] });
        }

        return data;
    }

    function monthData(district) {
        var data = [];
        for (var i = 0; i < month.length; i++) {
            data.push({ 'name': month[i], 'value': district.meanYearMonth[i] });
        }
        return data;
    }


    return {
        render: render,
        loadDistrict: loadDistrict
    };
})(window, d3);
