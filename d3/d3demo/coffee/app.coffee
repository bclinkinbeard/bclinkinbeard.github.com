#
# classes
#

class ChartableObject
	constructor: (@name) ->
		@growth = Math.round( Math.random() * 100 )
		@proficiency = Math.round( Math.random() * 100 )
		@count = Math.round( Math.random() * 5000 )

class District extends ChartableObject
	constructor: (@name) ->
		super
		@schools = []

class School extends ChartableObject
	constructor: (@name) ->
		super
		@count = Math.round( Math.random() * 500 )

#
# data
#

dataset = []
selectedDistrict = null

for i in [1..50]
	do (i) ->
		d = new District( "District #{i}" )
		dataset.push d

		for j in [1..50]
			do (j) ->
				s = new School( "School #{j} (District #{i})" )
				d.schools.push( s )

districts = dataset

#
# chart foundations
#

w = 800
h = 600
padding = 30

svg = d3.select("body")
				.append("svg")
				.attr("width", w)
				.attr("height", h)

xScale = d3.scale
					 .linear()
					 .domain([0, 100])
					 .range([padding, w - padding * 2.5])

xAxis = d3.svg
					.axis()
					.scale(xScale)
					.orient("bottom")
					.ticks(5)

yScale = d3.scale
					 .linear()
					 .domain([0, 100])
					 .range([h - padding, padding])

yAxis = d3.svg.axis()
							.scale(yScale)
							.orient("left")
							.ticks(5)

rScale = d3.scale
					 .linear()
					 .domain([0, d3.max(dataset, (d) -> d.count)])
					 .range([4, 25])

svg.append("g")
.attr("class", "axis")
.attr("transform", "translate(0, #{h - padding})")
.call(xAxis)

svg.append("g")
.attr("class", "axis")
.attr("transform", "translate(#{padding}, 0)")
.call(yAxis)

createCircles = ->
	circles = svg.selectAll("circle")
	.data(dataset)
	.enter()
	.append("circle")
	.attr("opacity", 0.0001)
	.on("click", drillIntoDistrict)
	.attr("cx", (d) -> xScale d.growth)
	.attr("cy", (d) -> yScale d.proficiency)
	.attr("r", (d) -> rScale d.count)

fadeInCircles = ->
	svg.selectAll("circle").transition()
	.duration(500)
	.attr("opacity", 0.75)

drillIntoDistrict = (district) ->
	selectedDistrict = district
	dataset = district.schools

	svg.selectAll("circle").data(dataset)
	.attr("cx", (d) -> xScale district.growth)
	.attr("cy", (d) -> yScale district.proficiency)
	.attr("r", (d) -> rScale district.count)

	svg.selectAll("circle").transition()
	.duration(500)
	.attr("cx", (d) -> xScale d.growth)
	.attr("cy", (d) -> yScale d.proficiency)
	.attr("r", (d) -> rScale d.count)
	.each("end", -> svg.on("click", reset) )

reset = ->

	svg.on("click", null)

	circles = svg.selectAll("circle")

	circles.transition()
	.duration(500)
	.attr("cx", (d) -> xScale selectedDistrict.growth)
	.attr("cy", (d) -> yScale selectedDistrict.proficiency)
	.attr("r", (d) -> rScale selectedDistrict.count)

	dataset = districts

	circles.data(districts)
	circles.transition().delay(500).duration(0.0001)
	.attr("cx", (d) -> xScale d.growth)
	.attr("cy", (d) -> yScale d.proficiency)
	.attr("r", (d) -> rScale d.count)
	.attr("opacity", (d) -> if d is selectedDistrict then return .75 else return 0.0001)
	.transition()
	.duration(500)
	.attr("opacity", 0.75)


createCircles()
fadeInCircles()