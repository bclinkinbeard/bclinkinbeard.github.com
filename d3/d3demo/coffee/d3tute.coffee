dataset = []
w = 800
h = 600
padding = 30

dataset.push [ Math.random() * w, Math.random() * h ] for [0..50]

svg = d3.select("body")
	.append("svg")
	.attr("width", w)
	.attr("height", h)

circles = svg.selectAll("circle")
	.data(dataset)
	.enter()
	.append("circle")
	.attr("opacity", .0001)

circles.transition()
	.duration(1000)
	.delay((d, i) -> i * 25)
	.attr("opacity", .8)
	.attr("fill", "green")

xScale = d3.scale.linear()
	.domain([0, d3.max(dataset, (d) -> d[0])])
	.range([padding, w - padding * 2.5])

xAxis = d3.svg.axis()
	.scale(xScale)
	.orient("bottom")
	.ticks(5)

yScale = d3.scale.linear()
	.domain([0, d3.max(dataset, (d) -> d[1])])
	.range([h - padding, padding])

yAxis = d3.svg.axis()
	.scale(yScale)
	.orient("left")
	.ticks(5)

rScale = d3.scale.linear()
	.domain([0, d3.max(dataset, (d) -> d[1])])
	.range([5, 30])

circles.attr("cx", (d) -> xScale d[0])
circles.attr("cy", (d) -> yScale d[1])
circles.attr("r", (d) -> rScale d[1])


svg.append("g")
	.attr("class", "axis")
	.attr("transform", "translate(0, #{h - padding})")
	.call(xAxis)

svg.append("g")
	.attr("class", "axis")
	.attr("transform", "translate(#{padding}, 0)")
	.call(yAxis)