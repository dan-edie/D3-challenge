// creating the values that will dictate the size of the chart
let svgWidth = 960;
let svgHeight = 500;

let margin = {
    top: 20,
    right: 40,
    bottom: 80,
    left: 100
};

let width = svgWidth - margin.left - margin.right;
let height = svgHeight - margin.top - margin.bottom;

// creating the svg wrapper and appending the group that will hold the chart
var svg = d3.select("#scatter")
    .append("svg")
    .attr("width", svgWidth)
    .attr("height", svgHeight);

// append an svg group
var chartGroup = svg.append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

// load data from the csv
d3.csv("assets/data/data.csv").then(function(demoData, err) {
    if(err) throw err;

    //parse data
    demoData.forEach(function(data) {
        data.poverty = +data.poverty;
        data.healthcare = +data.healthcare;
    });

    // create scale functions
    var xLinearScale = d3.scaleLinear()
        .domain([8, d3.max(demoData, d => d.poverty)])
        .range([0, width]);

    var yLinearScale = d3.scaleLinear()
        .domain([0, d3.max(demoData, d => d.healthcare)])
        .range([height, 0]);

    // create the axis functions

    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale);

    // append the axes to the chart
    chartGroup.append("g")
        .attr("transform", `translate(0, ${height})`)
        .call(bottomAxis);
    
    chartGroup.append("g")
        .call(leftAxis);

    // add the data to the plot
    var circlesGroup = chartGroup.selectAll("circle")
        .data(demoData)
        .enter()
        .append("circle")
        .attr("cx", d => xLinearScale(d.poverty))
        .attr("cy", d => yLinearScale(d.healthcare))
        .attr("r", "10")
        .attr("fill", "#0058ba")
        .attr("opacity" , "0.5");

    // add the state abbreviations to the plotted data
    var stateAbbr = chartGroup.selectAll("text")
        .data(demoData)
        .enter()
        .append("text")
        .text(d => d.abbr)
        .attr("x", d => (xLinearScale(d.poverty) - 7))
        .attr("y", d => (yLinearScale(d.healthcare) + 4))
        .attr("font-size", "11px");

    // create axes labels
    chartGroup.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", (0 - margin.left + 50))
        .attr("x", (0 - (height / 2)) - 60)
        .attr("dy", "1em")
        .attr("class", "axisText")
        .attr("font-size", "18px")
        .attr("font-weight", "bold")
        .text("Lacks Healthcare (%)")

    chartGroup.append("text")
        .attr("transform", `translate(${width / 2}, ${height + margin.top + 30})`)
        .attr("class", "axisText")
        .text("In Poverty (%)")
        .attr("font-size", "18px")
        .attr("font-weight", "bold")
});
