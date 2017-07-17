var col = [];
var dataVal = [];
var cap = [];
var barDates = [];
var flag = 0;


define([
    "dojo/_base/declare",
    "mxui/widget/_WidgetBase",
    "dijit/_TemplatedMixin",
    "mxui/dom",
    "dojo/dom",
    "dojo/dom-prop",
    "dojo/dom-geometry",
    "dojo/dom-class",
    "dojo/dom-style",
    "dojo/dom-construct",
    "dojo/_base/array",
    "dojo/_base/lang",
    "dojo/text",
    "dojo/html",
    "dojo/_base/event",
    "TechTamminaDThreeCharts/lib/jquery-1.11.2",
    "dojo/text!TechTamminaDThreeCharts/widget/template/TechTamminaDThreeCharts.html",
    "TechTamminaDThreeCharts/lib/d3"
], function (declare, _WidgetBase, _TemplatedMixin, dom, dojoDom, dojoProp, dojoGeometry, dojoClass, dojoStyle, dojoConstruct, dojoArray, lang, dojoText, dojoHtml, dojoEvent, _jQuery, widgetTemplate) {
    "use strict";

    var $ = _jQuery.noConflict(true);
     var d3 = window.d3;

    return declare("TechTamminaDThreeCharts.widget.TechTamminaDThreeCharts", [ _WidgetBase, _TemplatedMixin ], {

        templateString: widgetTemplate,


        widgetBase: null,

        // Internal variables.
        _handles: null,
        _contextObj: null,

        constructor: function () {
            this._handles = [];
        },

        postCreate: function () {
            logger.debug(this.id + ".postCreate");
        },

        update: function (obj, callback) {
            logger.debug(this.id + ".update");

            this._contextObj = obj;
            this._updateRendering(callback);
        },

        resize: function (box) {
            if(flag == 1){
                window.location.reload();
            }
           
          logger.debug(this.id + ".resize");
        },

        uninitialize: function () {
             flag = 1;
         logger.debug(this.id + ".uninitialize");
        },

        _updateRendering: function (callback) {
            
            logger.debug(this.id + "._updateRendering");
            var animEase = "";
            var chart_type = "", colour;
            if (this._contextObj !== null) {
                  
                cap = this._contextObj.get(this.dataCaption).split("~");
                dataVal = this._contextObj.get(this.dataValue).split("~");
                barDates = this._contextObj.get(this.calBarDates).split("~");
                try {
                    animEase = this.animationEasing;
                    // alert("animEase->" + animEase);
                } catch (e) {
                    //alert("exception e=>" + e.message);
                }

                chart_type = this.chartType;
                switch (this.chartColor) {
                    case "colorScale10":
                        colour = d3.scale.category10();
                        break;
                    case "colorScale20":
                        colour = d3.scale.category20();
                        break;
                    case "colorScale20b":
                        colour = d3.scale.category20b();
                        break;
                    case "colorScale20c":
                        colour = d3.scale.category20c();
                        break;
                    default:
                        colour = d3.scale.category20c();
                };
                //alert(chart_type)

                if (chart_type == 'Bar') {
                    barChart(this.width, this.height, colour, this.yLabel, this.animationDuration, animEase, this.xLabel,this.xLabelSize,this.yLabelSize);
                } else if (chart_type == 'Pie') {
                    pieChart(this.width, this.height, colour, this.innerRadius, this.outerRadius, this.animationDuration, this.strokeColor, animEase,this.fontSize,this.fontColour);
                } else {
                    areaChart(this.yLabel, this.animationDuration, animEase, colour,this.width, this.height, this.xLabel,this.xLabelSize,this.yLabelSize);
                }
            } else {
                dojoStyle.set(this.domNode, "display", "none");
            }

            this._executeCallback(callback, "_updateRendering");
        },

        // Shorthand for running a microflow
        _execMf: function (mf, guid, cb) {
            logger.debug(this.id + "._execMf");
            if (mf && guid) {
                mx.ui.action(mf, {
                    params: {
                        applyto: "selection",
                        guids: [guid]
                    },
                    callback: lang.hitch(this, function (objs) {
                        if (cb && typeof cb === "function") {
                            cb(objs);
                        }
                    }),
                    error: function (error) {
                        console.debug(error.description);
                    }
                }, this);
            }
        },

        // Shorthand for executing a callback, adds logging to your inspector
        _executeCallback: function (cb, from) {
            logger.debug(this.id + "._executeCallback" + (from ? " from " + from : ""));
            if (cb && typeof cb === "function") {
                cb();
            }
        }
    });
});

require(["TechTamminaDThreeCharts/widget/TechTamminaDThreeCharts"]);


function pieChart(width, height, colors, innerRad, outerRad, animateDur, strokeColor, easing,fontSize,fontColour) {
   
    //alert(fontSize+"=====fontSize"+fontColour+"=========fontColour"+fontStyle)
    //alert(easing + " strokeColor=>" + strokeColor);
    var dataSet = [];
    for (var i = 0; i < dataVal.length; i++) {
        var obj = {
            "legendLabel": cap[i],
            "magnitude": parseInt(dataVal[i])
        }
        dataSet.push(obj);
    }
    var pieName = "Pie1",
        margin = 10,
        outerRadius = outerRad,
        innerRadius = innerRad,
        sortArcs = 0;
    pieName = "Pie1";
    var colorScale = colors;
    var canvasWidth = width;
    var pieWidthTotal = outerRadius * 2;;
    var pieCenterX = outerRadius + margin / 2;
    var pieCenterY = outerRadius + margin / 2;
    var legendBulletOffset = 30;
    var legendVerticalOffset = outerRadius - margin;
    var legendTextOffset = 20;
    var textVerticalSpace = 20;

    var canvasHeight = 0;
    var pieDrivenHeight = outerRadius * 2 + margin * 2;
    var legendTextDrivenHeight = (dataSet.length * textVerticalSpace) + margin * 2;
    // Autoadjust Canvas Height
    if (pieDrivenHeight >= legendTextDrivenHeight) {
        canvasHeight = pieDrivenHeight;
    } else {
        canvasHeight = legendTextDrivenHeight;
    }

    var x = d3.scale.linear().domain([0, d3.max(dataSet, function (d) { return d.magnitude; })]).rangeRound([0, pieWidthTotal]);
    var y = d3.scale.linear().domain([0, dataSet.length]).range([0, (dataSet.length * 20)]);


    var synchronizedMouseOver = function () {
        var arc = d3.select(this);
        var indexValue = arc.attr("index_value");

        var arcSelector = "." + "pie-" + pieName + "-arc-" + indexValue;
        var selectedArc = d3.selectAll(arcSelector);
        selectedArc.style("fill", "Maroon");

        var bulletSelector = "." + "pie-" + pieName + "-legendBullet-" + indexValue;
        var selectedLegendBullet = d3.selectAll(bulletSelector);
        selectedLegendBullet.style("fill", "Maroon");

        var textSelector = "." + "pie-" + pieName + "-legendText-" + indexValue;
        var selectedLegendText = d3.selectAll(textSelector);
        selectedLegendText.style("fill", "Maroon");
    };

    var synchronizedMouseOut = function () {
        var arc = d3.select(this);
        var indexValue = arc.attr("index_value");

        var arcSelector = "." + "pie-" + pieName + "-arc-" + indexValue;
        var selectedArc = d3.selectAll(arcSelector);
        var colorValue = selectedArc.attr("color_value");
        selectedArc.style("fill", colorValue);

        var bulletSelector = "." + "pie-" + pieName + "-legendBullet-" + indexValue;
        var selectedLegendBullet = d3.selectAll(bulletSelector);
        var colorValue = selectedLegendBullet.attr("color_value");
        selectedLegendBullet.style("fill", colorValue);

        var textSelector = "." + "pie-" + pieName + "-legendText-" + indexValue;
        var selectedLegendText = d3.selectAll(textSelector);
        selectedLegendText.style("fill", fontColour);
    };

    var tweenPie = function (b) {
        b.innerRadius = 0;
        var i = d3.interpolate({ startAngle: 0, endAngle: 0 }, b);
        return function (t) {
            return arc(i(t));
        };
    }

    // Create a drawing canvas...
    var canvas = d3.select("#chart")
        .append("svg:svg") //create the SVG element inside the <body>
        .data([dataSet]) //associate our data with the document
        .attr("width", canvasWidth) //set the width of the canvas
        .attr("height", canvasHeight) //set the height of the canvas
        .append("svg:g") //make a group to hold our pie chart
        .attr("transform", "translate(" + pieCenterX + "," + pieCenterY + ")") // Set center of pie

    // Define an arc generator. This will create <path> elements for using arc data.
    var arc = d3.svg.arc()
        .innerRadius(innerRadius) // Causes center of pie to be hollow
        .outerRadius(outerRadius);

    // Define a pie layout: the pie angle encodes the value of dataSet.
    // Since our data is in the form of a post-parsed CSV string, the
    // values are Strings which we coerce to Numbers.
    var pie = d3.layout.pie()
        .value(function (d) { return d.magnitude; })
        .sort(function (a, b) { if (sortArcs == 1) { return b.magnitude - a.magnitude; } else { return null; } });

    // Select all <g> elements with class slice (there aren't any yet)
    var arcs = canvas.selectAll("g.slice")
        // Associate the generated pie data (an array of arcs, each having startAngle,
        // endAngle and value properties) 
        .data(pie)
        // This will create <g> elements for every "extra" data element that should be associated
        // with a selection. The result is creating a <g> for every object in the data array
        // Create a group to hold each slice (we will have a <path> and a <text>      // element associated with each slice)
        .enter().append("svg:a")
        // .attr("xlink:href", function (d) { return d.data.link; })
        .append("svg:g")
        .attr("class", "slice")    //allow us to style things in the slices (like text)
        // Set the color for each slice to be chosen from the color function defined above
        // This creates the actual SVG path using the associated data (pie) with the arc drawing function
        .style("stroke", strokeColor)
        .attr("d", arc);

    arcs.append("svg:path")
        // Set the color for each slice to be chosen from the color function defined above
        // This creates the actual SVG path using the associated data (pie) with the arc drawing function
        .attr("fill", function (d, i) { return colorScale(i); })
        .attr("color_value", function (d, i) { return colorScale(i); }) // Bar fill color...
        .attr("index_value", function (d, i) { return "index-" + i; })
        .attr("class", function (d, i) { return "pie-" + pieName + "-arc-index-" + i; })
        .style("stroke", strokeColor)
        .attr("d", arc)
        .on('mouseover', synchronizedMouseOver)
        .on("mouseout", synchronizedMouseOut)
        .transition()
        .ease(easing)
        .duration(animateDur)
        .delay(function (d, i) { return i * 50; })
        .attrTween("d", tweenPie);

    // Add a magnitude value to the larger arcs, translated to the arc centroid and rotated.
    arcs.filter(function (d) { return d.endAngle - d.startAngle > .2; }).append("svg:text")
        .attr("dy", ".35em")
        .attr("text-anchor", "middle")
        //.attr("transform", function(d) { return "translate(" + arc.centroid(d) + ")rotate(" + angle(d) + ")"; })
        .attr("transform", function (d) { //set the label's origin to the center of the arc
            //we have to make sure to set these before calling arc.centroid
            d.outerRadius = outerRadius; // Set Outer Coordinate
            d.innerRadius = innerRadius; // Set Inner Coordinate
            return "translate(" + arc.centroid(d) + ")rotate(" + angle(d) + ")";
        })
        .style("fill", "White")
        .style("font", "normal 12px Arial")
        .text(function (d) { return d.data.magnitude; });

    // Computes the angle of an arc, converting from radians to degrees.
    function angle(d) {
        var a = (d.startAngle + d.endAngle) * 90 / Math.PI - 90;
        return a > 90 ? a - 180 : a;
    }

    // Plot the bullet circles...
    canvas.selectAll("circle")
        .data(dataSet).enter().append("svg:circle") // Append circle elements
        .attr("cx", (pieWidthTotal/2)+ legendBulletOffset)
        .attr("cy", function (d, i) { return i * textVerticalSpace - legendVerticalOffset; })
        .attr("stroke-width", ".5")
        .style("fill", function (d, i) { return colorScale(i); }) // Bullet fill color
        .attr("r", 5)
        .attr("color_value", function (d, i) { return colorScale(i); }) // Bar fill color...
        .attr("index_value", function (d, i) { return "index-" + i; })
        .attr("class", function (d, i) { return "pie-" + pieName + "-legendBullet-index-" + i; })
        .on('mouseover', synchronizedMouseOver)
        .on("mouseout", synchronizedMouseOut);

    // Create hyper linked text at right that acts as label key...
    canvas.selectAll("a.legend_link")
        .data(dataSet) // Instruct to bind dataSet to text elements
        .enter().append("svg:a") // Append legend elements
        .attr("xlink:href", function (d) { return d.link; })
        .append("text")
        .attr("text-anchor", "center")
        .attr("x", (pieWidthTotal/2) + legendBulletOffset + legendTextOffset)
        //.attr("y", function(d, i) { return legendOffset + i*20 - 10; })
        //.attr("cy", function(d, i) {    return i*textVerticalSpace - legendVerticalOffset; } )
        .attr("y", function (d, i) { return i * textVerticalSpace - legendVerticalOffset; })
        .attr("dx", 0)
        .attr("dy", "5px") // Controls padding to place text in alignment with bullets
        .text(function (d) { return d.legendLabel; })
        .attr("color_value", function (d, i) { return colorScale(i); }) // Bar fill color...
        .attr("index_value", function (d, i) { return "index-" + i; })
        .attr("class", function (d, i) { return "pie-" + pieName + "-legendText-index-" + i; })
        .style("fill", fontColour)
        .style("font", "normal"+fontSize+"Arial")
        .on('mouseover', synchronizedMouseOver)
        .on("mouseout", synchronizedMouseOut);
    
}

/*---------------------Bar chart-------------------*/
function barChart(chartWidth, chartHeight, color, yLabelData, aniDur, easing,xLable,xLableSize,yLableSize) {

    var margin = { top: 20, right: 20, bottom: 30, left: 40 },
        width = chartWidth - margin.left - margin.right,
        height = chartHeight - margin.top - margin.bottom;
    var xaxis_margin=-(height/2);

    // D3 scales = just math
    // x is a function that transforms from "domain" (data) into "range" (usual pixels)
    // domain gets set after the data loads
    var x = d3.scale.ordinal()
        .rangeRoundBands([0, width], .1);

    var y = d3.scale.linear()
        .range([height, 0]);

    // D3 Axis - renders a d3 scale in SVG
    var xAxis = d3.svg.axis()
        .scale(x)
        .orient("bottom");

    var yAxis = d3.svg.axis()
        .scale(y)
        .orient("left")
        .ticks(10, "%");

    // create an SVG element (appended to body)
    // set size
    // add a "g" element (think "group")
    // annoying d3 gotcha - the 'svg' variable here is a 'g' element
    // the final line sets the transform on <g>, not on <svg>
    var svg = d3.select("#chart").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")") 
        .append("text")
        .attr("transform", "rotate(0)")
        .attr("y", 22)
        .attr("x", - (xaxis_margin))
        .attr("dy", ".71em")
        .style("text-anchor", "end")
        .style("font", "normal"+xLableSize+" Arial")
        .text(xLable);

    svg.append("g")
        .attr("class", "y axis")
        .append("text") // just for the title (ticks are automatic)
        .attr("transform", "rotate(-90)") // rotate the text!
        .attr("y", -35)
        .attr("x", xaxis_margin)
        .attr("dy", ".71em")
        .style("text-anchor", "end")
        .style("font", "normal"+yLableSize+" Arial")
        .text(yLabelData);

    var data = [];

    for (var i = 0; i < dataVal.length; i++) {
        var obj = {
            letter: barDates[i],
            frequency: parseInt(dataVal[i])
        }
        data.push(obj);
    }


    data.forEach(function (slice, index) {
        setTimeout(function () {
            draw(slice, x, y, data, svg, xAxis, yAxis, width, height, color, aniDur, easing);
        }, index * 300);
    });
  
}

function draw(slice, x, y, data, svg, xAxis, yAxis, width, height, color, durAnimate, easing) {
    var colorScale = color;
    // measure the domain (for x, unique letters) (for y [0,maxFrequency])
    // now the scales are finished and usable
    try {
        x.domain(data.map(function (d) { return d.letter; }));
        y.domain([0, d3.max(data, function (d) { return d.frequency; })]);
        // another g element, this time to move the origin to the bottom of the svg element
        // someSelection.call(thing) is roughly equivalent to thing(someSelection[i])
        //   for everything in the selection\
        // the end result is g populated with text and lines!
        svg.select('.x.axis').transition().duration(300).call(xAxis);
        // same for yAxis but with more transform and a title
        svg.select(".y.axis").transition().duration(300).call(yAxis)
        // THIS IS THE ACTUAL WORK!
        var bars = svg.selectAll(".bar").data(data, function (d) { return d.letter; }) // (data) is an array/iterable thing, second argument is an ID generator function
        bars.exit()
            .transition()
            .duration(durAnimate)
            .attr("y", y(0))
            .attr("height", height - y(0))
            .style('fill-opacity', 1e-6)
            .attr("fill", function (d, i) { return colorScale(i); })
            .remove();
        // data that needs DOM = enter() (a set/selection, not an event!)
        bars.enter().append("rect")
            .attr("class", "bar")
            .attr("y", y(0))
            .attr("fill", function (d, i) { return colorScale(i); })
            .attr("height", height - y(0));
        // the "UPDATE" set:
        bars.transition().ease(easing).duration(durAnimate).attr("x", function (d) { return x(d.letter); }) // (d) is one item from the data array, x is the scale object from above
            .attr("width", x.rangeBand()) // constant, so no callback function(d) here
            .attr("y", function (d) { return y(d.frequency); })
            .attr("fill", function (d, i) { return colorScale(i); })
            .attr("height", function (d) { return height - y(d.frequency); }); // flip the height, because y's domain is bottom up, but SVG renders top down
    } catch (e) {
        alert("exception=>" + e.message);
    }
   
}




function areaChart(yLabeldata, animateDur, easing, color,chartWidth, chartHeight,xLable,xLableSize,yLableSize) {
    //alert("inside areaChart" + yLabeldata + "yLabeldata color=>" + color);
    var data = [];
    var colorScale = color;
    for (var i = 0; i < dataVal.length; i++) {
        var obj = {
            "x": parseInt(barDates[i]),
            "y": parseInt(dataVal[i])
        }
        data.push(obj);
    }

    var margin = { top: 20, right: 20, bottom: 30, left: 50 },
        width = chartWidth - margin.left - margin.right,
        height = chartHeight - margin.top - margin.bottom;
    var  xaxis_margin=-(height/2);
    var x = window.d3.scale.linear()
        .domain([0, window.d3.max(data, function (d) { return d.x; })])
        .range([0, width]);

    var y = window.d3.scale.linear()
        .domain([0, window.d3.max(data, function (d) { return d.y; })])
        .range([height, 0]);

    var xAxis = window.d3.svg.axis()
        .scale(x)
        .orient("bottom");

    var yAxis = window.d3.svg.axis()
        .scale(y)
        .orient("left");

    var area = window.d3.svg.area()
        .x(function (d) { return x(d.x); })
        .y0(height)
        .y1(function (d) { return y(d.y); });
    // var svg = d3.select("svg#area")
    var svg = window.window.d3.select('#chart').append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")")


    svg.append("path")
        .datum(data)
        .attr("class", "area")
        .attr("fill", function (d, i) { return colorScale(i); })
        .attr("d", area);

    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis)
        .append("text")
        .attr("transform", "rotate(0)")
        .attr("y", 22)
        .attr("x", -(xaxis_margin))
        .attr("dy", ".71em")
        .style("text-anchor", "end")
        .style("font", "normal"+xLableSize+" Arial")
        .text(xLable);
    // alert("yLabeldata->"+yLabeldata);
    svg.append("g")
        .attr("class", "y axis")
        .call(yAxis)
        .append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", xaxis_margin)
        .attr("y", -35)
        .attr("dy", ".71em")
        .style("text-anchor", "end")
        .style("font", "normal"+yLableSize+" Arial")
        .text(yLabeldata);
        
  
}


