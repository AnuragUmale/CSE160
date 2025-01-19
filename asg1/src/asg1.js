var VSHADER_SOURCE = `
  attribute vec4 a_Position;
  uniform float u_Size;
  void main() {
    gl_Position = a_Position;
    gl_PointSize = u_Size;
  }`;

var FSHADER_SOURCE = `
  precision mediump float;
  uniform vec4 u_FragColor; 
  void main() {
    gl_FragColor = u_FragColor;
  }`;

let canvas;
let gl;
let a_Position;
let u_FragColor;
let u_Size;

function setupWebGL() {
  canvas = document.getElementById("webgl");

  gl = canvas.getContext("webgl", { preserveDrawingBuffer: true });
  if (!gl) {
    console.log("Failed to get the rendering context for WebGL");
    return;
  }
}

function connectVariablesToGLSL() {
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log("Failed to intialize shaders.");
    return;
  }

  a_Position = gl.getAttribLocation(gl.program, "a_Position");
  if (a_Position < 0) {
    console.log("Failed to get the storage location of a_Position");
    return;
  }

  u_FragColor = gl.getUniformLocation(gl.program, "u_FragColor");
  if (!u_FragColor) {
    console.log("Failed to get the storage location of u_FragColor");
    return;
  }

  u_Size = gl.getUniformLocation(gl.program, "u_Size");
  if (!u_Size) {
    console.log("Failed to get the storage location of u_Size");
    return;
  }
}

const POINT = 0;
const TRIANGLE = 1;
const CIRCLE = 2;

let g_selectedColor = [1.0, 1.0, 1.0, 1.0];
let g_selectedSize = 30;
let g_selectedType = POINT;
let g_selectedSegments = 10;

function addActionsForHTMLUI() {
  document.getElementById("clearButton").onclick = function () {
    g_shapesList = [];
    renderAllShapes();
  };
  document.getElementById("drawButton").onclick = function () {
    drawImage();
  };

  document.getElementById("pointButton").onclick = function () {
    g_selectedType = POINT;
  };
  document.getElementById("triButton").onclick = function () {
    g_selectedType = TRIANGLE;
  };
  document.getElementById("circleButton").onclick = function () {
    g_selectedType = CIRCLE;
  };

  document.getElementById("redSlide").addEventListener("mouseup", function () {
    g_selectedColor[0] = this.value / 100;
  });
  document
    .getElementById("greenSlide")
    .addEventListener("mouseup", function () {
      g_selectedColor[1] = this.value / 100;
    });
  document.getElementById("blueSlide").addEventListener("mouseup", function () {
    g_selectedColor[2] = this.value / 100;
  });

  document.getElementById("sizeSlide").addEventListener("mouseup", function () {
    g_selectedSize = this.value;
  });

  document
    .getElementById("segmentSlide")
    .addEventListener("input", function () {
      g_selectedSegments = parseInt(this.value);
      renderAllShapes();
    });
}

function main() {
  setupWebGL();

  connectVariablesToGLSL();

  addActionsForHTMLUI();

  canvas.onmousedown = click;

  canvas.onmousemove = function (ev) {
    if (ev.buttons == 1) {
      click(ev);
    }
  };

  gl.clearColor(0.0, 0.0, 0.0, 1.0);

  gl.clear(gl.COLOR_BUFFER_BIT);
}

var g_shapesList = [];
/*
var g_points = [];  
var g_colors = [];  
var g_sizes = []; 
*/

function click(ev) {
  [x, y] = convertCoordinatesEventToGL(ev);

  let point;
  if (g_selectedType == POINT) {
    point = new Point();
  } else if (g_selectedType == TRIANGLE) {
    point = new Triangle();
  } else {
    point = new Circle();
  }
  point.position = [x, y];
  point.color = g_selectedColor.slice();
  point.size = g_selectedSize;
  g_shapesList.push(point);

  renderAllShapes();
}

function convertCoordinatesEventToGL(ev) {
  var x = ev.clientX;
  var y = ev.clientY;
  var rect = ev.target.getBoundingClientRect();

  x = (x - rect.left - canvas.width / 2) / (canvas.width / 2);
  y = (canvas.height / 2 - (y - rect.top)) / (canvas.height / 2);

  return [x, y];
}

function renderAllShapes() {
  gl.clear(gl.COLOR_BUFFER_BIT);

  var len = g_shapesList.length;

  for (var i = 0; i < len; i++) {
    g_shapesList[i].render();
  }
}

class Circle {
  constructor() {
    this.type = "circle";
    this.position = [0.0, 0.0, 0.0];
    this.color = [1.0, 1.0, 1.0, 1.0];
    this.size = 30.0;
    this.segments = g_selectedSegments;
  }

  render() {
    var xy = this.position;
    var rgba = this.color;
    var size = this.size;
    var segments = this.segments;

    gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);

    var d = size / 250.0;

    let angleStep = 360 / segments;
    for (var angle = 0; angle < 360; angle = angle + angleStep) {
      let centerPt = [xy[0], xy[1]];
      let angle1 = angle;
      let angle2 = angle + angleStep;
      let vec1 = [
        Math.cos((angle1 * Math.PI) / 180) * d,
        Math.sin((angle1 * Math.PI) / 180) * d,
      ];
      let vec2 = [
        Math.cos((angle2 * Math.PI) / 180) * d,
        Math.sin((angle2 * Math.PI) / 180) * d,
      ];
      let pt1 = [centerPt[0] + vec1[0], centerPt[1] + vec1[1]];
      let pt2 = [centerPt[0] + vec2[0], centerPt[1] + vec2[1]];

      drawTriangle([xy[0], xy[1], pt1[0], pt1[1], pt2[0], pt2[1]]);
    }
  }
}

function drawColoredTriangle(vertices, color) {
  const n = 3;

  const vertexBuffer = gl.createBuffer();
  if (!vertexBuffer) {
    console.error("Failed to create the buffer object");
    return;
  }

  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);

  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.DYNAMIC_DRAW);

  const a_Position = gl.getAttribLocation(gl.program, "a_Position");
  gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(a_Position);

  const u_FragColor = gl.getUniformLocation(gl.program, "u_FragColor");
  gl.uniform4fv(u_FragColor, new Float32Array(color));

  gl.drawArrays(gl.TRIANGLES, 0, n);

  gl.deleteBuffer(vertexBuffer);
}

class Point {
  constructor() {
    this.type = "point";
    this.position = [0.0, 0.0, 0.0];
    this.color = [1.0, 1.0, 1.0, 1.0];
    this.size = 30.0;
  }

  render() {
    var xy = this.position;
    var rgba = this.color;
    var size = this.size;

    gl.disableVertexAttribArray(a_Position);

    gl.vertexAttrib3f(a_Position, xy[0], xy[1], 0.0);

    gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);

    gl.uniform1f(u_Size, size);

    gl.drawArrays(gl.POINTS, 0, 1);
  }
}

class Triangle {
  constructor() {
    this.type = "triangle";
    this.position = [0.0, 0.0, 0.0];
    this.color = [1.0, 1.0, 1.0, 1.0];
    this.size = 30.0;
  }

  render() {
    var xy = this.position;
    var rgba = this.color;
    var size = this.size;

    gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);

    gl.uniform1f(u_Size, size);

    var d = this.size / 400.0;
    drawTriangle([
      xy[0] - d,
      xy[1] - d,
      xy[0] + d,
      xy[1] - d,
      xy[0],
      xy[1] + d,
    ]);
  }
}

function drawTriangle(vertices) {
  var n = 3;

  var vertexBuffer = gl.createBuffer();
  if (!vertexBuffer) {
    console.log("Failed to create the buffer object");
    return -1;
  }

  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);

  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.DYNAMIC_DRAW);

  gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);

  gl.enableVertexAttribArray(a_Position);

  gl.drawArrays(gl.TRIANGLES, 0, n);
}

function drawImage() {
    g_shapesList = [];
  renderAllShapes();

  drawColoredTriangle([-0.3, -0.2, 0.3, -0.2, -0.3, 0.3], [0.8, 0.4, 0.2, 1]);
  drawColoredTriangle([0.3, -0.2, 0.3, 0.3, -0.3, 0.3], [0.8, 0.4, 0.2, 1]);
  drawColoredTriangle([-0.35, 0.3, 0.35, 0.3, 0, 0.5], [0.6, 0.2, 0, 1]);
  drawColoredTriangle([-0.05, -0.2, 0.05, -0.2, -0.05, 0], [0.4, 0.2, 0.1, 1]);
  drawColoredTriangle([0.05, -0.2, 0.05, 0, -0.05, 0], [0.4, 0.2, 0.1, 1]);
  drawColoredTriangle([-0.25, 0.15, -0.15, 0.15, -0.25, 0.25], [0.7, 0.9, 1, 1]);
  drawColoredTriangle([-0.15, 0.15, -0.15, 0.25, -0.25, 0.25], [0.7, 0.9, 1, 1]);
  drawColoredTriangle([0.15, 0.15, 0.25, 0.15, 0.15, 0.25], [0.7, 0.9, 1, 1]);
  drawColoredTriangle([0.25, 0.15, 0.25, 0.25, 0.15, 0.25], [0.7, 0.9, 1, 1]);

  const sunCenterX = 0.6;
  const sunCenterY = 0.6;
  const sunRadius = 0.1;
  const sunColor = [1, 1, 0, 1];
  const sunSegments = 50;
  for (let i = 0; i < sunSegments; i++) {
    const angle1 = (i / sunSegments) * 2 * Math.PI;
    const angle2 = ((i + 1) / sunSegments) * 2 * Math.PI;
    drawColoredTriangle(
      [sunCenterX, sunCenterY,
       sunCenterX + Math.cos(angle1) * sunRadius, sunCenterY + Math.sin(angle1) * sunRadius,
       sunCenterX + Math.cos(angle2) * sunRadius, sunCenterY + Math.sin(angle2) * sunRadius],
      sunColor
    );
  }

  for (let i = -0.45; i <= 0.45; i += 0.1) {
    drawColoredTriangle([i, -0.3, i + 0.05, -0.3, i, -0.2], [0.6, 0.3, 0.2, 1]);
    drawColoredTriangle([i + 0.05, -0.3, i + 0.05, -0.2, i, -0.2], [0.6, 0.3, 0.2, 1]);
  }
  drawColoredTriangle([-0.5, -0.25, 0.5, -0.25, -0.5, -0.23], [0.6, 0.3, 0.2, 1]);
  drawColoredTriangle([0.5, -0.25, 0.5, -0.23, -0.5, -0.23], [0.6, 0.3, 0.2, 1]);

  drawColoredTriangle([-0.4, -0.3, -0.5, -0.3, -0.45, -0.4], [0.3, 0.2, 0.1, 1]);
  drawColoredTriangle([0.4, -0.3, 0.5, -0.3, 0.45, -0.4], [0.3, 0.2, 0.1, 1]);
  drawColoredTriangle([-0.55, -0.4, 0.55, -0.4, 0, -0.5], [0.4, 0.3, 0.2, 1]);

  drawColoredTriangle([-0.8, -0.5, -0.6, -0.5, -0.7, -0.3], [0.1, 0.8, 0.2, 1]);
  drawColoredTriangle([0.6, -0.5, 0.8, -0.5, 0.7, -0.3], [0.1, 0.8, 0.2, 1]);
  drawColoredTriangle([-0.9, -0.5, 0.9, -0.5, 0, -0.6], [0.2, 0.6, 0.2, 1]);
  }
  