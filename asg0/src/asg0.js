function main() {
  var canvas = document.getElementById("example");
  if (!canvas.getContext) {
    console.log("Failed to get the rendering context for Canvas");
    return;
  }
  var ctx = canvas.getContext("2d");

  // Initial canvas setup
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function drawVector(v, color, ctx) {
  var scale = 20;
  var centerX = ctx.canvas.width / 2;
  var centerY = ctx.canvas.height / 2;

  ctx.beginPath();
  ctx.moveTo(centerX, centerY); // Start at the center of the canvas
  ctx.lineTo(centerX + v.elements[0] * scale, centerY - v.elements[1] * scale);
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.stroke();
}

function handleDrawEvent() {
  var canvas = document.getElementById("example");
  var ctx = canvas.getContext("2d");

  // Clear the canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Read values from input fields for v1
  var xV1 = parseFloat(document.getElementById("xCoordV1").value);
  var yV1 = parseFloat(document.getElementById("yCoordV1").value);
  // Read values from input fields for v2
  var xV2 = parseFloat(document.getElementById("xCoordV2").value);
  var yV2 = parseFloat(document.getElementById("yCoordV2").value);

  // Validate input for v1
  if (isNaN(xV1) || isNaN(yV1)) {
    alert("Please enter valid coordinates for v1.");
    return;
  }
  // Validate input for v2
  if (isNaN(xV2) || isNaN(yV2)) {
    alert("Please enter valid coordinates for v2.");
    return;
  }

  // Create vectors v1 and v2
  var v1 = new Vector3([xV1, yV1, 0]);
  var v2 = new Vector3([xV2, yV2, 0]);

  // Draw vectors
  drawVector(v1, "red", ctx);
  drawVector(v2, "blue", ctx);
}

function handleDrawOperationEvent() {
  var canvas = document.getElementById("example");
  var ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear canvas
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Read vector coordinates and scalar
  var xV1 = parseFloat(document.getElementById("xCoordV1").value);
  var yV1 = parseFloat(document.getElementById("yCoordV1").value);
  var xV2 = parseFloat(document.getElementById("xCoordV2").value);
  var yV2 = parseFloat(document.getElementById("yCoordV2").value);
  var scalar = parseFloat(document.getElementById("scalarInput").value);
  var operation = document.getElementById("operationSelect").value;

  // Create vectors
  var v1 = new Vector3([xV1, yV1, 0]);
  var v2 = new Vector3([xV2, yV2, 0]);

  // Draw original vectors
  drawVector(v1, "red", ctx);
  drawVector(v2, "blue", ctx);

  // Operation handling
  switch (operation) {
    case "add":
      var v3 = new Vector3(v1.elements);
      v3.add(v2);
      drawVector(v3, "green", ctx);
      break;
    case "sub":
      var v3 = new Vector3(v1.elements);
      v3.sub(v2);
      drawVector(v3, "green", ctx);
      break;
    case "mul":
      var v3 = new Vector3(v1.elements);
      v3.mul(scalar);
      var v4 = new Vector3(v2.elements);
      v4.mul(scalar);
      drawVector(v3, "green", ctx);
      drawVector(v4, "green", ctx);
      break;
    case "div":
      var v3 = new Vector3(v1.elements);
      v3.div(scalar);
      var v4 = new Vector3(v2.elements);
      v4.div(scalar);
      drawVector(v3, "green", ctx);
      drawVector(v4, "green", ctx);
      break;
    case "angleBetween":
      angleBetween(v1, v2);
      break;
    case "area":
      areaTriangle(v1, v2);
      break;
    case "magnitude":
      console.log("Magnitude v1:", v1.magnitude());
      console.log("Magnitude v2:", v2.magnitude());
      break;
    case "normalize":
      v1.normalize();
      v2.normalize();
      drawVector(v1, "green", ctx);
      drawVector(v2, "green", ctx);
      break;
  }
}

function angleBetween(v1, v2) {
  let dotProduct = Vector3.dot(v1, v2);
  let magnitudeV1 = v1.magnitude();
  let magnitudeV2 = v2.magnitude();
  let cosineOfAngle = dotProduct / (magnitudeV1 * magnitudeV2);
  let angleInRadians = Math.acos(cosineOfAngle);
  let angleInDegrees = angleInRadians * (180 / Math.PI);
  console.log("Angle:", angleInDegrees);
  return angleInDegrees;
}

function areaTriangle(v1, v2) {
  let crossProduct = Vector3.cross(v1, v2);
  let area = 0.5 * crossProduct.magnitude(); // Half the area of the parallelogram
  console.log("Area of the triangle:", area);
  return area;
}
