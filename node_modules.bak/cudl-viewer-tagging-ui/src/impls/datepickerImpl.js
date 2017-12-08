import $ from 'jquery';
import d3 from 'd3';


export var datepickerImpl = {

    originYear: [1000, 1100],
    width: 330, // default
    height: 125, // default

    init : function(options) {
        this.el = options.el;
        this.datefrom = options.input[0];
        this.dateto = options.input[1];

        // render datepicker
        this.render( this.el );
    },

    render : function(el) {
        //
        // start year, end year. Note: Date is limited to a unix timestamp range.
        // years between 0 and 99 will be (year + 1900)
        //
        var minY = 0, maxY = 2050;

        var margin = {top: 10, right: 10, bottom: 40, left: 20},
            width = this.width - margin.left - margin.right,
            height = this.height - margin.top - margin.bottom;

        var minY = new Date();
        minY.setFullYear(0);
        var x = d3.time.scale()
            .domain([minY, new Date(maxY,0,1)])
            .range([0, width]);

        var xAxisg = d3.svg.axis().scale(x).orient("bottom").ticks(d3.time.years, 50).tickSize(-height).tickFormat("");

        var xAxis = d3.svg.axis().scale(x).orient("bottom").ticks(d3.time.years, 100).tickPadding(0).tickFormat(function(d){return d.getFullYear();});

        var brush = d3.svg.brush()
            .x(x)
            .extent([new Date(this.originYear[0],0,1), new Date(this.originYear[1],0,1)])
            .on("brush", brushed);

        var svg = d3.select( el ).append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
            //.call(zoom);

        svg.append("rect")
            .attr("class", "grid-background")
            .attr("width", width)
            .attr("height", height);

        svg.append("g")
            .attr("class", "x grid")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxisg)
            .selectAll(".tick")
            .classed("minor", function(d) { return d.getHours(); });

        svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis)
            .selectAll("text")
            .attr("x", 6)
            .attr("transform", "rotate(45)")
            .style("text-anchor", null);

        var gBrush = svg.append("g")
            .attr("class", "brush")
            .call(brush);

        gBrush.selectAll("rect")
            .attr("height", height);

        function brushed() {
          var extent0 = brush.extent(),
              extent1;

          // if dragging, preserve the width of the extent
          if (d3.event.mode === "move") {
            var d0 = d3.time.day.round(extent0[0]);
            var d1 = d3.time.day.offset(d0, Math.round((extent0[1] - extent0[0]) / 864e5));
            var d00 = Math.ceil(extent0[0].getFullYear() / 50.0) * 50;
            var d10 = Math.ceil(d1.getFullYear() / 50.0) * 50;
            var d00y = new Date(), d10y = new Date();
            d00y.setFullYear(d00,0,1);
            d10y.setFullYear(d10,0,1);
            extent1 = [d00y, d10y];

            // set date values in input fields
            $( datepickerImpl.datefrom ).val(d00);
            $( datepickerImpl.dateto ).val(d10);

          }

          // otherwise, if resizing then round both dates
          else {

            var yr0 = extent0[0].getFullYear();
            var yr0m = Math.floor(yr0 / 50.0) * 50;
            var yr1 = extent0[1].getFullYear();
            var yr1m = Math.ceil(yr1 / 50.0) * 50;

            if (yr0m == yr1m) yr1m = yr1m + 50;

            var startY = new Date(), endY = new Date();
            startY.setFullYear(yr0m, 0, 1);
            endY.setFullYear(yr1m, 0, 1);
            extent1 = [d3.time.year.floor( startY ), d3.time.year.ceil( endY )];

            // set date values in input fields
            $( datepickerImpl.datefrom ).val(yr0m);
            $( datepickerImpl.dateto ).val(yr1m);
          }

          d3.select(this).call(brush.extent(extent1));
        }

    }

}
