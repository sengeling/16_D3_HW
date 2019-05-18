const svgWidth = 960;
const svgHeight = 500;

const margin = {
  top: 20,
  right: 40,
  bottom: 80,
  left: 100
};

const width = svgWidth - margin.left - margin.right;
const height = svgHeight - margin.top - margin.bottom;

// responsive function
function responsivefy(svg) {
    // get container + svg aspect ratio
    var container = d3.select(svg.node().parentNode),
        width = parseInt(svg.style("width")),
        height = parseInt(svg.style("height")),
        aspect = width / height;

    // add viewBox and preserveAspectRatio properties,
    // and call resize so that svg resizes on inital page load
    svg.attr("viewBox", "0 0 " + width + " " + height)
        .attr("perserveAspectRatio", "xMinYMid")
        .call(resize);

    // to register multiple listeners for same event type, 
    // you need to add namespace, i.e., 'click.foo'
    // necessary if you call invoke this function for multiple svgs
    // api docs: https://github.com/mbostock/d3/wiki/Selections#on
    d3.select(window).on("resize." + container.attr("id"), resize);

    // get width of container and resize svg to fit it
    function resize() {
        var targetWidth = parseInt(container.style("width"));
        svg.attr("width", targetWidth);
        svg.attr("height", Math.round(targetWidth / aspect));
    }
}

// Create an SVG wrapper, append an SVG group that will hold our chart,
// and shift the latter by left and top margins.
const svg = d3
  .select("#scatter")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight)
  .call(responsivefy);

// Append an SVG group
const chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Initial Params
let chosenXAxis = "poverty";
let chosenYAxis = "healthcare";

// function used for updating x-scale const upon click on axis label
function xScale(healthData, chosenXAxis) {
  // create scales
  const xLinearScale = d3.scaleLinear()
    .domain([d3.min(healthData, d => d[chosenXAxis]) * .9,
      d3.max(healthData, d => d[chosenXAxis]) * 1.1
    ])
    .range([0, width]);

  return xLinearScale;

}
// function used for updating y-scale const upon click on axis label
function yScale(healthData, chosenYAxis) {
    // create scales
    const yLinearScale = d3.scaleLinear()
        .domain([d3.min(healthData, d => d[chosenYAxis]) * .8,
            d3.max(healthData, d => d[chosenYAxis])
        ])
        .range([height, 0]);

    return yLinearScale;
}
// function used for updating xAxis const upon click on axis label
function renderXAxes(newXScale, xAxis) {
  const bottomAxis = d3.axisBottom(newXScale);

  xAxis.transition()
    .duration(1000)
    .call(bottomAxis);

  return xAxis;
}

// function used for updating yAxis const upon click on axis label
function renderYAxes(newYScale, yAxis) {
    const leftAxis = d3.axisLeft(newYScale);
  
    yAxis.transition()
      .duration(1000)
      .call(leftAxis);
  
    return yAxis;
  }

// function used for updating circles group with a transition to
// new circles
function renderCircles(circlesGroup, newXScale, newYScale, chosenXAxis, chosenYAxis) {

  circlesGroup.transition()
    .duration(1000)
    .attr("cx", d => newXScale(d[chosenXAxis]))
    .attr("cy", d => newYScale(d[chosenYAxis]));

  return circlesGroup;
}

// function used for updating state abbr with a transition to
// new circles
function renderAbbr(abbrLabels, newXScale, newYScale, chosenXAxis, chosenYAxis) {

    abbrLabels.transition()
      .duration(1000)
      .attr("cx", d => newXScale(d[chosenXAxis]))
      .attr("cy", d => newYScale(d[chosenYAxis]));
  
    return abbrLabels;
  }

// function used for updating circles group with new tooltip
function updateToolTip(chosenXAxis, circlesGroup) {
    let labelX = "";
    let labelY = "";
    if (chosenXAxis === "poverty" && chosenYAxis === "healthcare") {
        labelX = "Poverty %:";
        labelY = "Healthcare %:";
    }
    else if (chosenXAxis === "poverty" && chosenYAxis === "smokes") {
        labelX = "Poverty %:";
        labelY = "Smokes %:";
    }
    else if (chosenXAxis === "poverty" && chosenYAxis === "obesity") {
        labelX = "Poverty %:";
        labelY = "Obese %:";
    }
    else if (chosenXAxis === "age" && chosenYAxis === "healthcare") {
        labelX = "Age (Median):";
        labelY = "Healthcare %:";
    }
    else if (chosenXAxis === "age" && chosenYAxis === "smokes") {
        labelX = "Age (Median):";
        labelY = "Smokes %:";
    }
    else if (chosenXAxis === "age" && chosenYAxis === "obesity") {
        labelX = "Age (Median):";
        labelY = "Obese %:";
    }
    else if (chosenXAxis === "income" && chosenYAxis === "smokes") {
        labelX = "HH Income (Median):";
        labelY = "Smokes %:";
    }
    else if (chosenXAxis === "income" && chosenYAxis === "obesity") {
        labelX = "HH Income (Median):";
        labelY = "Obese %:";
    }
    else {
        labelX = "HH Income (Median):";
        labelY = "Healthcare %:";
    }

    const toolTip = d3.tip()
        .attr("class", "d3-tip")
        .offset([45, -95])
        .html(function(d) {
            return (`${d.state}<br>${labelX} ${d[chosenXAxis]}<br>${labelY} ${d[chosenYAxis]}`);
        });

    circlesGroup.call(toolTip);

    circlesGroup.on("mouseover", function(data) {
        toolTip.show(data, this);
    })
    // onmouseout event
    .on("mouseout", function(data) {
        toolTip.hide(data, this);
    });

  return circlesGroup;
}

// Retrieve data from the CSV file and execute everything below
(async function(){
    const healthData = await d3.csv("assets/data/data.csv");

    // parse data
    healthData.forEach(function(data) {
        data.poverty = +data.poverty;
        data.age = +data.age;
        data.income = +data.income;
        data.healthcare = +data.healthcare;
        data.obesity = +data.obesity;
        data.smokes = +data.smokes;
    });

    // xLinearScale function above csv import
    let xLinearScale = xScale(healthData, chosenXAxis);
    let yLinearScale = xScale(healthData, chosenYAxis);

    // Create initial axis functions
    const bottomAxis = d3.axisBottom(xLinearScale);
    const leftAxis = d3.axisLeft(yLinearScale);

    // append x axis
    let xAxis = chartGroup.append("g")
        .classed("x-axis", true)
        .attr("transform", `translate(0, ${height})`)
        .call(bottomAxis);

    // append y axis
    let yAxis = chartGroup.append("g")
        .classed("y-axis", true)
        .call(leftAxis);

    // append initial circles
    let circlesGroup = chartGroup.selectAll(".stateCircle")
        .data(healthData)
        .enter()
        .append("circle")
        .attr("cx", d => xLinearScale(d[chosenXAxis]))
        .attr("cy", d => yLinearScale(d[chosenYAxis]))
        .attr("r", 14)
        .attr("class", "stateCircle");
    
    let abbrLabels = chartGroup.selectAll(".stateText")
        .data(healthData)
        .enter()
        .append('text')
        .attr('x', d => xLinearScale(d[chosenXAxis]))
        .attr('y', d => yLinearScale(d[chosenYAxis]) + 5)
        .text(d => d.abbr)
        .attr("class", "stateText")
    
    // Create group for more x-axis labels
    const xLabelsGroup = chartGroup.append("g")
        .attr("transform", `translate(${width / 2}, ${height + 20})`);

    const povertyLabel = xLabelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 20)
        .attr("value", "poverty") // value to grab for event listener
        .classed("active", true)
        .classed("xlabel", true)
        .text("In Poverty (%)");

    const ageLabel = xLabelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 40)
        .attr("value", "age") // value to grab for event listener
        .classed("inactive", true)
        .classed("xlabel", true)
        .text("Age (Median)");

    const hhiLabel = xLabelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 60)
        .attr("value", "income") // value to grab for event listener
        .classed("inactive", true)
        .classed("xlabel", true)
        .text("Household Income (Median)");

    // Create group for more x-axis labels
    const yLabelGroup = chartGroup.append("g")
        .attr("transform", `translate(${width - 20}, ${height / 2})`);
    
    const healthLabel = yLabelGroup.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", -840)
        .attr("x", 0)
        .attr("value", "healthcare")
        .classed("active", true)
        .classed("ylabel", true)
        .text("Lacks Healthcare (%)");

    const smokesLabel = yLabelGroup.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", -860)
        .attr("x", -40)
        .attr("value", "smokes")
        .classed("active", false)
        .classed("ylabel", true)
        .text("Smokes (%)");

    const obesityLabel = yLabelGroup.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", -885)
        .attr("x", -35)
        .attr("value", "obesity")
        .classed("active", false)
        .classed("ylabel", true)
        .text("Obese (%)");

    // updateToolTip function above csv import
    circlesGroup = updateToolTip(chosenXAxis, circlesGroup);

    // x axis labels event listener
    xLabelsGroup.selectAll(".xlabel")
        .on("click", function() {
        // get value of selection
        const value = d3.select(this).attr("value");
        if (value !== chosenXAxis) {

            // replaces chosenXAxis with value
            chosenXAxis = value;

            // console.log(chosenXAxis)

            // functions here found above csv import
            // updates x scale for new data
            xLinearScale = xScale(healthData, chosenXAxis);

            // updates x axis with transition
            xAxis = renderXAxes(xLinearScale, xAxis);

            // updates circles with new x values
            circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis);

            abbrLabels = renderAbbr(abbrLabels, xLinearScale, chosenXAxis)

            // updates tooltips with new info
            circlesGroup = updateToolTip(chosenXAxis, circlesGroup);

            // changes classes to change bold text
            if (chosenXAxis === "age") {
                ageLabel
                    .classed("active", true)
                    .classed("inactive", false);
                povertyLabel
                    .classed("active", false)
                    .classed("inactive", true);
                hhiLabel
                    .classed("active", false)
                    .classed("inactive", true)
            }
            else if (chosenXAxis === "income") {
                ageLabel
                    .classed("active", false)
                    .classed("inactive", true);
                povertyLabel
                    .classed("active", false)
                    .classed("inactive", true);
                hhiLabel
                    .classed("active", true)
                    .classed("inactive", false)
            }
            else if (chosenXAxis === "poverty") {
                ageLabel
                    .classed("active", false)
                    .classed("inactive", true);
                povertyLabel
                    .classed("active", true)
                    .classed("inactive", false);
                hhiLabel
                    .classed("active", false)
                    .classed("inactive", true)
            }
        }
    });
    yLabelGroup.selectAll(".ylabel")
        .on("click", function() {
        // get value of selection
        const value = d3.select(this).attr("value");
        if (value !== chosenYAxis) {

            // replaces chosenXAxis with value
            chosenYAxis = value;

            // console.log(chosenXAxis)

            // functions here found above csv import
            // updates x scale for new data
            yLinearScale = yScale(healthData, chosenYAxis);

            // updates x axis with transition
            yAxis = renderYAxes(yLinearScale, yAxis);

            // updates circles with new x values
            circlesGroup = renderCircles(circlesGroup, xLinearScale, yLinearScale, chosenXAxis, chosenYAxis);

            abbrLabels = renderAbbr(abbrLabels, xLinearScale, yLinearScale, chosenXAxis, chosenYAxis)

            // updates tooltips with new info
            circlesGroup = updateToolTip(chosenYAxis, circlesGroup);

            // changes classes to change bold text
            if (chosenYAxis === "healthcare") {
                healthLabel
                    .classed("active", true)
                    .classed("inactive", false);
                smokesLabel
                    .classed("active", false)
                    .classed("inactive", true);
                obesityLabel
                    .classed("active", false)
                    .classed("inactive", true)
            }
            else if (chosenYAxis === "smokes") {
                healthLabel
                    .classed("active", false)
                    .classed("inactive", true);
                smokesLabel
                    .classed("active", true)
                    .classed("inactive", false);
                obesityLabel
                    .classed("active", false)
                    .classed("inactive", true)
            }
            else if (chosenYAxis === "obesity") {
                healthLabel
                    .classed("active", false)
                    .classed("inactive", true);
                smokesLabel
                    .classed("active", false)
                    .classed("inactive", true);
                obesityLabel
                    .classed("active", true)
                    .classed("inactive", false);
            }
        }
    });
})()
