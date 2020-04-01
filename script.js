let api =
	"https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json";

d3.json(api).then(function(data) {
	let dataset = data;
	let baseTemp = dataset.baseTemperature;

	let title = d3
		.select("body")
		.append("h1")
		.attr("id", "title")
		.text("Monthly Global Land-Surface Temperature");

	let h = 500;
	let w = 800;
	let p = 65;

	let svg = d3
		.select("body")
		.append("svg")
		.attr("height", h)
		.attr("width", w);

	let years = [];

	for (x = 0; x < dataset.monthlyVariance.length; x++) {
		years.push(dataset.monthlyVariance[x].year.toString());
	}

	let xMin = d3.min(years);
	let xMax = d3.max(years);

	let xScale = d3
		.scaleTime()
		.domain([new Date(xMin), new Date(xMax)])
		.range([p, w - p]);

	svg.append("g")
		.attr("transform", `translate(0, ${h - p})`)
		.call(d3.axisBottom(xScale))
		.attr("id", "x-axis");

	let description = d3
		.select("body")
		.append("h2")
		.attr("id", "description")
		.text(`${xMin} - ${xMax}: base temperature ${baseTemp}°C`);

	let months = [];

	for (x = 0; x < dataset.monthlyVariance.length; x++) {
		months.push(dataset.monthlyVariance[x].month.toString());
	}
	let specifier = "%M";

	let monthsTime = months.map(function(month) {
		return d3.timeParse(specifier)(month);
	});

	let yMin = d3.min(months);
	let yMax = d3.max(months);

	let yScale = d3
		.scaleBand()
		.domain([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12])
		.range([p, h - p]);

	let formatTime = d3.timeFormat("%B");

	svg.append("g")
		.attr("transform", `translate(${p},0)`)
		.call(
			d3.axisLeft(yScale).tickFormat(function(d, i) {
				return formatTime(new Date(0, months[i], 0));
			})
		)
		.attr("id", "y-axis");

	let numberOfMonths = 12;
	let tempVariances = [];

	dataset.monthlyVariance.forEach(function(x) {
		tempVariances.push(x.variance);
	});

	//Temperature Scale
	let tempMin = d3.min(tempVariances);
	let tempMax = d3.max(tempVariances);

	let tempScale = d3
		.scaleLinear()
		.domain([tempMin, tempMax])
		.range(["teal", "orange"]);

	//tooltip

	let tooltip = d3
		.select("body")
		.append("div")
		.attr("id", "tooltip")
		.style("background-color", "black")
		.style("opacity", "0");

	let mouseover = function(d) {
		tooltip.style("opacity", "0.8");
	};

	let mousemove = function(d) {
		tooltip.attr("data-year", d.year);
		let { year, month, variance } = d;
		variance = variance.toFixed(2);
		month = month - 1;
		let monthName = d3.timeFormat("%B");
		month = monthName(new Date(year, month));
		let temperature = Math.floor(baseTemp)
			.toString()
			.concat(variance.toString());
		temperature = eval(temperature);
		tooltip.html(`${year} - ${month} <br> Variance:${variance}
 `);
	};

	let mouseleave = function() {
		tooltip.style("opacity", "0");
	};

	svg.selectAll("rect")
		.data(dataset.monthlyVariance)
		.enter()
		.append("rect")
		.attr("class", "cell")
		.attr("data-month", d => d.month - 1)
		.attr("data-year", d => d.year)
		.attr("data-temp", d => d.variance)
		.attr("x", function(d, i) {
			let day = "5";
			let month = d.month.toString();
			let year = d.year.toString();
			return xScale(new Date(`${day} ${month},${year}`));
		})
		.attr("y", function(d, i) {
			return yScale(months[i]);
		})
		.attr("id", "y-axis")
		.attr("height", (h - p - p) / 12)
		.attr("width", function() {
			return 2;
		})
		.style("fill", d => tempScale(d.variance))
		.on("mouseover", mouseover)
		.on("mousemove", mousemove)
		.on("mouseleave", mouseleave);

	let legend = d3
		.legendColor()
		.shapeWidth(50)
		.orient("horizontal")
		.scale(tempScale);

	svg.append("g")
		.attr("id", "legend")
		.attr("transform", `translate(${p},${h - 40})`);

	svg.select("#legend").call(legend);

	//dont Delete
});
