// Function to compute the Collatz sequence
function collatz(n) {
  let sequence = [n];
  while (n > 1) {
    if (n % 2 === 0) {
      n = n / 2;
    } else {
      n = 3 * n + 1;
    }
    sequence.push(n);
  }
  return sequence;
}

function setupGraph() {
  // Initialize empty domains for x and y scales
  x.domain([0, 1]);
  y.domain([0, 1]);

  // Draw the axes with empty domains
  svg.select(".x-axis").call(d3.axisBottom(x));
  svg.select(".y-axis").call(d3.axisLeft(y));
}

function applyPath(svg, sequence, line, firstNumber) {
  // Append a group for the sequence
  const g = svg.append("g").attr("class", "sequence");

  // Append line path for the sequence
  const path = g
    .append("path")
    .datum(sequence)
    .attr("class", "line")
    .attr("stroke", color(firstNumber))
    .attr("d", line)
    .on("mouseover", () => {
      const maxVal = d3.max(sequence);
      hoverText.text(`Number: ${firstNumber}, Max: ${maxVal}`);
    })
    .on("mouseout", () => {
      hoverText.text("");
    });

  // Get the total length of the path
  const totalLength = path.node().getTotalLength();

  // Apply transition for the path
  path
    .attr("stroke-dasharray", `${totalLength} ${totalLength}`)
    .attr("stroke-dashoffset", totalLength)
    .transition()
    .duration(speed / 2)
    .ease(d3.easeLinear)
    .attr("stroke-dashoffset", 0);
}

function updateScale(sequence, x, y) {
  if (scaleMode.value === "max") {
    // Update the maximum x and y values
    maxX = Math.max(maxX, sequence.length - 1);
    maxY = Math.max(maxY, d3.max(sequence));
  } else {
    // Follow the new sequence values
    maxX = sequence.length - 1;
    maxY = d3.max(sequence);
  }

  // Update scales
  x.domain([0, maxX]);
  y.domain([0, maxY]);
}

function resetScale() {
  maxX = 0;
  maxY = 0;
}

function axisAnimation(svg, x, y, speed) {
  svg
    .select(".x-axis")
    .transition()
    .duration(speed / 4)
    .call(d3.axisBottom(x));
  svg
    .select(".y-axis")
    .transition()
    .duration(speed / 4)
    .call(d3.axisLeft(y));
}

// Function to draw the Collatz sequence with animation
function drawCollatzSequence(firstNumber) {
  const sequence = collatz(firstNumber);
  allSequences.push(sequence);

  // Create line generator
  const line = d3
    .line()
    .x((d, i) => x(i))
    .y((d) => y(d));

  updateScale(sequence, x, y);
  axisAnimation(svg, x, y, speed);
  applyPath(svg, sequence, line, firstNumber);

  text.text(`Number ${firstNumber}`);

  // Update all existing paths to fit the new scales
  svg.selectAll(".line").attr("d", line);
}

// Function to update the visualization
function updateVisualization() {
  drawCollatzSequence(firstNumber);
  firstNumber++;
}

const inputNumber = document.getElementById("inputNum");
const startNumber = document.getElementById("startNum");
const autoButton = document.getElementById("autoBtn");
const startButton = document.getElementById("startBtn");
const stopButton = document.getElementById("stopBtn");
const inputSpeed = document.getElementById("inputSpeed");
const setSpeedBtn = document.getElementById("setSpeedBtn");
const scaleMode = document.getElementById("scaleMode");

// Set up SVG dimensions
const width = 720;
const height = 560;
const margin = { top: 30, right: 20, bottom: 30, left: 100 };

// Create an SVG container
const svg = d3.select("svg").attr("width", width).attr("height", height);
// Append x-axis and y-axis once
svg
  .append("g")
  .attr("class", "x-axis")
  .attr("transform", `translate(0,${height - margin.bottom})`);

svg
  .append("g")
  .attr("class", "y-axis")
  .attr("transform", `translate(${margin.left},0)`);

// Set up scales
const x = d3.scaleLinear().range([margin.left, width - margin.right]);
const y = d3.scaleLinear().range([height - margin.bottom, margin.top]);

const color = d3.scaleOrdinal(d3.schemeCategory10);

// Append a text element for displaying the current starting number
const text = svg
  .append("text")
  .attr("x", width / 2)
  .attr("y", margin.top)
  .attr("text-anchor", "middle")
  .attr("dy", "-8px")
  .style("font-size", "2rem");

// Append a text element for displaying the hovered number
const hoverText = svg
  .append("text")
  .attr("x", width - margin.right)
  .attr("y", margin.top)
  .attr("text-anchor", "end")
  .attr("dy", "-8px")
  .style("font-size", "1.5rem");

let autoInterval = null;
let firstNumber = 4;
let allSequences = [];
let maxX = 0;
let maxY = 0;
let speed = 3000;

setupGraph();

//////////////////////////////////////////////////////////////////
// Event listeners
autoButton.addEventListener("click", () => {
  if (!isNaN(firstNumber)) {
    firstNumber = parseInt(startNumber.value);
    svg.selectAll(".sequence").remove();
    clearInterval(autoInterval);

    // Reset variables
    allSequences = [];
    resetScale();

    // Update visualization
    updateVisualization();
    autoInterval = setInterval(updateVisualization, speed);
  }
});

startButton.addEventListener("click", () => {
  const inputValue = parseInt(inputNumber.value);
  if (!isNaN(inputValue)) {
    svg.selectAll(".sequence").remove();
    resetScale();
    drawCollatzSequence(inputValue);
    inputNumber.value = "";
  } else {
    inputNumber.value = "";
  }
});

stopButton.addEventListener("click", () => {
  clearInterval(autoInterval);
});

setSpeedBtn.addEventListener("click", () => {
  const inputValue = parseInt(inputSpeed.value);
  if (!isNaN(inputValue)) {
    speed = inputValue;
    inputSpeed.value = "";

    // Restart the interval if it's running
    if (autoInterval !== null) {
      clearInterval(autoInterval);
      autoInterval = setInterval(updateVisualization, speed);
    }
  }
});
