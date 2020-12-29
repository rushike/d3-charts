// d3 = Object.assign({}, require("d3-format"), require("d3-geo"), require("d3-geo-projection"));

// const d3 = require("../d3.v5.js");

const __ORIENT__ = ["right", "bottom", "left", "top"];

class ScatterPlot{
    constructor(){
        this.margin = {
            top : 20,
            right : 210,
            bottom : 50,
            left : 70
        }

        this.outer_width = 500;
        this.outer_height = 500; 

        this.width = this.outer_width - this.margin.left - this.margin.right;
        this.height = this.outer_height - this.margin.top - this.margin.bottom;

        this.x = d3.scaleLinear().range([0, this.width]).nice();
        this.y = d3.scaleLinear().range([this.height, 0]).nice();
        this.color = d3.scaleOrdinal(d3.schemeCategory10);

        this.x_orient = "bottom";
        this.y_orient = "left";

        this.x_axis = d3.axisBottom(this.x)
            .ticks(20, "s");
    
        this.y_axis = d3.axisLeft(this.y)
            .ticks(20, "s");
        
        /**Need to improve the structure  */
        this.dimen = [];

        this.labels = [];

        this.dimenlen = 0;
        /** Till here */

        this.div_id = "#scatter";

        this.x_axis_name = "X";

        this.y_axis_name = "Y";

        this.data = [];

        this.tip = d3.select("body").append("div")
            .attr("class", "tooltip")
            .style("opacity", 0);

        this.zoom_beh = d3.zoom()
            // .x(this.x)
            // .y(this.y)
            .scaleExtent([0, 1000])
            .on("zoom", () => {
                this.zoom();
            });
        
            
        this.svg = d3.select(this.div_id)
            .append("svg")
            .attr("width", this.outer_width)
            .attr("height", this.outer_height)
            .append("g")
            .attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")")
            .call(this.zoom_beh);

        this.svg.append("rect")
            .attr("width", this.width)
            .attr("height", this.height);  

        this.svg.append("g")
            .classed("x axis", true)
            .attr("transform", "translate(0," + this.height + ")")
            .call(this.x_axis)
            .append("text")
            .classed("label", true)
            .attr("x", this.width)
            .attr("y", this.margin.bottom - 10)
            .attr("dy", "1.5em")
            .style("text-anchor", "end")
            .text(this.x_axis_name);


        this.svg.append("g")
            .classed("y axis", true)
            .call(this.y_axis)
            .append("text")
            .classed("label", true)
            .attr("transform", "rotate(-90)")
            .attr("y", -this.margin.left)
            .attr("dy", "1.5em")
            .style("text-anchor", "end")
            .text(this.y_axis_name);

        // this.svg.call(this.tip);

        this.objects = this.svg.append("svg")
            .classed("objects", true)
            .attr("width", this.width)
            .attr("height", this.height);

        this.objects.append("svg:line")
            .classed("axisLine hAxisLine", true)
            .attr("x1", 0)
            .attr("y1", 0)
            .attr("x2", this.width)
            .attr("y2", 0)
            .attr("transform", "translate(0," + this.height + ")");

        this.objects.append("svg:line")
            .classed("axisLine vAxisLine", true)
            .attr("x1", 0)
            .attr("y1", 0)
            .attr("x2", 0)
            .attr("y2", this.height);

    }

    
    /**
     * 
     * @param {String} property defining the some kind of dertermined behaviour 
     * @param {String} val value of property, amount of kind of behaviour
     */
    attr(property, val){
        console.log("attr");
        // console.log("attr property = " + property + ", value = " + val);
        // console.log("attr property instanceof string : " + (typeof property !== 'string'));
        if(typeof property !== 'string') return this;
        // console.log("attr property = " + property + ", value = " + val);
        switch(property){
            case "margin" :
                if(val.top && val.right && val.bottom && val.left){
                    this.margin = {
                        top : val.top,
                        right : val.right,
                        bottom : val.bottom,
                        left : val.left,
                    }
                }
            break;

            case "outer-width" :
                if(Number.isInteger(val)) {
                    this.outer_width = val;
                }
            break;
            
            case "outer-height" :
                if(Number.isInteger(val)){
                    this.outer_height = val;
                }
            break;

            case "x:orient" :
                if(val instanceof String){
                    if(__ORIENT__.includes(val)) this.x_orient = val;
                }
            break;

            case "y:orient" :
                if(val instanceof String){
                    if(__ORIENT__.includes(val)) this.y_orient = val;
                }
            break;
            
            case "dimen" :
                if(val instanceof Array){
                    if(val.every(function(str){return typeof str === "string"})){
                        for(var i = 0; i < val.length; i++){
                            this.dimen.push(val[i]);
                        }
                    }
                }
            break;
            
            case "labels" :
                if(val instanceof Array){
                    if(val.every(function(str){return typeof str === "string"})){
                        for(var i = 0; i < this.dimen.length && val.length; i++){
                            this.labels[this.dimen[i]] = val[i];
                        }
                    }
                }
            break;

            case "div:id" :
                if(typeof val === 'string'){
                    var index = val.indexOf("#");
                    console.log("attr-div:id index = " + index);
                    if(val.substring(index + 1).includes("#")) break;
                    this.div_id = val;
                }
            break;

            case "x:axis" :
                if(typeof val === 'string'){
                    this.x_axis_name = val;
                }
            break;

            case "y:axis" :
                if(typeof val === 'string'){
                    this.y_axis_name = val;
                }
            break;
        }this.update_attr();
        return this;
    }

    /**
     * Updates the all dependent attributes
     */
    update_attr(){
        console.log("update_attr");
        this.width = this.outer_width - this.margin.left - this.margin.right;
        this.height = this.outer_height - this.margin.top - this.margin.bottom;
        
        this.x = d3.scaleLinear().range([0, this.width]).nice();
        this.y = d3.scaleLinear().range([this.height, 0]).nice();

        this.x_axis = d3.axisBottom(this.x)
            .ticks(20, "s");
    
        this.y_axis = d3.axisLeft(this.y)
            .ticks(20, "s");
        

        d3.select(this.div_id).select("svg").remove(); //Remove the svg root
        
        this.svg = d3.select(this.div_id)
            .append("svg")
            .attr("width", this.outer_width)
            .attr("height", this.outer_height)
            .append("g")
            // .attr("width", this.width)
            // .attr("height", this.height)
            .attr("transform", "translate(" + (this.margin.left)+ "," + this.margin.top + ")")
            .call(this.zoom_beh); 

        this.svg.append("rect")
            .attr("width", this.width)
            .attr("height", this.height);

        this.svg.select(".x.axis")
            .attr("transform", "translate(0," + this.height + ")")
            .call(this.x_axis)
            .select(".label")
            .attr("x", this.width)
            .attr("y", this.margin.bottom - 10)
            .attr("dy", "1.5em")
            .style("text-anchor", "end")
            .text(this.x_axis_name);


        this.svg.select(".y.axis", true)
            .call(this.y_axis)
            .select(".label", true)
            .attr("transform", "rotate(-90)")
            .attr("y", -this.margin.left)
            .attr("dy", "1.5em")
            .style("text-anchor", "end")
            .text(this.y_axis_name);

           
    }

    load_csv(path){
        d3.csv(path, data => {
            this.data.push(data);
            this.on_load(data);
        });
        
    }

    /**
     * Fires imediately afters onloading data
     * @param {Array} data 
     */
    on_load(data){
        // data.forEach(function(d) {
        //     d.Prob_Mortality = +d.Prob_Mortality;
        //     d.icustay_id = +d.icustay_id;
        //     d.age = +d.age;
        //     d.los_icu = +d.los_icu;
        //     d.hospital_expire_flag = +d.hospital_expire_flag;
        //     d.first_careunit = d.first_careunit;
        // });

        console.log("on_load");

        var xCat = this.dimen[0], yCat = this.dimen[1], rCat = this.dimen[2];
        this.min_max_init(data);


        console.log(this.objects);
            
        this.objects.append("circle");

        this.objects.selectAll(".dot")
            .data(data)
            .enter().append("circle")
            .classed("dot", true)
            .attr("r", d => {return this.rm(d);})
            .attr('cx', (d) => {return this.cx(d);})
            .attr("cy", d => {return this.cy(d);})
            // .attr({
            //     r: d => {return this.rm(d);},
            //     cx: d => {return this.cx(d);},
            //     cy: d => {return this.cy(d);}
            // })
            .style("fill", "#000000")/*data => {return this.cl(data)})*/
            .on("mouseover", this.tip.show)
            .on("mouseout", this.tip.hide);

        var legend = this.svg.selectAll(".legend")
            .data(this.color.domain())
            .enter().append("g")
            .classed("legend", true)
            .attr("transform",(d, i) => {
                return "translate(0," + i * 20 + ")";
            });

        legend.append("rect")
            .attr("x", this.width + 10)
            .attr("width", 12)
            .attr("height", 12)
            .style("fill", this.color);

        legend.on("click", function(type) {
            // dim all of the icons in legend
            d3.selectAll(".legend")
                .style("opacity", 0.1);
            // make the one selected be un-dimmed
            d3.select(this)
                .style("opacity", 1);
            // select all dots and apply 0 opacity (hide)
            d3.selectAll(".dot")
            // .transition()
            // .duration(500)
            .style("opacity", 0.0)
            // filter out the ones we want to show and apply properties
            .filter(function(d) {
                return d["first_careunit"] == type;
            })
                .style("opacity", 1) // need this line to unhide dots
            .style("stroke", "black")
            // apply stroke rule
            .style("fill", function(d) {
                if (d.hospital_expire_flag == 1) {
                    return this
                } else {
                    return "white"
                };
            });
        });

        legend.append("text")
            .attr("x", this.width + 26)
            .attr("dy", ".65em")
            .text(function(d) {
                return d;
            });
        d3.select("button.reset").on("click", this.change)
        d3.select("button.changexlos").on("click", this.updateX)

    }
    
    /**
     * 
     * @param {Array} data 
     */
    min_max_init(data = null){
        data = data == null ? this.data : data;

        this.x_max = d3.max(data, data => {return this.datax(data);}) * 1.05,
        this.x_min = d3.min(data, data => {return this.datax(data);}),
        this.x_min = this.x_min > 0 ? 0 : this.x_min,
        this.y_max = d3.max(data, data => {return this.datay(data);}) * 1.05,
        this.y_min = d3.min(data, data => {return this.datay(data);}),
        this.y_min = this.y_min > 0 ? 0 : this.y_min;
        this.x.domain([this.x_min, this.x_max]);
        this.y.domain([this.y_min, this.y_max]);

    }
    
    /**
     * Zoom functionality
     */
    zoom() {
        // var svg = d3.select(this.div_id)
        //     .select("svg")
        //     .select("g");
            // .call(this.zoom_beh);
        // var svg = d3.select(this.div_id).select("g");
        // console.log("div_id : " + this.div_id);
        //svg.attr("transform", "translate(" + vd3.event.translate + ")scale(" + vd3.event.scale + ")");

        console.log("zoom");
        // console.log(svg);
        // console.log(this.div_id);
        
       this.svg.select(".x.axis").call(this.x_axis);
       this.svg.select(".y.axis").call(this.y_axis);
       this.svg.selectAll(".dot")
            .attr({
                cx: data => {
                    // console.log("cx : " + this.cx(d));
                    return this.x(data[this.dimen[0]]);
                },
                cy: data => { 
                    return this.y(data[this.dimen[1]]);
                }
            })
            // .attr("transform", transform);
    }

    updateX() {
        console.log("updateX");
        this.min_max_init(this.data);

        var svg = d3.select("svg").transition();
        svg.select(".y.axis")
            .duration(1000)
            .call(this.y_axis);
        svg.select('.x.axis')
            .duration(1000)
            .call(this.x_axis);
        svg.select('.label')
            .duration(1000)
            .attr("x", this.width)
            .attr("y", this.margin.bottom - 10)
            .style("text-anchor", "end")
            .text("Length of Stay");

        d3.selectAll("circle.dot")
            .transition()
            .duration(1000)
            .attr({
                r: d => {
                    return 4 * Math.sqrt(d[this.dimen[2]] / Math.PI);
                },
                cx: d => {
                    return this.x(d[this.dimen[0]]);
                },
                cy: d => {
                    return this.y(d[this.dimen[1]]);
                }
            })
    }

    change() {
        console.log("change");

        var xMax = d3.max(this.data, (d) => {
            return d[this.dimen[0]];
        });
        var xMin = d3.min(this.data, (d) => {
            return d[this.dimen[0]];
        });
        this.zoom_beh.x(x.domain([xMin, xMax])).y(y.domain([yMin, yMax]));

        var svg_trans = d3.select(this.div_id).transition();

        svg_trans.select(".x.axis").duration(750).call(this.x_axis).select(".label").text(labels[this.dimen[0]]);
        
        this.objects.selectAll(".dot").transition().duration(1000)
            .attr({
                r: d => {return this.rm(d);},
                cx: d => {return this.cx(d);},
                cy: d => {return this.cy(d);}
            })
        }

    /**
     * 
     * @param {Array} data  
     */
    cx(data){
        // console.log("cx : " +this.x(this.datax(data)) );
        return this.x(this.datax(data));
    }

    /**
     * 
     * @param {Array} data  
     */
    cy(data){
        // console.log("cy : " + this.datay(data));
        return this.y(this.datay(data));
    }
    /**
     * 
     * @param {Array} data  
     */
    rm(data){
        return 4 * Math.sqrt(data[this.dimen[2]] / Math.PI)
    }

    /**
     * 
     * @param {Array} data  
     */
    cl(data){
        return this.color(data[this.dimen[3]]);
    }


    /**
     * 
     * @param {Array} data  
     */
    datax(data){
        return data[this.dimen[0]];
    }

    /**
     * 
     * @param {Array} data  
     */
    datay(data){
        return data[this.dimen[1]];
    }

    /**
     * Transform functionality
     * @param {Array} d data array
     */
    transform(d) {
        return "translate(" + this.x(d[this.dimen[0]]) + "," + this.y(d[this.dimen[1]]) + ")";
    }
    
    /**
     * returns html code to show on hovering the tip
     * @param {Array} data 
     * @returns {String} html code after hovering
     */
    hover_html(data){
        var str = "";
        for(var i = 0; i < this.dimen.length; i++){
            // console.log("lab : " + this.labels[this.dimen[i]] + ": " + data[this.dimen[i]]);
            str += this.labels[this.dimen[i]] + ": " + data[this.dimen[i]] + "<br>";
        }
        return  str;
    }
}
