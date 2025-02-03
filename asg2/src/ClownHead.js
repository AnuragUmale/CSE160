class ClownHead extends Head {
  constructor(matrix_ = new Matrix4()) {
    super([1.0, 1.0, 1.0, 1.0], matrix_);
  }

  calculateVerts() {
    this.extra = {};

    super.calculateVerts();

    this.extra["lhair1"] = new Prism(10, 0.2, [1, 0, 1, 1]);
    this.extra["lhair1"].setMaxWidth(1);
    this.extra["lhair1"].scaleFace("t", 0.4);
    this.extra["lhair1"].scaleFace("b", 0.6);

    for (let i = 2; i < 10; i++) {
      this.extra["lhair" + i.toString()] = new Prism(10, 0.3, [1, 0, 1, 1]);
      this.extra["lhair" + i.toString()].setMaxWidth(1);
      this.extra["lhair" + i.toString()].scaleFace("t", 0.15);
      this.extra["lhair" + i.toString()].scaleFace("b", 0.21);
    }
    this.extra["nose"] = new Cube([1, 0, 0, 1]);
  }

  transformExtra() {
    let M_lhair1 = new Matrix4(this.matrix);

    M_lhair1.translate(0, 0.2, 0.0);
    M_lhair1.scale(1.2, 1, 1.2);
    this.extra["lhair1"].matrix = M_lhair1;

    let m = new Matrix4(this.matrix);
    m.translate(-0.28, -0.05, -0.2);

    for (let i = 2; i < 10; i++) {
      if (i < 5) m.translate(0.01, 0, 0.15);
      else if (i < 8) m.translate(0.17, 0, 0);
      else m.translate(0.01, 0, -0.15);

      this.extra["lhair" + i.toString()].matrix = new Matrix4(m);
      this.extra["lhair" + i.toString()].matrix.scale(1, 1.3, 1);
    }

    let M_nose = new Matrix4(this.matrix);

    M_nose.translate(0, -0.05, -0.25);
    M_nose.scale(0.1, 0.1, 0.1);
    this.extra["nose"].matrix = M_nose;
  }

  render() {
    super.render();
    for (let part in this.extra) {
      this.extra[part].render();
    }
  }
}
