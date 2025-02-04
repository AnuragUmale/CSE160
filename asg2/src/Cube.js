class Cube extends Solid {
  constructor(color_ = [1.0, 1.0, 1.0, 1.0], matrix_ = new Matrix4()) {
    super("cube", color_, matrix_);
    this.type = "cube";
    this.color = color_;
    this.size = 1.0;
    this.matrix = matrix_;

    this.calculateVerts();
  }

  calculateVerts() {
    this.reset();
    let rgba = this.color.slice();
    let s = this.size / 2;

    let angleStep = 90;
    for (let currAngle = -135; currAngle < 180; currAngle += angleStep) {
      let nextAngle = currAngle + angleStep;
      let vec1 = [
        Math.cos((currAngle * Math.PI) / 180) * s * Math.sqrt(2),
        Math.sin((currAngle * Math.PI) / 180) * s * Math.sqrt(2),
      ];
      let vec2 = [
        Math.cos((nextAngle * Math.PI) / 180) * s * Math.sqrt(2),
        Math.sin((nextAngle * Math.PI) / 180) * s * Math.sqrt(2),
      ];

      rgba.forEach(function (item, index, array) {
        array[index] = 0.7 * item;
      });

      this.tricolors.push([rgba[0], rgba[1], rgba[2], rgba[3]]);

      this.pushTriangle3D([
        vec1[0],
        -s,
        vec1[1],
        vec2[0],
        s,
        vec2[1],
        vec2[0],
        -s,
        vec2[1],
        vec1[0],
        -s,
        vec1[1],
        vec1[0],
        s,
        vec1[1],
        vec2[0],
        s,
        vec2[1],
      ]);
    }

    this.tricolors.push([rgba[0], rgba[1], rgba[2], rgba[3]]);
    this.pushTriangle3D([
      -s,
      s,
      -s,
      s,
      s,
      s,
      s,
      s,
      -s,
      -s,
      s,
      -s,
      -s,
      s,
      s,
      s,
      s,
      s,
    ]);

    this.tricolors.push([rgba[0] * 0.2, rgba[1], rgba[2], rgba[3]]);
    this.pushTriangle3D([
      -s,
      -s,
      s,
      s,
      -s,
      -s,
      s,
      -s,
      s,
      -s,
      -s,
      s,
      -s,
      -s,
      -s,
      s,
      -s,
      -s,
    ]);
  }
}

function drawCube(color = [1, 1, 1, 1], matrix = new Matrix4()) {
  let cube = new Cube(color, matrix);

  cube.render();
  return cube;
}
