const PHI = (1 + Math.sqrt(5)) / 2;

class Icosahedron extends Solid {
  constructor(
    color_ = [1.0, 0.1, 1.0, 1.0],
    matrix_ = new Matrix4(),
    pole = false
  ) {
    super("icosahedron", color_, matrix_);
    this.s = 1.0;
    this.pole = pole;
    this.remesh(pole);
  }

  remesh(pole = false) {
    let l = 0.5;
    let w = 1 / (2 * PHI);
    this.vertices = [];

    this.apex = [0, l, w];
    this.bott = [0, -l, -w];

    this.vertices.push([0, l, -w]);
    this.vertices.push([w, 0, -l]);
    this.vertices.push([l, +w, 0]);
    this.vertices.push([l, -w, 0]);
    this.vertices.push([w, 0, l]);
    this.vertices.push([0, -l, w]);
    this.vertices.push([-w, 0, l]);
    this.vertices.push([-l, -w, 0]);
    this.vertices.push([-l, +w, 0]);
    this.vertices.push([-w, 0, -l]);

    if (pole) {
      let a = Math.atan(w / l);
      let c = Math.cos(a);
      let s = Math.sin(a);

      let x = this.apex[1];
      let y = this.apex[2];
      this.apex[1] = x * c - y * s;
      this.apex[2] = x * s + y * c;

      x = this.bott[1];
      y = this.bott[2];
      this.bott[1] = x * c - y * s;
      this.bott[2] = x * s + y * c;

      for (let i = 0; i < this.vertices.length; i++) {
        x = this.vertices[i][1];
        y = this.vertices[i][2];
        this.vertices[i][1] = x * c - y * s;
        this.vertices[i][2] = x * s + y * c;
      }
    }
    this.calculateVerts();
  }

  calculateVerts() {
    let c1 = this.color.slice();
    let c2 = [
      this.color[0] * 2.2,
      this.color[1] * 2.2,
      this.color[2] * 2.2,
      this.color[3],
    ];
    let c3 = [
      this.color[0] * 3,
      this.color[1] * 3,
      this.color[2] * 3,
      this.color[3],
    ];
    let c4 = [
      this.color[0] * 0.8,
      this.color[1] * 0.7,
      this.color[2] * 0.7,
      this.color[3],
    ];
    let c5 = [
      this.color[0] * 0.5,
      this.color[1] * 0.5,
      this.color[2] * 0.5,
      this.color[3],
    ];
    let tbc = [c1, c2, c3, c4, c5];

    for (let i = 0; i < 20; i++) {
      this.tricolors.push(tbc[i % 5]);
    }

    let j = 0;
    for (let i = 0; i < 10; i += 2) {
      this.pushTriangle3D([
        ...this.apex,
        ...this.vertices[i],
        ...this.vertices[(i + 2) % 10],
      ]);

      this.pushTriangle3D([
        ...this.vertices[i],
        ...this.vertices[i + 1],
        ...this.vertices[(i + 2) % 10],
      ]);

      this.pushTriangle3D([
        ...this.vertices[i + 1],
        ...this.vertices[(i + 3) % 10],
        ...this.vertices[(i + 2) % 10],
      ]);

      this.pushTriangle3D([
        ...this.vertices[i + 1],
        ...this.bott,
        ...this.vertices[(i + 3) % 10],
      ]);
    }
  }
}
