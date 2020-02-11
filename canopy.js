var url1 = "./data/neighbourhood.geojson";
var url2 = "./data/1.json";
let ind = 0;
// adding tooltip
var tooltip = d3
  .select("body")
  .append("div")
  .attr("class", "tooltip")
  .style("opacity", 0);

// adding tooltip offset to move tooltip with mouse
var tooltipOffset = { x: -100, y: -70 };

//adding Queue
var q = d3_queue
  .queue(1)
  .defer(d3.json, url1)
  .defer(d3.json, url2)
  .awaitAll(draw);

//color scale
var threshold = d3
  .scaleThreshold()
  .domain([0, 10, 15, 20, 25, 30, 35, 40])
  .range([
    "#D7301F",
    "#EF6548",
    "#FBB676",
    "#FEF4B9",
    "#A8C87D",
    "#359A4B",
    "#1B532D",
    "#12351F"
  ]);

function draw(error, data) {
  "use strict";
  if (error) throw error;
  var margin = 50,
    width = 450 - margin,
    height = 500 - margin;

  // create a projection
  var projection = d3
    .geoMercator()
    .center([-121.6434, 38.6226])
    .scale(110000)
    .translate([width / 20, height / 2.5]);

  // create a path
  var path = d3.geoPath().projection(projection);

  // create and append the map
  var map = d3
    .select("#map")
    .selectAll("path")
    .data(data[0].features)
    .enter()
    .append("path")
    .attr("d", path)
    .style("stroke", "#fff")
    .style("stroke-width", 0.5)
    .on("mouseover", function(d) {
      tooltip
        .transition()
        .duration(200)
        .style("opacity", 0.9);
      tooltip
        .html(
          "<strong>" +
            d.properties.name +
            "</strong>" +
            "<br/>" +
            " Canopy Percentage:" +
            "<br/>" +
            d.canopy
        )
        .style("top", d3.event.pageY + tooltipOffset.y + "px")
        .style("left", d3.event.pageX + tooltipOffset.x + "px");
    })
    .on("mouseout", function(d) {
      tooltip
        .transition()
        .duration(500)
        .style("opacity", 0);
    });

  map.datum(function(d) {
    d.canopy = data[1][d.properties.name];
    return d;
  });
  map
    // .attr("class", function(d) {
    //   return d.properties.name;
    // })
    .attr("fill", function(d) {
      return threshold(d.canopy);
    });

  addLegend();
  d3.select("body").on("keydown", function() {
    if (d3.event.keyCode === 67) {
      ind = 0;
      animateMap();

      console.log(ind);
    }
  });

  function animateMap() {
    var myRange = [0, 15, 20, 25, 30, 35, 40, 100];

    map
      .transition()
      .delay(ind * 1500)
      .duration(1500)
      .attr("fill", function(d) {
        if (d.canopy >= myRange[0] && d.canopy <= myRange[ind]) {
          return threshold(d.canopy);
        } else {
          return "white";
        }
      })
      .on("end", function() {
        console.log(ind);
        if (ind < 7) {
          ind++;
          animateMap();
        } else {
          return;
        }
      });
  }
}

function addLegend() {
  var x = d3
    .scaleLinear()
    //domain taken from threshold
    .domain([0, 40])
    //range will determine length of scale
    .range([0, 450]);

  //X axis
  var xAxis = d3
    .axisBottom(x)
    .tickSize(12)
    .tickValues(threshold.domain());

  //group and call and axis is created and move it in position
  var g = d3
    .select("g")
    .call(xAxis)
    .attr("transform", "translate(150,650)");

  g.selectAll("rect")
    .data(
      threshold.range().map(function(color) {
        var d = threshold.invertExtent(color);
        if (d[0] == null) d[0] = x.domain()[0];
        if (d[1] == null) d[1] = x.domain()[1];
        return d;
      })
    )
    .enter()
    .insert("rect", ".tick")
    .attr("height", 8)
    .attr("x", function(d) {
      return x(d[0]);
    })
    .attr("width", function(d) {
      return x(d[1]) - x(d[0]);
    })
    .attr("fill", function(d) {
      return threshold(d[0]);
    });

  // add the text
  g.append("text")
    .attr("fill", "#000")
    .attr("font-weight", 800)
    .attr("text-anchor", "start")
    .attr("y", -6)
    .text("Tree Canopy Percentage");
}
