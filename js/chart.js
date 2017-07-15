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

    var districtsData,
        selectedData,
        selectedDistrict = null,
        selectedChart = 'week',
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

    var svg = d3.select("#barchart").select('svg'),
        margin = { top: 20, right: 20, bottom: 30, left: 40 },
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
        selectionChanged();
    });

    function render() {
        //get dimensions based on window size
        updateDimensions();

        //line function for averageLine
        var averageline = d3.line()
            .x(function(d) { return x(d.name); })
            .y(function(d) { return y(selectedDistrict.meanMonth); });

        var t = d3.transition()
            .duration(1000)
            .ease(d3.easeLinear);

        svg
          .attr('width', parentWidth)
          .attr('height', parentHeight);

        width = parentWidth - margin.left - margin.right;
        height = parentHeight - margin.top - margin.bottom;

        x = d3.scaleBand().rangeRound([0, width]).padding(0.1);
        y = d3.scaleLinear().rangeRound([height, 0]);

        x.domain(selectedData.map(function(d) {
            return d.name; }));
        //  d3.max(selectedData, function(d) {
        //     return d.value; })]);
        y.domain([0, yDomainMax]);

        svg.select(".axis.axis--y").remove();
        svg.select(".axis.axis--x").remove();

        g.append("g")
            .attr("class", "axis axis--x")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(x));

        g.append("g")
            .attr("class", "axis axis--y")
            .call(d3.axisLeft(y).ticks(10, "s"))
            .append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 6)
            .attr("dy", "0.71em")
            .attr("text-anchor", "end")
            .text("Test");

        var bar = g.selectAll(".bar")
            .remove()
            .exit()
            .data(selectedData);

        // bar.exit().remove();

        bar.enter().append("rect")
            .attr("class", "bar")
            .attr("x", function(d) {
                return x(d.name); })
            .attr("y", function(d) {
                return y(d.value); })
            // .attr("y", function(d) { return y(0); })
            .attr("width", x.bandwidth())
            .attr("height", function(d) {
                return height - y(d.value); });
        // .attr("height", function(d) { return height - y(0); })
        // .merge(bar);

        // removed data:
        // bar.exit().remove();

        // updated data:
        // bar
        //   .transition(t)
        //   .attr("x", function(d) { return x(d.name); })
        //   .attr("y", function(d) { return y(d.value); })
        //   .attr("width", x.bandwidth())
        //   .attr("height", function(d) { return height - y(d.value); });

        g.append("path")        // Add the valueline path.
            .attr("class", "line")
            .attr("d", averageline(selectedData));
    }

    function updateDimensions() {
        parentWidth = parseInt(d3.select('#barchart').style('width'));
        parentHeight = 0.4 * parentWidth; //aspect ratio is 0.78
    }

    function selectionChanged() {
        if (selectedDistrict === null) {
            return;
        }

        if (selectedChart == "week") {
            yDomainMax = 250;
            selectedData = weekData(selectedDistrict);
            render();
        } else if (selectedChart == "month") {
            yDomainMax = 10000;
            selectedData = monthData(selectedDistrict);
            render();
        } else if (selectedChart == "year") {
            yDomainMax = 50000;
            selectedData = weekData(selectedDistrict);
            render();
        }
    }

    function weekData(district) {
        var data = [];
        for (var i = 0; i < week.length; i++) {
            data.push({ 'name': week[i], 'value': district.meanWeekDays[i] });
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

    function loadDistrict(id) {
        selectedDistrict = districtsData.find( function(district) {
            return district.id === id;
        });

        selectionChanged();
    }

    return {
        render : render,
        loadDistrict : loadDistrict
    };
})(window, d3);

window.addEventListener('resize', Chart.render);
