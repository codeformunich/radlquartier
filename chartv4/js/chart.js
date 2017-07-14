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

    var districtsData;
    var selectedDistrict = 0;
    var selectedChart = "week";

    d3.select("input[value=\"week\"]").property("checked", true);

    d3.selectAll("input").on("change", selectDataset);

    function selectDataset() {
        selectionChanged(this.value);
    }

    var svg = d3.select("svg"),
        margin = { top: 20, right: 20, bottom: 30, left: 40 },
        width = +svg.attr("width") - margin.left - margin.right,
        height = +svg.attr("height") - margin.top - margin.bottom;

    var x = d3.scaleBand().rangeRound([0, width]).padding(0.1),
        y = d3.scaleLinear().rangeRound([height, 0]);

    var g = svg.append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


    d3.json('data/district_halts.json', function(error, json) {
        if (error) throw error;

        districtsData = json;
        selectionChanged('week');
    });

    function renderChart(data) {
        var t = d3.transition()
            .duration(1000)
            .ease(d3.easeLinear);

        // svg.select(".axis.axis--y").remove();
        //   svg.select(".axis.axis--x").remove();

        x.domain(data.map(function(d) {
            return d.name; }));
        y.domain([0, d3.max(data, function(d) {
            return d.value; })]);

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
            .text("Frequency");

        var bar = g.selectAll(".bar")
            .remove()
            .exit()
            .data(data);

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
    }

    function selectionChanged(selected) {
        if (selected == "week") {
            renderChart(weekData(districtsData[selectedDistrict]));
        } else if (selected == "month") {
            renderChart(monthData(districtsData[selectedDistrict]));
        } else if (selected == "year") {
            renderChart(weekData(districtsData[selectedDistrict]));
        }
    }

    function weekData(district) {
        var data = [];
        for (var i = 0; i < week.length; i++) {
            data.push({ 'name': month[i], 'value': district.meanWeekDays[i] });
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

    // d3.tsv("data.tsv", function(d) {
    //   d.frequency = +d.frequency;
    //   return d;
    // }, function(error, data) {
    //   if (error) throw error;

    //   x.domain(data.map(function(d) { return d.letter; }));
    //   y.domain([0, d3.max(data, function(d) { return d.frequency; })]);

    //   g.append("g")
    //       .attr("class", "axis axis--x")
    //       .attr("transform", "translate(0," + height + ")")
    //       .call(d3.axisBottom(x));

    //   g.append("g")
    //       .attr("class", "axis axis--y")
    //       .call(d3.axisLeft(y).ticks(10, "%"))
    //     .append("text")
    //       .attr("transform", "rotate(-90)")
    //       .attr("y", 6)
    //       .attr("dy", "0.71em")
    //       .attr("text-anchor", "end")
    //       .text("Frequency");

    //   g.selectAll(".bar")
    //     .data(data)
    //     .enter().append("rect")
    //       .attr("class", "bar")
    //       .attr("x", function(d) { return x(d.letter); })
    //       .attr("y", function(d) { return y(d.frequency); })
    //       .attr("width", x.bandwidth())
    //       .attr("height", function(d) { return height - y(d.frequency); });
    // });

})(window, d3);
