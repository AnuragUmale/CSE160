/**
 *
 * Description:
 *  This class creates a beautiful? cubic fox
 */

// Left, right, back and front are relative to the fox

var K_BODY       = "K_BODY";
var K_FR_FOOT    = "K_FR_FOOT";
var K_FL_FOOT    = "K_FL_FOOT";
var K_BR_FOOT    = "K_BR_FOOT";
var K_BL_FOOT    = "K_BL_FOOT";
var K_TAIL_1     = "K_TAIL_1";
var K_TAIL_2     = "K_TAIL_2";
var K_R_EAR      = "K_R_EAR";
var K_L_EAR      = "K_L_EAR";
var K_NOSE       = "K_NOSE";
var K_R_EYE      = "K_R_EYE";
var K_R_EYE_BALL = "K_R_EYE_BALL";
var K_L_EYE      = "K_L_EYE";
var K_L_EYE_BALL = "K_L_EYE_BALL";

var K_FEET_ANIM  = "K_FEET_ANIM";
var K_TAIL_ANIM1 = "K_TAIL_ANIM1";
var K_TAIL_ANIM2 = "K_TAIL_ANIM2";

var K_BD_ROTATE = "K_BD_ROTATE";
var K_BD_SPIN = "K_BD_SPIN";

class Fox extends Animal {

    constructor(gl, matrix, size) {
        super(gl, new Matrix4().translate(0, 1.6, 0).multiply(matrix), size);
        this.matrixUpdated = true;

        // Animations
        this.animations = new Map();
        this.animations.set(K_FEET_ANIM,  new Animation(-20, 20,   100, true));
        this.animations.set(K_TAIL_ANIM1, new Animation(-40, 40,   200, true));
        this.animations.set(K_TAIL_ANIM2, new Animation(-20, 20,   300, true));

        this.bdStep = 0;
        this.bdChangingStep = false;
        this.breakdancing = false;
        this.animations.set(K_BD_ROTATE, new Animation(0,  180, 500, false)); // Breakdance rotate
        this.animations.set(K_BD_SPIN,   new Animation(0, 1800, 500, false)); // Breakdance spin

        this.movingAnimations = [
            this.animations.get(K_FEET_ANIM)
        ];

        // Movement
        this.directionX = 0;
        this.directionZ = 1;
        this.posX = getPosition(this.matrix)[0];
        this.posZ = getPosition(this.matrix)[2];
        this.ry = -90;

        this.moving = false;
        this.movingDirection = this.N;
        this.running = false;
        this.RUN_COEF = 3;

        // Jumping
        this.jumping = false;
        this.jump_height = 0.5;
        this.jump_time = 500;
        this.jump_time_elapsed = 0;
        this.jump_last_val = 0;

        // We use a function to compute the position at a given time
        // For that, we need to say which part of the functin interests us:
        // This way: [jump_s_fct, jump_e_fct]
        // Then, to adjust the jump hein, we need to know what is the max
        // value of this function in the given interval (jump_m_fct)
        this.jump_s_fct = - Math.PI;
        this.jump_e_fct = 2*Math.PI;
        this.jump_m_fct = 1;
        this.jump_fct = (x) => {
            return Math.cos(x) + 1; // 0 -> pi
        }

        // Directions are relative to the fox, not to the world
        this.E = 0;
        this.NE = 1;
        this.N  = 2;
        this.NW = 3;
        this.W  = 4;
        this.SW = 5;
        this.S  = 6;
        this.SE = 7;
        this.direction = this.N;

        // Shapes
        this.shapes = new Map();
        this.shapes.set(K_BODY, new Cube(gl, new Matrix4(), [1,0.5,0,1, 1,0.5,0,1, 1,0.5,0,1, 1,0.5,0,1, 1,0.45,0,1, 1,0.5,0,1], null, null));
        this.shapes.set(K_FR_FOOT   , new Cube(gl, new Matrix4(), [1.0, 0.4, 0.0, 1], null, null));
        this.shapes.set(K_FL_FOOT   , new Cube(gl, new Matrix4(), [1.0, 0.4, 0.0, 1], null, null));
        this.shapes.set(K_BR_FOOT   , new Cube(gl, new Matrix4(), [1.0, 0.4, 0.0, 1], null, null));
        this.shapes.set(K_BL_FOOT   , new Cube(gl, new Matrix4(), [1.0, 0.4, 0.0, 1], null, null));
        this.shapes.set(K_TAIL_1    , new Cube(gl, new Matrix4(), [1.0, 0.4, 0.0, 1], null, null));
        this.shapes.set(K_TAIL_2    , new Cube(gl, new Matrix4(), [0.1, 0.1, 0.1, 1], null, null));
        this.shapes.set(K_R_EAR     , new Cube(gl, new Matrix4(), [0.2, 0.2, 0.2, 1], null, null));
        this.shapes.set(K_L_EAR     , new Cube(gl, new Matrix4(), [0.2, 0.2, 0.2, 1], null, null));
        this.shapes.set(K_NOSE      , new Cube(gl, new Matrix4(), [0.2, 0.2, 0.2, 1], null, null));
        this.shapes.set(K_R_EYE     , new Cube(gl, new Matrix4(), [1.0, 1.0, 1.0, 1], null, null));
        this.shapes.set(K_R_EYE_BALL, new Cube(gl, new Matrix4(), [0.1, 0.1, 0.1, 1], null, null));
        this.shapes.set(K_L_EYE     , new Cube(gl, new Matrix4(), [1.0, 1.0, 1.0, 1], null, null));
        this.shapes.set(K_L_EYE_BALL, new Cube(gl, new Matrix4(), [0.1, 0.1, 0.1, 1], null, null));
    }

    update(dt) {
        this._updateSpecialAnimations();

        if (this.jumping) {
            this._updateJump(dt);
        }

        if (this.breakdancing) {
            this._updateBreakdance(dt);
        }

        // Update the fox's components
        if (this.matrixUpdated) {
            this._updateStaticParts();
            this._updateFeet(dt);
            this._updateTail(dt);
        } else {
            if (!this.animations.get(K_FEET_ANIM).isPaused()) {
                this._updateFeet(dt);
            }
            if (!this.animations.get(K_TAIL_ANIM1).isPaused() || (!this.animations.get(K_TAIL_ANIM2).isPaused())) {
                this._updateTail(dt);
            }
        }

        this.matrixUpdated = false;
    }

    //// UTILITY ////

    requestUpdate() {
        this.matrixUpdated = true;
    }

    setMatrix(matrix) {
        this.matrix = matrix;
        this.matrixUpdated = true;
    }

    getRotation () {
        return this.ry + 90;
    }

    //// ANIMATION HANDLERS METHODS ////

    move (up, down, right, left) {
        if (!up && !down && !right && !left) {
            this.stopMoving();
            return;
        }

        const STEP = 0.1 * (this.running ? this.RUN_COEF : 1);

        // Find the direction
        let direction;
        if (up) {
            if (right) {
                direction = this.NE;
                this._move(STEP, 0);
                this._move(STEP, 3);
            } else if (left) {
                direction = this.NW;
                this._move(STEP, 0);
                this._move(STEP, 2);
            } else {
                direction = this.N;
                this._move(STEP, 0);
            }
        } else if (down) {
            if (right) {
                direction = this.SE;
                this._move(STEP, 1);
                this._move(STEP, 3);
            } else if (left) {
                direction = this.SW;
                this._move(STEP, 1);
                this._move(STEP, 2);
            } else {
                direction = this.S;
                this._move(STEP, 1);
            }
        } else if (right) {
            direction = this.E;
            this._move(STEP, 3);
        } else if (left) {
            direction = this.W;
            this._move(STEP, 2);
        }

        // Translate
        this.applyMovements();

        // Start the animations
        for (let anim of this.movingAnimations) {
            if (anim.isFinished()) {
                anim.start();
            }
        }

        // Tell that it's moving
        this.movingDirection = direction;
        this.moving = true;
    }

    rotate (alpha) {
        this.ry += alpha % 360;
    }

    /**
     * Moves the fox.
     * @param {Float} step
     * @param {0, 1, 2, or 3} direction 0: forward, 1: backward, 2: left, 3: right
     */
    _move (step, dir) {
        if (dir === 0 || dir === 2) step *= -1;

        if (dir === 0 || dir === 1) {
            this.posX += step * this.directionX;
            this.posZ += step * this.directionZ;
        } else {
            let cx = - this.directionZ;
            let cz = this.directionX;

            let length = Math.sqrt(cx**2 + cz**2);
            let normX = cx / length;
            let normZ = cz / length;

            this.posX += normX * step;
            this.posZ += normZ * step;
        }
    }

    applyMovements () {
        let toRad = Math.PI/180;
        this.directionX = Math.cos(this.ry * toRad);
        this.directionZ = Math.sin(this.ry * toRad);
        this.setMatrix(this.getDefaultMatrix().translate(this.posX, 0, - this.posZ).translate(0, 0, 2).rotate(this.ry +90, 0, 1, 0).translate(0, 0, -2));
    }

    toggleTailAnimation () {
        let tail_anim = this.animations.get(K_TAIL_ANIM1);
        if (tail_anim.isFinished()) {
            tail_anim.start();
        } else {
            tail_anim.stop();
        }
    }

    stopMoving () {
        if (!this.moving) return;

        // Stop animations
        for (let animation of this.movingAnimations){
            animation.stop();
        };

        // Reset dynamic parts to their defaut position
        this._updateFeet();

        // Tell that the fox is not moving
        this.moving = false;
    }

    isMoving () {
        return this.moving;
    }

    jump (bool) {
        if (!this.jumping && bool) {
            this.jump_last_val = 0;
            this.jump_time_elapsed = 0;
            this.jumping = true;
        }
    }

    run (shouldRun) {
        let animSpeed = this.animations.get(K_FEET_ANIM).getSpeed();
        if (this.running && !shouldRun) { // Needs to stop running
            this.running = false;
            this.animations.get(K_FEET_ANIM).setSpeed(animSpeed / this.RUN_COEF);
        } else if (!this.running && shouldRun) { // Needs to start running
            this.running = true;
            this.animations.get(K_FEET_ANIM).setSpeed(animSpeed * this.RUN_COEF);
        }
    }

    breakdance (bool) {
        if (!this.breakdancing && bool) {
            this.bdStep = 0;
            this.breakdancing = true;
            this.bdChangingStep = true;
            this.moving = true;
            this.jump();
        }
    }

    //// PRIVATE METHODS ////

    _updateSpecialAnimations () {
        if (this.breakdancing) {
            // Animations contained by the breakdance, in the right order
            let anims = [
                this.animations.get(K_BD_ROTATE),
                this.animations.get(K_BD_SPIN),
                this.animations.get(K_BD_ROTATE)
            ];

            if (this.bdStep < anims.length) { // If we did not finish the whole animation yet
                let anim = anims[this.bdStep];
                if (anim.isFinished()) { // If the animation is not active, then
                    if (this.bdChangingStep) { // Start it if we just increased the step
                        anim.start();
                        this.bdChangingStep = false;
                    } else { // Increase the step if the animation is finished
                        this.bdStep ++;
                        this.bdChangingStep = true;
                    }
                }
            } else {
                // We finished the animation
                this.bdStep = 0;
                this.bdChangingStep = true;
                this.breakdancing = false;
                this.moving = false;
            }
        }
    }

    _updateBreakdance (dt) {
        let anims = [
            this.animations.get(K_BD_ROTATE),
            this.animations.get(K_BD_SPIN),
            this.animations.get(K_BD_ROTATE)
        ];

        for(let i = 0; i < anims.length; i++) {
            let anim = anims[i];
            anim.tick(dt);
            if(!anim.isFinished()) {
                switch (i) {
                    case 0:
                        this.matrix.rotate(anim.getProgressDiff(), 0, 0, 1);
                        break;
                    case 1:
                        this.matrix.translate(0, 0, 2).rotate(anim.getProgressDiff(), 0, 1, 0).translate(0, 0, -2);
                        break;
                    case 2:
                        this.matrix.rotate(anim.getProgressDiff(), 0, 0, 1);
                        break;
                }

                this.requestUpdate();
            }
        }
    }

    _updateJump (dt) {
        // Update time elapsed
        this.jump_time_elapsed += dt * 1000;

        let m = new Matrix4();

        // Cancel current jump
        m.translate(0, - this.jump_last_val, 0);

        // Calculate new y
        let val = this.jump_fct(this.jump_time_elapsed * this.jump_e_fct / this.jump_time - this.jump_s_fct);
        let y = val * this.jump_height / this.jump_m_fct;

        this.jump_last_val = y;

        // Update mat
        m.translate(0, y, 0);

        this.matrix = m.multiply(this.matrix); // do that to prevent rotations from interfering with the jump
        this.requestUpdate();

        this.jumping = this.jump_time_elapsed < this.jump_time;
    }

    _updateStaticParts () {
        this.shapes.get(K_BODY).setMatrix(
            this._getMMatrixCopy()
            .scale(1, 1, 2)
            .translate(0, 0, 1)
        )

        this.shapes.get(K_R_EAR).setMatrix(
            this._getMMatrixCopy()
            .translate(0.5, 1, 0.5)
            .scale(0.3, 0.5, 0.2)
        )

        this.shapes.get(K_L_EAR).setMatrix(
            this._getMMatrixCopy()
            .translate(-0.5, 1, 0.5)
            .scale(0.3, 0.5, 0.2)
        )

        this.shapes.get(K_NOSE).setMatrix(
            this._getMMatrixCopy()
            .translate(0, -0.3, 0)
            .scale(0.25, 0.25, 0.6)
        )

        this.shapes.get(K_R_EYE).setMatrix(
            this._getMMatrixCopy()
            .translate(0.4, 0.25, 0)
            .scale(0.2, 0.2, 0.1)
        )

        this.shapes.get(K_R_EYE_BALL).setMatrix(
            (new Matrix4(this.shapes.get(K_R_EYE).getMatrix()))
            .scale(0.5, 0.5, 1)
            .translate(0, 0, -0.1)
        )

        this.shapes.get(K_L_EYE).setMatrix(
            this._getMMatrixCopy()
            .translate(-0.4, 0.25, 0)
            .scale(0.2, 0.2, 0.1)
        )

        this.shapes.get(K_L_EYE_BALL).setMatrix(
            (new Matrix4(this.shapes.get(K_L_EYE).getMatrix()))
            .scale(0.5, 0.5, 1)
            .translate(0, 0, -0.1)
        )
    }

    _updateTail(dt) {
        let anims = [
            this.animations.get(K_TAIL_ANIM1),
            this.animations.get(K_TAIL_ANIM2)
        ];

        let rotations = [];
        for (let anim of anims) {
            anim.tick(dt);
            rotations.push(anim.isFinished() ? 0 : anim.getProgress());
        }

        this.shapes.get(K_TAIL_1).setMatrix(
            this._getMMatrixCopy()
            .translate(0, 0, 4.5)
            .translate(0, 0, -0.6)
            .rotate(rotations[0], 0, 1, 0)
            .translate(0, 0, 0.6)
            .scale(0.3, 0.3, 0.6) // 0.6 -> length
        )

        this.shapes.get(K_TAIL_2).setMatrix(
            (new Matrix4(this.shapes.get(K_TAIL_1).getMatrix()))
            .scale(10/3, 10/3, 10/6)
            .translate(0, 0, 0.8)
            .rotate(rotations[1], 0, 1, 0)
            .scale(0.3, 0.3, 0.2)
        )
    }

    _updateFeet(dt) {
        let anim = this.animations.get(K_FEET_ANIM);

        anim.tick(dt);
        let alpha = anim.isFinished() ? 0 : anim.getProgress();

        let rotateX = 0;
        let rotateZ = 0;

        if (this.movingDirection === this.E || this.movingDirection === this.W) {
            rotateZ = -1;
        } else if (this.movingDirection === this.NE ||this.movingDirection === this.SE ) {
            rotateX = -1;
            rotateZ = -1;
        } else if (this.movingDirection === this.NW || this.movingDirection === this.SW) {
            rotateX = 1;
            rotateZ = -1;
        } else {
            rotateX = -1;
        }

        this.shapes.get(K_FR_FOOT).setMatrix(
            this._getMMatrixCopy()
            .translate(0.5, -1.2, 0.6)
            .rotate(alpha, rotateX, 0, rotateZ)
            .scale(0.4, 0.4, 0.4)
        );

        this.shapes.get(K_FL_FOOT).setMatrix(
            this._getMMatrixCopy()
            .translate(-0.5, -1.2, 0.6)
            .rotate(-alpha, rotateX, 0, rotateZ)
            .scale(0.4, 0.4, 0.4)
        );

        this.shapes.get(K_BL_FOOT).setMatrix(
            this._getMMatrixCopy()
            .translate(0.5, -1.2, 3.4)
            .rotate(-alpha, rotateX, 0, rotateZ)
            .scale(0.4, 0.4, 0.4)
        );

        this.shapes.get(K_BR_FOOT).setMatrix(
            this._getMMatrixCopy()
            .translate(-0.5, -1.2, 3.4)
            .rotate(alpha, rotateX, 0, rotateZ)
            .scale(0.4, 0.4, 0.4)
        );
    }

    _getMMatrixCopy() {
        return new Matrix4(this.getMatrix());
    }
}