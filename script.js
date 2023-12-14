const urlEducation =
  "https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/for_user_education.json";
const urlCounties =
  "https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/counties.json";

const legendWidth = 1000;
const legendHeight = 50;
const paddingLegend = 20;
const barSize = 20;

let countiesData = {};
let educationData = [];

let colorScale;
let axisScale;

const svg = d3.select("#graph");
const legend = d3.select("#legend");
const tooltip = d3.select("#tooltip").style("visibility", "hidden");
let text1 = d3
  .select("#tooltip")
  .append("div")
  .attr("id", "text1")
  .attr("class", "info")
  .text(".");
let text2 = d3
  .select("#tooltip")
  .append("div")
  .attr("id", "text2")
  .attr("class", "info")
  .text(".");
let text3 = d3
  .select("#tooltip")
  .append("div")
  .attr("id", "text3")
  .attr("class", "info")
  .text(".");

Promise.all([d3.json(urlCounties), d3.json(urlEducation)]).then(
  ([firstCallResult, secondCallResult]) => {
    countiesData = topojson.feature(
      firstCallResult,
      firstCallResult.objects.counties
    ).features;
    educationData = secondCallResult;
    createScale();
    drawMap();
    drawLegend();
  }
);

const drawMap = () => {
  svg
    .selectAll("path")
    .data(countiesData)
    .enter()
    .append("path")
    .attr("d", d3.geoPath())
    .attr("class", "county")
    .attr("fill", (d) => {
      let id = d.id;
      let county = educationData.find((item) => {
        return item.fips === id;
      });
      return colorPicker(county.bachelorsOrHigher);
    })
    .attr("data-fips", (d) => {
      return d.id;
    })
    .attr("data-education", (d) => {
      let id = d.id;
      let county = educationData.find((item) => {
        return item.fips === id;
      });
      return county.bachelorsOrHigher;
    })
    .on("mouseover", (nothing, d) => {
      tooltip.style("visibility", "visible");
      let id = d.id;
      let county = educationData.find((item) => {
        return item.fips === id;
      });
      text1.text(county.area_name);
      text2.text("(" + county.state + ")");
      text3.text(county.bachelorsOrHigher + " %");
      document
        .querySelector("#tooltip")
        .setAttribute("data-education", county.bachelorsOrHigher);
    })
    .on("mouseout", () => {
      tooltip.style("visibility", "hidden");
    });
};

const colorPicker = (number) => {
  switch (true) {
    case number < 10:
      return "#E7F2E5";
    case number < 20:
      return "#D0E6CC";
    case number < 30:
      return "#B9D9B2";
    case number < 40:
      return "#A2CD99";
    case number < 50:
      return "#8BC17F";
    case number < 60:
      return "#74B466";
    case number < 70:
      return "#5DA84C";
    case number < 80:
      return "#469B33";
    case number < 90:
      return "#2F8F19";
    case number < 100:
      return "#188300";
  }
};

const createScale = () => {
  let dataSet = educationData.map((item) => {
    return item.bachelorsOrHigher;
  });
  colorScale = d3
    .scaleLinear()
    .domain([d3.min(dataSet), d3.max(dataSet)])
    .range([0, 100]);

  let x = (d3.max(dataSet) - d3.min(dataSet)) / 10;
  let a = d3.min(dataSet);
  let spread = [];
  for (let i = 1; i < 11; i++) {
    spread.push(a + "% - " + (a + x) + "%");
    a = a + x;
  }

  axisScale = d3
    .scaleBand()
    .domain(spread)
    .range([paddingLegend, legendWidth - paddingLegend]);
};

const drawLegend = () => {
  const legendData = [
    "10",
    "20",
    "30",
    "40",
    "50",
    "60",
    "70",
    "80",
    "90",
    "100",
  ];
  legend
    .append("g")
    .call(d3.axisBottom(axisScale))
    .attr("transform", "translate(0," + (legendHeight - paddingLegend) + ")");
  legend
    .attr("width", legendWidth)
    .attr("height", legendHeight)
    .selectAll("rect")
    .data(legendData)
    .enter()
    .append("rect")
    .attr("width", (legendWidth - 2 * paddingLegend) / 10)
    .attr("height", barSize)
    .attr("fill", (d) => {
      return colorPicker(d);
    })
    .attr("x", (d, i) => {
      return paddingLegend + i * ((legendWidth - 2 * paddingLegend) / 10);
    })
    .attr("y", legendHeight - paddingLegend - barSize);
};
