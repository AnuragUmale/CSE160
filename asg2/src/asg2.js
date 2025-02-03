var VSHADER_SOURCE =
  "attribute vec4 a_Position;\n" +
  "uniform mat4 u_ModelMatrix;\n" +
  "uniform mat4 u_GlobalRotateMatrix;\n" +
  "void main() {\n" +
  "  gl_Position = u_GlobalRotateMatrix * u_ModelMatrix * a_Position;\n" +
  "}\n";

var FSHADER_SOURCE =
  "precision mediump float;\n" +
  "uniform vec4 u_FragColor;\n" +
  "void main() {\n" +
  "  gl_FragColor = u_FragColor;\n" +
  "}\n";

let canvas;
let gl;
let a_Position;
let u_Size;
let u_FragColor;
let u_ModelMatrix;
let u_GlobalRotateMatrix;

let jester;

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

  u_ModelMatrix = gl.getUniformLocation(gl.program, "u_ModelMatrix");
  if (!u_ModelMatrix) {
    console.log("Failed to get the storage location of u_ModelMatrix");
    return;
  }

  u_GlobalRotateMatrix = gl.getUniformLocation(
    gl.program,
    "u_GlobalRotateMatrix"
  );
  if (!u_GlobalRotateMatrix) {
    console.log("Failed to get the storage location of u_GlobalRotateMatrix");
    return;
  }

  var identity = new Matrix4();
  gl.uniformMatrix4fv(u_ModelMatrix, false, identity.elements);
}

const POINT = 0;
const TRIANGLE = 1;
const CIRCLE = 2;

let saved = [];

let g_selectedAlpha = 1.0;
let g_globalXAngle = 0;
let g_globalYAngle = 0;
let g_globalZAngle = 0;
let g_zoomScale = 0.5;

let g_animation = 0;
let g_exploding = false;

let ax = ["X", "Y", "Z"];
let appendages = ["uuparm", "foarm", "hand", "thigh", "calf", "foot"];

function addActionsForHtmlUI() {
  document
    .getElementById("xangleSlide")
    .addEventListener("mousemove", function (ev) {
      if (ev.buttons == 1) {
        g_globalXAngle = this.value;
      }
    });

  document
    .getElementById("yangleSlide")
    .addEventListener("mousemove", function (ev) {
      if (ev.buttons == 1) {
        g_globalYAngle = this.value;
      }
    });

  document
    .getElementById("zangleSlide")
    .addEventListener("mousemove", function (ev) {
      if (ev.buttons == 1) {
        g_globalZAngle = this.value;
      }
    });

  document
    .getElementById("zoomSlide")
    .addEventListener("mousemove", function (ev) {
      if (ev.buttons == 1) {
        g_zoomScale = this.value / 50;
        renderScene();
      }
    });

  document.getElementById("runButton").onclick = function (ev) {
    console.log("hello");
    sendTextToHTML("Anim: Run", "anim");
    g_animation = 1;
    disableSlidersforAnim(jester.runAnim);
    jester.runStart();
  };

  document.getElementById("stopButton").onclick = function (ev) {
    sendTextToHTML("Anim: None", "anim");
    enableAllSliders();
    g_animation = 0;
  };

  document.getElementById("resetButton").onclick = function (ev) {
    sendTextToHTML("Anim: None", "anim");
    enableAllSliders();
    jester.createBody();
    jester.transformBody();
    updateAllSliders();
    g_animation = 0;
  };

  ax.forEach((x) => {
    let element = document.getElementById("head" + x + "Slide");
    if (element != null)
      element.addEventListener("mousemove", function (ev) {
        if (ev.buttons == 1) {
          jester.rotateAppendage("head", this.value, x);
        }
      });
  });

  ax.forEach((x) => {
    let element = document.getElementById("pelvis" + x + "Slide");
    if (element != null)
      element.addEventListener("mousemove", function (ev) {
        if (ev.buttons == 1) {
          jester.rotateAppendage("pelvis", this.value, x);
        }
      });
  });

  ax.forEach((x) => {
    let element = document.getElementById("lchest" + x + "Slide");
    if (element != null)
      element.addEventListener("mousemove", function (ev) {
        if (ev.buttons == 1) {
          jester.rotateAppendage("lchest", this.value, x);
        }
      });
  });

  appendages.forEach((a) => {
    ax.forEach((x) => {
      let lname = "l" + a;
      let rname = "r" + a;
      let element = document.getElementById(lname + x + "Slide");
      if (element != null)
        element.addEventListener("mousemove", function (ev) {
          if (ev.buttons == 1) {
            jester.rotateAppendage(lname, this.value, x);
          }
        });
      element = document.getElementById(rname + x + "Slide");
      if (element != null)
        element.addEventListener("mousemove", function (ev) {
          if (ev.buttons == 1) {
            if (x != "X") jester.rotateAppendage(rname, -this.value, x);
            else jester.rotateAppendage(rname, this.value, x);
          }
        });
    });
  });
}

function disableSlidersforAnim(anim) {
  for (let s in anim) {
    let name = anim[s].part;
    let x = anim[s].axis;
    console.log(name);
    let element = document.getElementById(name + x + "Slide");
    if (element != null) element.disabled = true;
  }
}

function enableAllSliders() {
  ax.forEach((x) => {
    let element = document.getElementById("head" + x + "Slide");
    if (element != null) element.disabled = false;
  });

  ax.forEach((x) => {
    let element = document.getElementById("pelvis" + x + "Slide");
    if (element != null) element.disabled = false;
  });

  ax.forEach((x) => {
    let element = document.getElementById("lchest" + x + "Slide");
    if (element != null) element.disabled = false;
  });

  appendages.forEach((a) => {
    ax.forEach((x) => {
      let lname = "l" + a;
      let rname = "r" + a;
      let element = document.getElementById(lname + x + "Slide");
      if (element != null) element.disabled = false;
      element = document.getElementById(rname + x + "Slide");
      if (element != null) element.disabled = false;
    });
  });
}

function updateAllSliders() {
  ax.forEach((x) => {
    let element = document.getElementById("head" + x + "Slide");
    if (element != null) element.value = jester.rotations["head"][x];
  });

  ax.forEach((x) => {
    let element = document.getElementById("pelvis" + x + "Slide");
    if (element != null) element.value = jester.rotations["pelvis"][x];
  });

  ax.forEach((x) => {
    let element = document.getElementById("lchest" + x + "Slide");
    if (element != null) element.value = jester.rotations["lchest"][x];
  });

  appendages.forEach((a) => {
    ax.forEach((x) => {
      let lname = "l" + a;
      let rname = "r" + a;
      let element = document.getElementById(lname + x + "Slide");
      if (element != null) element.value = jester.rotations[lname][x];
      element = document.getElementById(rname + x + "Slide");
      if (element != null) element.value = jester.rotations[rname][x];
    });
  });
}

function updateSliders(anim) {
  for (let s in anim) {
    let name = anim[s].part;
    let x = anim[s].axis;
    let element = document.getElementById(name + x + "Slide");
    if (element != null) element.value = jester.rotations[name][x];
  }
}

function main() {
  setupWebGL();

  connectVariablesToGLSL();

  addActionsForHtmlUI();

  canvas.onmousedown = click;

  canvas.onmousemove = function (ev) {
    if (ev.buttons == 1) drag(ev);
  };

  gl.clearColor(0.0, 0.0, 0.0, 1.0);

  gl.enable(gl.DEPTH_TEST);

  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  jester = new Jester();
  requestAnimationFrame(tick);
}

function convertToCoordinatesEventToGL(ev) {
  var x = ev.clientX;
  var y = ev.clientY;
  var rect = ev.target.getBoundingClientRect();

  x = (x - rect.left - canvas.width / 2) / (canvas.width / 2);
  y = (canvas.height / 2 - (y - rect.top)) / (canvas.height / 2);

  return [x, y];
}

let px = 0;
let py = 0;

function click(ev) {
  if (ev.shiftKey && !g_exploding) {
    g_exploding = true;
    jester.explodeStart();
  } else [px, py] = convertToCoordinatesEventToGL(ev);
}

function drag(ev) {
  if (!ev.shiftKey) {
    let [x, y] = convertToCoordinatesEventToGL(ev);

    let dy = y - py;
    let dx = px - x;

    console.log(g_globalXAngle, g_globalYAngle);
    g_globalXAngle = (g_globalXAngle + dy) % 360;
    g_globalYAngle = (g_globalYAngle + dx) % 360;
    document.getElementById("xangleSlide").value = g_globalXAngle;
    document.getElementById("yangleSlide").value = g_globalYAngle;
  }
}

function randomizeColor(i, j) {
  g_selectedColor[0] = Noise.perlin(
    (g_selectedColor[0] + 0.1) / 0.9,
    3.9 * i,
    3.9 * j
  );
  g_selectedColor[1] = Noise.perlin(
    3.9 * i,
    (g_selectedColor[1] + 0.1) / 0.9,
    3.9 * j
  );
  g_selectedColor[2] = Noise.perlin(
    3.9 * i,
    3.9 * j,
    (g_selectedColor[2] + 0.1) / 0.9
  );

  updateSliders();
}

function renderScene() {
  var startTime = performance.now();

  var globalRotMat = new Matrix4();
  globalRotMat.rotate(g_globalXAngle, 1, 0, 0);
  globalRotMat.rotate(g_globalYAngle, 0, 1, 0);
  globalRotMat.rotate(g_globalZAngle, 0, 0, 1);
  globalRotMat.scale(g_zoomScale, g_zoomScale, g_zoomScale);
  gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements);

  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  jester.render();

  var duration = performance.now() - startTime;
  sendTextToHTML(
    " ms: " + Math.floor(duration) + " fps: " + Math.floor(10000 / duration),
    "numdot"
  );
}

let g_startTime = performance.now() / 1000.0;
let g_seconds = performance.now() / 1000.0 - g_startTime;

function tick() {
  if (g_animation > 0) g_seconds = performance.now() / 1000.0 - g_startTime;
  switch (g_animation) {
    case 1:
      {
        jester.runAnimation();
        updateSliders(jester.runAnim);
      }
      break;
  }
  if (g_exploding) {
    jester.explodeAnimation();
    if (!jester.isExploding) {
      g_exploding = false;
    }
  }

  renderScene();
  requestAnimationFrame(tick);
}

function sendTextToHTML(text, htmlID) {
  var htmllm = document.getElementById(htmlID);
  if (!htmllm) {
    console.log("Failed to get " + htmlID + " from HTML");
    return;
  }
  htmllm.innerHTML = text;
}
