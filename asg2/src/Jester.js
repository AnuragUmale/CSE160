class Jester {
  constructor() {
    this.isExploding = false;
    this.createBody();
    this.transformBody();
    this.initAnimation();
  }

  createBody() {
    this.body = {};
    this.rotations = {};
    this.translations = {};
    this.scales = {};

    this.body["abdomen"] = new Icosahedron(
      [1, 0.5, 0.8, 1],
      new Matrix4(),
      true
    );

    this.body["pelvis"] = new Prism(10, 1.0, [1, 0.5, 0.8, 1]);
    this.body["pelvis"].setMaxWidth(1);
    this.body["pelvis"].scaleFace("b", 1.4);
    this.body["pelvis"].scaleFace("t", 0.8);

    this.body["pelvis"].setHeight(0.6);

    this.body["lpelvis"] = new Pyramid(10, 0.6, [1, 0.5, 0.8, 1]);
    this.body["lpelvis"].setMaxWidth(1.12);

    this.body["lpelvis"].setHeight(0.4);

    this.body["dress"] = new Prism(10, 0.9, [1, 0.2, 0.75, 1]);
    this.body["dress"].setMaxWidth(1);
    this.body["dress"].scaleFace("b", 1.4);
    this.body["dress"].scaleFace("t", 0.6);

    this.body["lchest"] = new Prism(10, 0.25, [1, 0.5, 0.8, 1]);
    this.body["lchest"].setMaxWidth(1);
    this.body["lchest"].scaleFace("t", 1.0);
    this.body["lchest"].scaleFace("b", 0.6);

    this.body["uchest"] = new Prism(10, 0.7, [1, 0.5, 0.8, 1]);
    this.body["uchest"].setMaxWidth(1);
    this.body["uchest"].scaleFace("t", 0.6);
    this.body["uchest"].scaleFace("b", 1.0);

    this.body["rshoulder"] = new Icosahedron([1, 0.5, 0.8, 1]);
    this.body["lshoulder"] = new Icosahedron([1, 0.5, 0.8, 1]);

    this.body["ruuparm"] = new Prism(10, 0.5, [1, 0, 0, 1]);
    this.body["ruuparm"].setMaxWidth(1);
    this.body["ruuparm"].scaleFace("t", 0.4);
    this.body["ruuparm"].scaleFace("b", 0.6);

    this.body["luuparm"] = new Prism(10, 0.5, [1, 0, 0, 1]);
    this.body["luuparm"].setMaxWidth(1);
    this.body["luuparm"].scaleFace("t", 0.4);
    this.body["luuparm"].scaleFace("b", 0.6);

    this.body["neck"] = new Cube([1, 0.5, 0.8, 1]);

    this.body["head"] = new ClownHead();

    this.body["rtjoint"] = new Icosahedron([1, 0, 1, 1], new Matrix4(), true);
    this.body["ltjoint"] = new Icosahedron([1, 0, 1, 1], new Matrix4(), true);

    const THIGH_LENGTH = 0.7;
    this.body["rthigh"] = new Prism(10, THIGH_LENGTH, [1, 0.8, 0.7, 1]);
    this.body["rthigh"].setMaxWidth(1);
    this.body["rthigh"].scaleFace("t", 0.4);
    this.body["rthigh"].scaleFace("b", 0.25);

    this.body["lthigh"] = new Prism(10, THIGH_LENGTH, [1, 0.8, 0.7, 1]);
    this.body["lthigh"].setMaxWidth(1);
    this.body["lthigh"].scaleFace("t", 0.4);
    this.body["lthigh"].scaleFace("b", 0.25);

    this.body["rknee"] = new Icosahedron([1, 1, 1, 1], new Matrix4(), true);
    this.body["lknee"] = new Icosahedron([1, 1, 1, 1], new Matrix4(), true);

    this.body["rcalf"] = new Prism(10, 0.8, [1, 1, 1, 1]);
    this.body["rcalf"].setMaxWidth(1);
    this.body["rcalf"].scaleFace("t", 0.4);
    this.body["rcalf"].scaleFace("b", 0.25);
    this.body["lcalf"] = new Prism(10, 0.8, [1, 1, 1, 1]);
    this.body["lcalf"].setMaxWidth(1);
    this.body["lcalf"].scaleFace("t", 0.4);
    this.body["lcalf"].scaleFace("b", 0.25);

    this.body["rfjoint"] = new Prism(10, 0.2, [1, 1, 1, 1]);
    this.body["rfjoint"].setMaxWidth(0.2);
    this.body["lfjoint"] = new Prism(10, 0.2, [1, 1, 1, 1]);
    this.body["lfjoint"].setMaxWidth(0.2);

    this.body["rfoot"] = new Prism(4, 0.2, [0.5, 0, 0, 1]);
    this.body["rfoot"].setMaxWidth(1);
    this.body["lfoot"] = new Prism(4, 0.2, [0.5, 0, 0, 1]);
    this.body["lfoot"].setMaxWidth(1);

    const ARM_LENGTH = 0.5;
    this.body["ruparm"] = new Prism(10, ARM_LENGTH, [1, 0.8, 0.7, 1]);
    this.body["ruparm"].setMaxWidth(1);
    this.body["ruparm"].scaleFace("t", 0.3);
    this.body["ruparm"].scaleFace("b", 0.25);
    this.body["luparm"] = new Prism(10, ARM_LENGTH, [1, 0.8, 0.7, 1]);
    this.body["luparm"].setMaxWidth(1);
    this.body["luparm"].scaleFace("t", 0.3);
    this.body["luparm"].scaleFace("b", 0.25);

    this.body["relbow"] = new Icosahedron([1, 1, 1, 1], new Matrix4(), true);
    this.body["lelbow"] = new Icosahedron([1, 1, 1, 1], new Matrix4(), true);

    this.body["rfoarm"] = new Prism(10, 0.5, [1, 0.5, 0.7, 1]);
    this.body["rfoarm"].setMaxWidth(1);
    this.body["rfoarm"].scaleFace("t", 0.25);
    this.body["rfoarm"].scaleFace("b", 0.2);
    this.body["lfoarm"] = new Prism(10, 0.5, [1, 0.5, 0.7, 1]);
    this.body["lfoarm"].setMaxWidth(1);
    this.body["lfoarm"].scaleFace("t", 0.25);
    this.body["lfoarm"].scaleFace("b", 0.2);

    this.body["rwrist"] = new Prism(10, 0.2, [1, 1, 1, 1]);
    this.body["rwrist"].setMaxWidth(0.2);
    this.body["lwrist"] = new Prism(10, 0.2, [1, 1, 1, 1]);
    this.body["lwrist"].setMaxWidth(0.2);

    this.body["rhand"] = new Prism(4, 0.2, [1, 0, 0, 1]);
    this.body["rhand"].setMaxWidth(1);
    this.body["lhand"] = new Prism(4, 0.2, [1, 0, 0, 1]);
    this.body["lhand"].setMaxWidth(1);

    for (let n in this.body) {
      this.rotations[n] = {
        isRotated: false,
        X: 0,
        Y: 0,
        Z: 0,
      };

      this.translations[n] = {
        isTranslated: false,
        X: 0,
        Y: 0,
        Z: 0,
      };

      this.scales[n] = {
        isScaled: false,
        X: 0,
        Y: 0,
        Z: 0,
      };
    }
  }

  transformBody() {
    let M_abdomen = new Matrix4();

    this.checkRotation("abdomen", M_abdomen);
    this.checkTranslation("abdomen", M_abdomen);
    M_abdomen.translate(0, -0.1, 0);
    let M_pelvis = new Matrix4(M_abdomen);
    let M_lchest = new Matrix4(M_abdomen);

    M_abdomen.scale(0.3, 0.3, 0.3);

    this.body["abdomen"].matrix = M_abdomen;

    this.checkRotation("pelvis", M_pelvis);
    M_pelvis.translate(0, -0.2, 0);

    let M_lpelvis = new Matrix4(M_pelvis);
    let M_rtjoint = new Matrix4(M_pelvis);
    let M_ltjoint = new Matrix4(M_pelvis);

    M_pelvis.scale(0.4, 0.4, 0.3);
    this.body["pelvis"].matrix = M_pelvis;

    M_lpelvis.translate(0, -0.22, 0);
    let M_dress = new Matrix4(M_lpelvis);
    M_lpelvis.scale(0.5, -0.5, 0.37);
    this.body["lpelvis"].matrix = M_lpelvis;

    M_dress.translate(0, 0.1, 0);
    M_dress.scale(0.7, 0.5, 0.7);
    this.body["dress"].matrix = M_dress;

    M_rtjoint.translate(-0.13, -0.13, 0);
    let M_rthigh = new Matrix4(M_rtjoint);
    M_rtjoint.scale(0.15, 0.15, 0.15);
    this.body["rtjoint"].matrix = M_rtjoint;

    this.checkRotation("rthigh", M_rthigh);
    M_rthigh.translate(0, -0.2, 0);
    let M_rknee = new Matrix4(M_rthigh);

    M_rthigh.scale(0.5, 0.7, 0.5);
    this.body["rthigh"].matrix = M_rthigh;

    this.checkRotation("rknee", M_rknee);
    M_rknee.translate(0, -0.29, 0);
    let M_rcalf = new Matrix4(M_rknee);

    M_rknee.scale(0.12, 0.12, 0.12);
    this.body["rknee"].matrix = M_rknee;

    this.checkRotation("rcalf", M_rcalf);
    M_rcalf.translate(0, -0.23, 0);
    let M_rfjoint = new Matrix4(M_rcalf);

    M_rcalf.scale(0.3, 0.45, 0.3);
    this.body["rcalf"].matrix = M_rcalf;

    this.checkRotation("rfjoint", M_rfjoint);
    M_rfjoint.translate(0, -0.2, 0);
    M_rfjoint.rotate(-90, 0, 0, 1);
    let M_rfoot = new Matrix4(M_rfjoint);

    M_rfjoint.scale(0.4, 0.4, 0.4);
    this.body["rfjoint"].matrix = M_rfjoint;

    this.checkRotation("rfoot", M_rfoot);
    M_rfoot.rotate(90, 0, 0, 1);
    M_rfoot.translate(0, -0.02, -0.1);

    M_rfoot.scale(0.2, 0.3, 0.25);
    this.body["rfoot"].matrix = M_rfoot;

    M_ltjoint.translate(0.13, -0.13, 0);
    let M_lthigh = new Matrix4(M_ltjoint);
    M_ltjoint.scale(0.15, 0.15, 0.15);
    this.body["ltjoint"].matrix = M_ltjoint;

    this.checkRotation("lthigh", M_lthigh);
    M_lthigh.translate(0, -0.2, 0);
    let M_lknee = new Matrix4(M_lthigh);

    M_lthigh.scale(0.5, 0.7, 0.5);
    this.body["lthigh"].matrix = M_lthigh;

    this.checkRotation("lknee", M_lknee);
    M_lknee.translate(0, -0.29, 0);
    let M_lcalf = new Matrix4(M_lknee);

    M_lknee.scale(0.12, 0.12, 0.12);
    this.body["lknee"].matrix = M_lknee;

    this.checkRotation("lcalf", M_lcalf);
    M_lcalf.translate(0, -0.23, 0);
    let M_lfjoint = new Matrix4(M_lcalf);

    M_lcalf.scale(0.3, 0.45, 0.3);
    this.body["lcalf"].matrix = M_lcalf;

    this.checkRotation("lfjoint", M_lfjoint);
    M_lfjoint.translate(0, -0.2, 0);
    M_lfjoint.rotate(90, 0, 0, 1);
    let M_lfoot = new Matrix4(M_lfjoint);

    M_lfjoint.scale(0.4, 0.4, 0.4);
    this.body["lfjoint"].matrix = M_lfjoint;

    this.checkRotation("lfoot", M_lfoot);
    M_lfoot.rotate(-90, 0, 0, 1);
    M_lfoot.translate(0, -0.02, -0.1);
    M_lfoot.scale(0.2, 0.3, 0.25);
    this.body["lfoot"].matrix = M_lfoot;

    this.checkRotation("lchest", M_lchest);
    M_lchest.translate(0, 0.1, 0);
    let M_uchest = new Matrix4(M_lchest);
    M_lchest.scale(0.5, 0.5, 0.5);
    this.body["lchest"].matrix = M_lchest;

    M_uchest.translate(0, 0.23, 0);
    let M_neck = new Matrix4(M_uchest);
    let M_rshoulder = new Matrix4(M_uchest);
    let M_lshoulder = new Matrix4(M_uchest);

    M_uchest.scale(0.5, 0.5, 0.5);
    this.body["uchest"].matrix = M_uchest;

    this.checkRotation("rshoulder", M_rshoulder);
    M_rshoulder.translate(-0.18, 0.07, 0);
    let M_ruuparm = new Matrix4(M_rshoulder);
    M_rshoulder.scale(0.1, 0.1, 0.1);
    this.body["rshoulder"].matrix = M_rshoulder;

    this.checkRotation("ruuparm", M_ruuparm);
    M_ruuparm.rotate(-90, 0, 0, 1);
    M_ruuparm.translate(-0.0, -0.05, 0);

    let M_ruparm = new Matrix4(M_ruuparm);
    M_ruuparm.scale(0.3, 0.3, 0.3);
    this.body["ruuparm"].matrix = M_ruuparm;

    this.checkRotation("ruparm", M_ruparm);
    M_ruparm.translate(-0.0, -0.2, 0);

    let M_relbow = new Matrix4(M_ruparm);

    M_ruparm.scale(0.5, 0.8, 0.5);
    this.body["ruparm"].matrix = M_ruparm;

    this.checkRotation("relbow", M_relbow);
    M_relbow.translate(0, -0.23, 0);
    let M_rfoarm = new Matrix4(M_relbow);

    M_relbow.scale(0.08, 0.08, 0.08);
    this.body["relbow"].matrix = M_relbow;

    this.checkRotation("rfoarm", M_rfoarm);
    M_rfoarm.translate(0, -0.15, 0);
    let M_rwrist = new Matrix4(M_rfoarm);

    M_rfoarm.scale(0.4, 0.5, 0.4);
    this.body["rfoarm"].matrix = M_rfoarm;

    this.checkRotation("rwrist", M_rwrist);
    M_rwrist.translate(0, -0.15, 0);
    M_rwrist.rotate(90, 0, 0, 1);
    let M_rhand = new Matrix4(M_rwrist);

    M_rwrist.scale(0.3, 0.3, 0.3);
    this.body["rwrist"].matrix = M_rwrist;

    this.checkRotation("rhand", M_rhand);
    M_rhand.rotate(-90, 0, 0, 1);

    M_rhand.translate(0, -0.1, 0);

    M_rhand.scale(0.03, 0.7, 0.16);
    this.body["rhand"].matrix = M_rhand;

    this.checkRotation("lshoulder", M_lshoulder);
    M_lshoulder.translate(0.18, 0.07, 0);
    let M_luuparm = new Matrix4(M_lshoulder);
    M_lshoulder.scale(0.1, 0.1, 0.1);
    this.body["lshoulder"].matrix = M_lshoulder;

    this.checkRotation("luuparm", M_luuparm);
    M_luuparm.rotate(90, 0, 0, 1);

    M_luuparm.translate(-0.0, -0.05, 0);

    let M_luparm = new Matrix4(M_luuparm);
    M_luuparm.scale(0.3, 0.3, 0.3);
    this.body["luuparm"].matrix = M_luuparm;

    this.checkRotation("luparm", M_luparm);
    M_luparm.translate(0.0, -0.2, 0);

    let M_lelbow = new Matrix4(M_luparm);

    M_luparm.scale(0.5, 0.8, 0.5);
    this.body["luparm"].matrix = M_luparm;

    this.checkRotation("lelbow", M_lelbow);
    M_lelbow.translate(0, -0.23, 0);
    let M_lfoarm = new Matrix4(M_lelbow);

    M_lelbow.scale(0.08, 0.08, 0.08);
    this.body["lelbow"].matrix = M_lelbow;

    this.checkRotation("lfoarm", M_lfoarm);
    M_lfoarm.translate(0, -0.15, 0);
    let M_lwrist = new Matrix4(M_lfoarm);

    M_lfoarm.scale(0.4, 0.5, 0.4);
    this.body["lfoarm"].matrix = M_lfoarm;

    this.checkRotation("lwrist", M_lwrist);
    M_lwrist.translate(0, -0.15, 0);
    M_lwrist.rotate(-90, 0, 0, 1);
    let M_lhand = new Matrix4(M_lwrist);

    M_lwrist.scale(0.3, 0.3, 0.3);
    this.body["lwrist"].matrix = M_lwrist;

    this.checkRotation("lhand", M_lhand);
    M_lhand.rotate(90, 0, 0, 1);
    M_lhand.translate(0, -0.1, 0.0);
    M_lhand.scale(0.03, 0.7, 0.16);
    this.body["lhand"].matrix = M_lhand;

    M_neck.translate(0, 0.4, 0.0);
    let M_head = new Matrix4(M_neck);
    M_neck.scale(0, 0, 0);
    this.body["neck"].matrix = M_neck;

    this.checkRotation("head", M_head);
    this.checkTranslation("head", M_head);
    M_head.translate(0, 0.03, 0);

    this.checkScale("head", M_head);
    this.body["head"].setMatrix(M_head);
    M_head.scale(0.4, 0.4, 0.4);
  }

  rotateAppendage(part, angle, axis, inverse = false) {
    this.setRotation(part, angle, axis, inverse ? -1 : 1);
    this.transformBody();
  }

  setRotation(part, angle, axis) {
    this.rotations[part][axis] = angle;
    this.rotations[part].isRotated = !(
      this.rotations[part]["X"] == 0 &&
      this.rotations[part]["Y"] == 0 &&
      this.rotations[part]["Z"] == 0
    );
  }

  checkRotation(part, matrix) {
    if (this.rotations[part].isRotated) {
      matrix.rotate(this.rotations[part]["X"], 1, 0, 0);
      matrix.rotate(this.rotations[part]["Y"], 0, 1, 0);
      matrix.rotate(this.rotations[part]["Z"], 0, 0, 1);
    }
  }

  setScale(part, scale, axis = "") {
    if (axis == "") {
      this.scales[part]["X"] = scale;
      this.scales[part]["Y"] = scale;
      this.scales[part]["Z"] = scale;
    } else this.scales[part][axis] = scale;
    this.scales[part].isScaled = !(
      this.scales[part]["X"] == 1 &&
      this.scales[part]["Y"] == 1 &&
      this.scales[part]["Z"] == 1
    );
  }

  checkScale(part, matrix) {
    if (this.scales[part].isScaled) {
      matrix.scale(
        this.scales[part]["X"],
        this.scales[part]["Y"],
        this.scales[part]["Z"]
      );
    }
  }

  setTranslation(part, x = 0, y = 0, z = 0) {
    this.translations[part]["X"] = x;
    this.translations[part]["Y"] = y;
    this.translations[part]["Z"] = z;
    this.translations[part].isTranslated = !(
      this.translations[part]["X"] == 0 &&
      this.translations[part]["Y"] == 0 &&
      this.translations[part]["Z"] == 0
    );
  }

  checkTranslation(part, matrix) {
    if (this.translations[part].isTranslated) {
      matrix.translate(
        this.translations[part]["X"],
        this.translations[part]["Y"],
        this.translations[part]["Z"]
      );
    }
  }

  render() {
    for (let part in this.body) {
      this.body[part].render();
    }
  }

  initAnimation() {
    const SPEED = 10;
    this.runAnim = [
      {
        part: "rthigh",
        min: -50,
        max: 40,
        transform: "rotate",
        axis: "X",
        tween: (s) => {
          return Math.sin(SPEED * s);
        },
      },
      {
        part: "lthigh",
        min: -50,
        max: 40,
        transform: "rotate",
        axis: "X",
        tween: (s) => {
          return Math.cos(SPEED * s + Math.PI / 2);
        },
      },
      {
        part: "lcalf",
        min: -60,
        max: -0,
        transform: "rotate",
        axis: "X",
        tween: (s) => {
          return Math.cos(SPEED * s + Math.PI / 2);
        },
      },
      {
        part: "rcalf",
        min: -90,
        max: -0,
        transform: "rotate",
        axis: "X",
        tween: (s) => {
          return Math.sin(SPEED * s);
          return Math.sin(s + (0 * Math.PI) / 2);
        },
      },
      {
        part: "abdomen",
        min: 0.1,
        max: -0.1,
        transform: "translate",
        tweenX: (s) => 0,
        tweenY: (s) => {
          return Math.cos(2 * SPEED * s);
        },
        tweenZ: (s) => 0,
      },
      {
        part: "ruuparm",
        min: -35,
        max: 55,
        transform: "rotate",
        axis: "X",
        tween: (s) => {
          return Math.cos(SPEED * s + Math.PI / 2);
        },
      },
      {
        part: "luuparm",
        min: -35,
        max: 55,
        transform: "rotate",
        axis: "X",
        tween: (s) => {
          return Math.sin(SPEED * s);
        },
      },
      {
        part: "rfoarm",
        min: 30,
        max: 90,
        transform: "rotate",
        axis: "X",
        tween: (s) => {
          return Math.cos(SPEED * s + Math.PI / 2);
        },
      },
      {
        part: "lfoarm",
        min: 30,
        max: 90,
        transform: "rotate",
        axis: "X",
        tween: (s) => {
          return Math.sin(SPEED * s);
        },
      },
      {
        part: "rfoot",
        min: -50,
        max: 0,
        transform: "rotate",
        axis: "Y",
        tween: (s) => {
          return Math.sin(SPEED * s);
        },
      },
      {
        part: "lfoot",
        min: 0,
        max: 50,
        transform: "rotate",
        axis: "Y",
        tween: (s) => {
          return Math.sin(SPEED * s);
        },
      },
    ];
    this.runInit = [
      {
        part: "ruuparm",
        transform: "rotate",
        angle: 60,
        axis: "Z",
      },
      {
        part: "luuparm",
        transform: "rotate",
        angle: -60,
        axis: "Z",
      },
    ];

    this.resetExplode();
  }

  resetExplode() {
    this.explodeAnim = [
      {
        part: "head",
        min: 1,
        max: 4,
        timer: 0,
        countdown: 10,
        transform: "scale",
        axis: "",
        tween: (s) => {
          this.explodeAnim[0].timer += 0.01;
          let t = this.explodeAnim[0].timer;

          if (t < this.explodeAnim[0].countdown)
            return lerp(
              t,
              0,
              this.explodeAnim[0].countdown,
              this.explodeAnim[0].min,
              this.explodeAnim[0].max
            );
          else return 0;
        },
      },
      {
        part: "head",
        min: -0.01,
        max: 0.01,
        transform: "translate",
        tweenX: (s) => {
          return Math.random() * 2 - 1;
        },
        tweenY: (s) => {
          return Math.random() * 2 - 1;
        },
        tweenZ: (s) => {
          return Math.random() * 2 - 1;
        },
      },
    ];
  }

  startAnim(animation) {
    for (let i in animation) {
      let anim = animation[i];
      if (anim.transform == "rotate") {
        this.setRotation(anim.part, anim.angle, anim.axis);
      } else if (anim.transform == "translate") {
        this.setTranslation(anim.part, anim.x, anim.y, anim.z);
      } else {
        this.setScale(anim.part, anim.scale, anim.axis);
      }
    }
    this.transformBody();
  }

  animate(animation) {
    for (let i in animation) {
      let anim = animation[i];

      let MID = (anim.max - anim.min) / 2;
      let BEGIN = MID + anim.min;
      if (anim.transform == "rotate") {
        this.setRotation(
          anim.part,
          BEGIN + MID * anim.tween(g_seconds),
          anim.axis
        );
      } else if (anim.transform == "translate") {
        this.setTranslation(
          anim.part,
          BEGIN + MID * anim.tweenX(g_seconds),
          BEGIN + MID * anim.tweenY(g_seconds),
          BEGIN + MID * anim.tweenZ(g_seconds)
        );
      } else {
        this.setScale(anim.part, anim.tween(g_seconds), anim.axis);
      }
    }
    this.transformBody();
  }
  runStart() {
    this.startAnim(this.runInit);
  }
  runAnimation() {
    this.animate(this.runAnim);
  }

  explodeStart() {
    this.isExploding = true;
  }
  explodeAnimation() {
    this.animate(this.explodeAnim);
    if (this.explodeAnim[0].timer > 14) {
      this.isExploding = false;
      this.resetExplode();
      this.setScale("head", 1, "");
      this.setTranslation("head", 0, 0, 0);
      this.body["head"].matrix = new Matrix4();
      this.transformBody();
    }
  }
}
