// async function so you can read data first
(async function(){
    // define svg size and margins
    const
        svgWidth = 960,
        svgHeight = 500;

    const margin = {
        top: 20,
        right: 40,
        bottom: 60,
        left: 100
    };

    // set width and height to use when building graph
    const width = svgWidth - margin.left - margin.right;
    const height = svgHeight - margin.top - margin.bottom;

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
    
    // append svg to chart class and define it's size per const above
    const svg = d3.select("#scatter")
    .append("svg")
    .attr("width", svgWidth)
    .attr("height", svgHeight)
    .call(responsivefy);

    // create chartGroup to to append the graph and adjust so x axis is bottom and y axis is left
    const chartGroup = svg.append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

    // import health data
    const healthData = await d3.csv("assets/data/data.csv");

    // set data as numbers
    healthData.forEach(function(data) {
        data.poverty = +data.poverty;
        data.healthcare = +data.healthcare;
    });

    // create x scale function
    const xLinearScale = d3.scaleLinear()
        .domain([d3.min(healthData, d => d.poverty) * .9,
          d3.max(healthData, d => d.poverty) * 1.1
        ])
        .range([0, width]);

    // create y scale function
    const yLinearScale = d3.scaleLinear()
        .domain([d3.min(healthData, d => d.healthcare) * .8,
            d3.max(healthData, d => d.healthcare)])
        .range([height, 0]);

    // create axis functions
    const bottomAxis = d3.axisBottom(xLinearScale);
    const leftAxis = d3.axisLeft(yLinearScale);

    // append axes to the chart
    chartGroup.append("g")
        .attr("transform", `translate(0, ${height})`)
        .call(bottomAxis);

    chartGroup.append("g")
        .call(leftAxis);

    // create the scatter circles
    let circlesGroup = chartGroup.selectAll(".stateCircle")
        .data(healthData)
        .enter()
        .append("circle")
        .attr("cx", d => xLinearScale(d.poverty))
        .attr("cy", d => yLinearScale(d.healthcare))
        .attr("r", 14)
        .attr("class", "stateCircle");
    
    // create the state abbrevitons in the circles
    let abbrLabels = chartGroup.selectAll(".stateText")
        .data(healthData)
        .enter()
        .append('text')
        .attr('x', d => xLinearScale(d.poverty))
        .attr('y', d=> yLinearScale(d.healthcare) + 5)
        .text(d => d.abbr)
        .attr("class", "stateText")

    // create tool tip
    const toolTip = d3.tip()
        .attr("class", "d3-tip")
        .offset([45, -90])
        .html(function(d) {
            return (`${d.state}<br> Poverty %: ${d.poverty}<br> Lacks Healthcare %: ${d.healthcare}`);
        });

    // call the tooltip in the chart
    chartGroup.call(toolTip);

    abbrLabels.on("mouseover", function(data) {
        toolTip.show(data, this);
    })
    // on mouseout event
    .on("mouseout", function(data, index) {
        toolTip.hide(data);
    });

    // create axes labels
    chartGroup.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left + 40)
        .attr("x", 0 - (height / 2))
        .attr("dy", "1em")
        .attr("class", "aText")
        .text("Lacks Healthcare (%)");

    chartGroup.append("text")
        .attr("transform", `translate(${width / 2}, ${height + margin.top + 30})`)
        .attr("class", "aText")
        .text("Poverty (%)");
})()