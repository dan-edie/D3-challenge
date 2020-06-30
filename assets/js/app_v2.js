// create the margins for the plot
let svgWidth = 960;
let svgHeight = 700;

let margin = {
    top: 20,
    right: 40,
    bottom: 80,
    left: 100
};

let width = svgWidth - margin.left - margin.right;
let height = svgHeight - margin.top - margin.bottom;

// create the svg wrapper and append the svg group to hold the chart
var svg = d3.select("#scatter")
    .append("svg")
    .attr("width", svgWidth)
    .attr("height", svgHeight);

var chartGroup = svg.append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

// initialize parameters
var chosenXAxis = "poverty";
var chosenYAxis = "healthcare";

// function updates x-scale variable upon clicking the axis label
function xScale(demoData, chosenXAxis) {
    // create scales
    var xLinearScale = d3.scaleLinear()
        .domain([d3.min(demoData, d => d[chosenXAxis]) * 0.8,
            d3.max(demoData, d => d[chosenXAxis]) * 1.05])
        .range([0, width]);

    return xLinearScale;
};

// function updates y-scale variable upon clicking y-axis label
function yScale(demoData, chosenYAxis) {
    //create scales
    var yLinearScale = d3.scaleLinear()
        .domain([d3.min(demoData, d => d[chosenYAxis] * 0.8), d3.max(demoData, d => d[chosenYAxis]) * 1.1])
        .range([height, 0]);

    return yLinearScale;
};

// function used for updating x-axis var upon click on x-axis label
function renderXAxes(newXScale, xAxis) {
    var bottomAxis = d3.axisBottom(newXScale);

    // create the transition
    xAxis.transition()
        .duration(1000)
        .call(bottomAxis);

    return xAxis;
};

// function used for updating y-axis var upon click on y-axis label
function renderYAxes(newYScale, yAxis) {
    var leftAxis = d3.axisLeft(newYScale);

    // create the transition
    yAxis.transition()
        .duration(1000)
        .call(leftAxis);

    return yAxis;
};

// function for updating circles group with transition to new circles
function renderCircles(circlesGroup, newXScale, newYScale, chosenXAxis, chosenYAxis) {
    //create the transition
    circlesGroup.transition()
        .duration(1000)
        .attr("cx", d => newXScale(d[chosenXAxis]))
        .attr("cy", d => newYScale(d[chosenYAxis]));

    return circlesGroup;
};

function renderStates(stateAbbr, newXScale, newYScale, chosenXAxis, chosenYAxis) {
    //create the transition
    stateAbbr.transition()
        .duration(1000)
        .attr("x", d => newXScale(d[chosenXAxis]))
        .attr("y", d => newYScale(d[chosenYAxis]));

    return stateAbbr;
};

// function to update circles group with new tooltip
function updateToolTip(chosenXAxis, chosenYAxis, circlesGroup) {

    var xLabel;
    var yLabel;

    switch(chosenXAxis) {
        case "poverty":
            xLabel = "In Poverty (%)"
            break;

        case "age":
            xLabel = "Age (Median)"
            break;

        case "income":
            xLabel = "Household Income (Median)"
            break;
    };

    switch(chosenYAxis) {
        case "obesity":
            yLabel = "Obese (%)"
            break;

        case "smokes":
            yLabel = "Smokes (%)"
            break;

        case "healthcare":
            yLabel = "Lacks Healthcare (%)"
            break;
    };

    var toolTip = d3.tip()
        .attr("class", "tooltip")
        .offset([120, -40])
        .style("background-color", "white")
        .style("position" , "absolute")
        .style("border", "solid")
        .style("border-width", "1px")
        .style("border-radius", "5px")
        .style("padding", "10px")
        .html(function(d) {
            return (`${d.state}<br>${yLabel}: ${d[chosenYAxis]}<br>${xLabel}: ${d[chosenXAxis]}`);
        });
    
    circlesGroup.call(toolTip);

    circlesGroup.on("mouseover", function(data) {
        toolTip.show(data);
        d3.select(this)
            .style("stroke", "#000000")
            .style("stroke-width", "3")
            .style("opacity", "1");
    })
        .on("mouseout", function(data) {
            toolTip.hide(data);
            d3.select(this)
                .style("stroke", "none")
                .style("opacity", "0.5");
        });

    return circlesGroup;
};

// import data
d3.csv("assets/data/data.csv").then(function(demoData, err) {
    if(err) throw err;

    // parse the data
    demoData.forEach(function(data) {
        data.obese = +data.obese;
        data.smokes = +data.smokes;
        data.healthcare = +data.healthcare;
        data.poverty = +data.poverty;
        data.age = +data.age;
        data.income = +data.income;
    });

    // xLinearScale function above csv import
    var xLinearScale = xScale(demoData, chosenXAxis);
    var yLinearScale = yScale(demoData, chosenYAxis);

    // create initial axis functions
    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale);

    // append x-axis
    var xAxis = chartGroup.append("g")
        .classed("x-axis", true)
        .attr("transform", `translate(0, ${height - 2})`)
        .call(bottomAxis);

    // append y-axis
    var yAxis = chartGroup.append("g")
        .classed("y-axis", true)
        .call(leftAxis)

    // append inital circles
    var circlesGroup = chartGroup.selectAll("circle")
        .data(demoData)
        .enter()
        .append("circle")
        .attr("cx", d => xLinearScale(d[chosenXAxis]))
        .attr("cy", d => yLinearScale(d[chosenYAxis]))
        .attr("r", "10")
        .attr("fill", "#0058ba")
        .attr("opacity", "0.5");

    // add the state abbreviations to the plotted data
    var stateAbbr = chartGroup.selectAll("null")
        .data(demoData)
        .enter()
        .append("text")
        .text(d => d.abbr)
        .attr("x", d => (xLinearScale(d[chosenXAxis])))
        .attr("y", d => (yLinearScale(d[chosenYAxis])) + 3)
        .attr("text-anchor", "middle")
        .attr("font-size", "10px")
        .attr("fill", "white")
        .attr("font-weight", "bold");

    //create group for the x-axis labels
    var xLabelsGroup = chartGroup.append("g")
        .attr("transform", `translate(${width / 2}, ${height + 10})`);

    var povertyLabel = xLabelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 20)
        .attr("value", "poverty")
        .classed("active", true)
        .text("In Poverty (%)");

    var ageLabel = xLabelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 40)
        .attr("value", "age")
        .classed("inactive", true)
        .text("Median Age (years)");

    var incomeLabel = xLabelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 60)
        .attr("value", "income")
        .classed("inactive", true)
        .text("Median Household Income (dollars)");

    // create groups for the y-axis labels
    var yLabelsGroup = chartGroup.append("g")
        .attr("transform", "rotate(-90)");

    var obeseLabel = yLabelsGroup.append("text")
        .attr("y", 0 - margin.left + 20)
        .attr("x", 0 - (height / 2))
        .attr("dy", "1em")
        .attr("value", "obesity")
        .classed("inactive", true)
        .text("Obese (%)");

    var smokesLabel = yLabelsGroup.append("text")
        .attr("y", 0 - margin.left + 40)
        .attr("x", 0 - (height / 2))
        .attr("dy", "1em")
        .attr("value", "smokes")
        .classed("inactive", true)
        .text("Smokes (%)");

    var healthcareLabel = yLabelsGroup.append("text")
        .attr("y", 0 - margin.left + 60)
        .attr("x", 0 - (height / 2))
        .attr("dy", "1em")
        .attr("value", "healthcare")
        .classed("active", true)
        .text("Lacks Healthcare (%)");        

    // updateToolTip function above csv import
    var circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

    // x-axis labels event listener
    xLabelsGroup.selectAll("text").on("click", function() {
        //get value of selection
        var value = d3.select(this).attr("value");

        if (value !== chosenXAxis) {

            // replaces chosenXAxis with value
            chosenXAxis = value;

            // updates x-scale for new data
            xLinearScale = xScale(demoData, chosenXAxis);

            // updates x-axis with transition
            xAxis = renderXAxes(xLinearScale, xAxis);

            // updates circles with new x-values
            circlesGroup = renderCircles(circlesGroup, xLinearScale, yLinearScale, chosenXAxis, chosenYAxis);

            // updates the abbreviation position
            stateAbbr = renderStates(stateAbbr, xLinearScale, yLinearScale, chosenXAxis, chosenYAxis);

            // updates tooltips with new info
            circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

            //change classes to bold text
            switch(chosenXAxis) {
                case "poverty":
                    povertyLabel.classed("active", true).classed("inactive", false);
                    ageLabel.classed("active", false).classed("inactive", true);
                    incomeLabel.classed("active", false).classed("inactive", true);
                    break;

                case "age":
                    povertyLabel.classed("active", false).classed("inactive", true);
                    ageLabel.classed("active", true).classed("inactive", false);
                    incomeLabel.classed("active", false).classed("inactive", true);
                    break;

                case "income":
                    povertyLabel.classed("active", false).classed("inactive", true);
                    ageLabel.classed("active", false).classed("inactive", true);
                    incomeLabel.classed("active", true).classed("inactive", false);
                    break;
            };
        };
    });

    // y-axis labels event listener
    yLabelsGroup.selectAll("text").on("click", function() {
        //get value of selection
        var value = d3.select(this).attr("value");

        if (value !== chosenYAxis) {

            // replaces chosenYAxis with value
            chosenYAxis = value;

            // updates y-scale for new data
            yLinearScale = yScale(demoData, chosenYAxis);

            // updates x-axis with transition
            yAxis = renderYAxes(yLinearScale, yAxis);

            // updates circles with new x-values
            circlesGroup = renderCircles(circlesGroup, xLinearScale, yLinearScale, chosenXAxis, chosenYAxis);

            // updates the abbreviation position
            stateAbbr = renderStates(stateAbbr, xLinearScale, yLinearScale, chosenXAxis, chosenYAxis);

            // updates tooltips with new info
            circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

            //change classes to bold text
            switch(chosenYAxis) {
                case "obesity":
                    obeseLabel.classed("active", true).classed("inactive", false);
                    smokesLabel.classed("active", false).classed("inactive", true);
                    healthcareLabel.classed("active", false).classed("inactive", true);
                    break;

                case "smokes":
                    obeseLabel.classed("active", false).classed("inactive", true);
                    smokesLabel.classed("active", true).classed("inactive", false);
                    healthcareLabel.classed("active", false).classed("inactive", true);
                    break;

                case "healthcare":
                    obeseLabel.classed("active", false).classed("inactive", true);
                    smokesLabel.classed("active", false).classed("inactive", true);
                    healthcareLabel.classed("active", true).classed("inactive", false);
                    break;
            };
        };        
    });

}).catch(function(error) {
    console.log(error);
});