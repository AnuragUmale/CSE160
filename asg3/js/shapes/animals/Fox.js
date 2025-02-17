// Constants used for indexing parts of the fox (e.g., body, feet, tail, etc.).
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

// Constants for animation keys
var K_FEET_ANIM  = "K_FEET_ANIM";
var K_TAIL_ANIM1 = "K_TAIL_ANIM1";
var K_TAIL_ANIM2 = "K_TAIL_ANIM2";
var K_BD_ROTATE  = "K_BD_ROTATE";
var K_BD_SPIN    = "K_BD_SPIN";

/**
 * Represents a "cubic fox" that extends the Animal base class.
 * This fox is built from multiple Cube shapes with relative transforms and animations.
 */
class Fox extends Animal {

    /**
     * @param {WebGL2RenderingContext} gl - WebGL context.
     * @param {Matrix4} matrix - Initial transformation matrix for the fox.
     * @param {number} size - Not currently used directly but could be used to scale the fox.
     */
    constructor(gl, matrix, size) {
        // Call the parent constructor, applying a small translation up (y=1.6) plus the given matrix.
        super(gl, new Matrix4().translate(0, 1.6, 0).multiply(matrix), size);
        this.matrixUpdated = true;

        // Animations (stored in a Map by their keys).
        // Each Animation has a start value, end value, duration, and a looping boolean.
        this.animations = new Map();
        this.animations.set(K_FEET_ANIM,  new Animation(-20, 20,   100, true));
        this.animations.set(K_TAIL_ANIM1, new Animation(-40, 40,   200, true));
        this.animations.set(K_TAIL_ANIM2, new Animation(-20, 20,   300, true));

        // Variables related to breakdance animations.
        this.bdStep = 0;
        this.bdChangingStep = false;
        this.breakdancing = false;
        this.animations.set(K_BD_ROTATE, new Animation(0,  180, 500, false));
        this.animations.set(K_BD_SPIN,   new Animation(0, 1800, 500, false));

        // Animations that will trigger whenever the fox moves.
        this.movingAnimations = [
            this.animations.get(K_FEET_ANIM)
        ];

        // Position and orientation
        // directionX and directionZ represent the fox's forward vector in the XY-plane.
        this.directionX = 0;
        this.directionZ = 1;
        // posX and posZ store the fox's coordinates; derived from its matrix at constructor time.
        this.posX = getPosition(this.matrix)[0];
        this.posZ = getPosition(this.matrix)[2];

        // Rotation about Y axis in degrees (ry).
        // The default orientation is to face negative Z, so ry = -90 is used.
        this.ry = -90;

        // Movement state
        this.moving = false;
        // The direction used for movement logic (0 = East, 1= NE, 2= North, etc. in this code).
        this.movingDirection = this.N;
        // Running multiplier
        this.running = false;
        this.RUN_COEF = 3;

        // Jumping state
        this.jumping = false;
        this.jump_height = 0.5;
        this.jump_time = 500; // in ms
        this.jump_time_elapsed = 0;
        this.jump_last_val = 0;

        // Jump function parameters (a cosine-based jump).
        this.jump_s_fct = - Math.PI;
        this.jump_e_fct = 2*Math.PI;
        this.jump_m_fct = 1;
        this.jump_fct = (x) => {
            return Math.cos(x) + 1; 
        }

        // Direction enumerations relative to the fox
        this.E = 0;
        this.NE = 1;
        this.N  = 2;
        this.NW = 3;
        this.W  = 4;
        this.SW = 5;
        this.S  = 6;
        this.SE = 7;
        // Default direction set to north.
        this.direction = this.N;

        // Create sub-shapes (cubes) that make up the fox, stored in a Map.
        // Each shape has its own transformation matrix and color array.
        this.shapes = new Map();
        this.shapes.set(K_BODY, new Cube(
            gl, new Matrix4(),
            [1,0.5,0,1, 1,0.5,0,1, 1,0.5,0,1, 1,0.5,0,1, 1,0.45,0,1, 1,0.5,0,1],
            null, null
        ));
        this.shapes.set(K_FR_FOOT,    new Cube(gl, new Matrix4(), [1.0, 0.4, 0.0, 1], null, null));
        this.shapes.set(K_FL_FOOT,    new Cube(gl, new Matrix4(), [1.0, 0.4, 0.0, 1], null, null));
        this.shapes.set(K_BR_FOOT,    new Cube(gl, new Matrix4(), [1.0, 0.4, 0.0, 1], null, null));
        this.shapes.set(K_BL_FOOT,    new Cube(gl, new Matrix4(), [1.0, 0.4, 0.0, 1], null, null));
        this.shapes.set(K_TAIL_1,     new Cube(gl, new Matrix4(), [1.0, 0.4, 0.0, 1], null, null));
        this.shapes.set(K_TAIL_2,     new Cube(gl, new Matrix4(), [0.1, 0.1, 0.1, 1], null, null));
        this.shapes.set(K_R_EAR,      new Cube(gl, new Matrix4(), [0.2, 0.2, 0.2, 1], null, null));
        this.shapes.set(K_L_EAR,      new Cube(gl, new Matrix4(), [0.2, 0.2, 0.2, 1], null, null));
        this.shapes.set(K_NOSE,       new Cube(gl, new Matrix4(), [0.2, 0.2, 0.2, 1], null, null));
        this.shapes.set(K_R_EYE,      new Cube(gl, new Matrix4(), [1.0, 1.0, 1.0, 1], null, null));
        this.shapes.set(K_R_EYE_BALL, new Cube(gl, new Matrix4(), [0.1, 0.1, 0.1, 1], null, null));
        this.shapes.set(K_L_EYE,      new Cube(gl, new Matrix4(), [1.0, 1.0, 1.0, 1], null, null));
        this.shapes.set(K_L_EYE_BALL, new Cube(gl, new Matrix4(), [0.1, 0.1, 0.1, 1], null, null));
    }

    /**
     * Called every frame or tick to update animations or states.
     * @param {number} dt - Delta time since last update (in seconds or ms).
     */
    update(dt) {
        // Handle breakdance sequences and other special animations.
        this._updateSpecialAnimations();

        // Handle jumping if in progress.
        if (this.jumping) {
            this._updateJump(dt);
        }

        // Handle breakdance transforms if in progress.
        if (this.breakdancing) {
            this._updateBreakdance(dt);
        }

        // Update sub-shapes if the matrix has changed (or if relevant animations are active).
        if (this.matrixUpdated) {
            this._updateStaticParts();
            this._updateFeet(dt);
            this._updateTail(dt);
        } else {
            // If feet animations are not paused, update them.
            if (!this.animations.get(K_FEET_ANIM).isPaused()) {
                this._updateFeet(dt);
            }
            // If any tail animation is running, update them.
            if (!this.animations.get(K_TAIL_ANIM1).isPaused() || (!this.animations.get(K_TAIL_ANIM2).isPaused())) {
                this._updateTail(dt);
            }
        }

        // Reset the flag until next matrix change.
        this.matrixUpdated = false;
    }

    //// UTILITY ////

    /**
     * Requests an update of the static shape transforms in the next frame.
     */
    requestUpdate() {
        this.matrixUpdated = true;
    }

    /**
     * Overwrites the fox's matrix and marks that it needs an update.
     * @param {Matrix4} matrix - The new transformation matrix.
     */
    setMatrix(matrix) {
        this.matrix = matrix;
        this.matrixUpdated = true;
    }

    /**
     * Returns the fox's yaw rotation (ry) + 90 to align with "forward" orientation.
     */
    getRotation () {
        return this.ry + 90;
    }

    //// ANIMATION HANDLERS METHODS ////

    /**
     * Moves the fox based on keyboard directions (up, down, right, left).
     * If no direction is pressed, calls stopMoving().
     * @param {boolean} up - Whether the "forward" key is pressed.
     * @param {boolean} down - Whether the "backward" key is pressed.
     * @param {boolean} right - Whether the "right" key is pressed.
     * @param {boolean} left - Whether the "left" key is pressed.
     */
    move(up, down, right, left) {
        // If no movement keys are pressed, the fox should stop.
        if (!up && !down && !right && !left) {
            this.stopMoving();
            return;
        }

        // Movement step size, increased if running is active.
        const STEP = 0.1 * (this.running ? this.RUN_COEF : 1);

        // Determine the direction enumerator based on key combos.
        let direction;
        if (up) {
            if (right) {
                direction = this.NE;
                this._move(STEP, 0); // forward
                this._move(STEP, 3); // right
            } else if (left) {
                direction = this.NW;
                this._move(STEP, 0); // forward
                this._move(STEP, 2); // left
            } else {
                direction = this.N;
                this._move(STEP, 0);
            }
        } else if (down) {
            if (right) {
                direction = this.SE;
                this._move(STEP, 1); // backward
                this._move(STEP, 3); // right
            } else if (left) {
                direction = this.SW;
                this._move(STEP, 1); // backward
                this._move(STEP, 2); // left
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

        // Apply movement (translation + rotation) to the fox matrix.
        this.applyMovements();

        // Start the animations (e.g., feet) if they haven't started yet.
        for (let anim of this.movingAnimations) {
            if (anim.isFinished()) {
                anim.start();
            }
        }

        // Mark the fox as moving in a particular direction.
        this.movingDirection = direction;
        this.moving = true;
    }

    /**
     * Rotates the fox around the Y-axis by alpha degrees.
     * @param {number} alpha - The angle in degrees.
     */
    rotate(alpha) {
        // Add alpha to the fox's current yaw (ry).
        this.ry += alpha % 360;
    }

    /**
     * A helper to move the fox by 'step' in one of four directions:
     * 0: forward, 1: backward, 2: left, 3: right.
     * @param {number} step - Distance to move.
     * @param {0|1|2|3} dir - The direction code.
     */
    _move(step, dir) {
        // For forward (0) or left (2), invert the step.
        if (dir === 0 || dir === 2) step *= -1;

        // Forward/backward
        if (dir === 0 || dir === 1) {
            this.posX += step * this.directionX;
            this.posZ += step * this.directionZ;
        } else {
            // Left/right: compute perpendicular direction to (directionX, directionZ).
            let cx = - this.directionZ;
            let cz = this.directionX;

            let length = Math.sqrt(cx**2 + cz**2);
            let normX = cx / length;
            let normZ = cz / length;

            this.posX += normX * step;
            this.posZ += normZ * step;
        }
    }

    /**
     * Updates the fox matrix after changes to position or rotation.
     * Called after `_move` operations.
     */
    applyMovements() {
        let toRad = Math.PI/180;
        // Recompute the directionX/Z from the rotation ry.
        this.directionX = Math.cos(this.ry * toRad);
        this.directionZ = Math.sin(this.ry * toRad);

        // Translate the fox and rotate around the Y-axis.
        // The final part translates temporarily to avoid rotating around the fox's center incorrectly.
        this.setMatrix(
            this.getDefaultMatrix()
                .translate(this.posX, 0, -this.posZ)
                .translate(0, 0, 2)
                .rotate(this.ry + 90, 0, 1, 0)
                .translate(0, 0, -2)
        );
    }

    /**
     * Toggles the first tail animation on/off.
     */
    toggleTailAnimation() {
        let tail_anim = this.animations.get(K_TAIL_ANIM1);
        if (tail_anim.isFinished()) {
            tail_anim.start();
        } else {
            tail_anim.stop();
        }
    }

    /**
     * Stops the fox from moving, halting all movement animations (like feet).
     */
    stopMoving() {
        if (!this.moving) return;

        // Stop animations
        for (let animation of this.movingAnimations) {
            animation.stop();
        }

        // Reset dynamic parts (feet) to default position
        this._updateFeet();

        // Mark that the fox is no longer moving
        this.moving = false;
    }

    /**
     * Checks if the fox is currently moving.
     * @returns {boolean} True if moving, false otherwise.
     */
    isMoving() {
        return this.moving;
    }

    /**
     * Initiates or stops a jump. If 'bool' is true and the fox
     * is not already jumping, start the jump.
     * @param {boolean} bool - Whether the jump is requested.
     */
    jump(bool) {
        if (!this.jumping && bool) {
            this.jump_last_val = 0;
            this.jump_time_elapsed = 0;
            this.jumping = true;
        }
    }

    /**
     * Turns running on or off. Increases the foot animation speed if running.
     * @param {boolean} shouldRun - True to run, false to walk.
     */
    run(shouldRun) {
        let animSpeed = this.animations.get(K_FEET_ANIM).getSpeed();
        // If the fox is currently running and we disable it...
        if (this.running && !shouldRun) {
            this.running = false;
            this.animations.get(K_FEET_ANIM).setSpeed(animSpeed / this.RUN_COEF);
        // If the fox was walking and we enable running...
        } else if (!this.running && shouldRun) {
            this.running = true;
            this.animations.get(K_FEET_ANIM).setSpeed(animSpeed * this.RUN_COEF);
        }
    }

    /**
     * Toggles breakdance mode.
     * @param {boolean} bool - True to start, false to stop.
     */
    breakdance(bool) {
        if (!this.breakdancing && bool) {
            // Initialize breakdance state
            this.bdStep = 0;
            this.breakdancing = true;
            this.bdChangingStep = true;
            this.moving = true;
            // Also starts a jump for style.
            this.jump();
        }
    }

    //// PRIVATE METHODS ////

    /**
     * Handles logic to progress through a special multi-step breakdance animation.
     */
    _updateSpecialAnimations() {
        if (this.breakdancing) {
            let anims = [
                this.animations.get(K_BD_ROTATE),
                this.animations.get(K_BD_SPIN),
                this.animations.get(K_BD_ROTATE)
            ];

            // If we haven't finished all steps in breakdance
            if (this.bdStep < anims.length) {
                let anim = anims[this.bdStep];
                if (anim.isFinished()) {
                    // If we just switched to this step, start the animation
                    if (this.bdChangingStep) {
                        anim.start();
                        this.bdChangingStep = false;
                    } else {
                        // Otherwise, move on to the next step
                        this.bdStep++;
                        this.bdChangingStep = true;
                    }
                }
            } else {
                // All steps are complete
                this.bdStep = 0;
                this.bdChangingStep = true;
                this.breakdancing = false;
                this.moving = false;
            }
        }
    }

    /**
     * Updates the fox's matrix during the breakdance steps (rotation/spin).
     * @param {number} dt - Delta time since last frame.
     */
    _updateBreakdance(dt) {
        let anims = [
            this.animations.get(K_BD_ROTATE),
            this.animations.get(K_BD_SPIN),
            this.animations.get(K_BD_ROTATE)
        ];

        for (let i = 0; i < anims.length; i++) {
            let anim = anims[i];
            anim.tick(dt);
            if(!anim.isFinished()) {
                // Apply transformation based on the animation's progress difference
                switch (i) {
                    case 0:
                        // Rotate around Z-axis
                        this.matrix.rotate(anim.getProgressDiff(), 0, 0, 1);
                        break;
                    case 1:
                        // Rotate around Y-axis, pivoting about a translate(0,0,2) offset
                        this.matrix.translate(0, 0, 2)
                                   .rotate(anim.getProgressDiff(), 0, 1, 0)
                                   .translate(0, 0, -2);
                        break;
                    case 2:
                        // Again rotate around Z-axis
                        this.matrix.rotate(anim.getProgressDiff(), 0, 0, 1);
                        break;
                }
                this.requestUpdate();
            }
        }
    }

    /**
     * Handles jumping by updating the fox's Y position according to a custom function.
     * @param {number} dt - Delta time in seconds or ms.
     */
    _updateJump(dt) {
        // Increase elapsed jump time
        this.jump_time_elapsed += dt * 1000;

        // Start with a transformation that negates the last jump offset
        let m = new Matrix4();
        m.translate(0, -this.jump_last_val, 0);

        // Compute a new position from the jump function
        let val = this.jump_fct(
            this.jump_time_elapsed * this.jump_e_fct / this.jump_time - this.jump_s_fct
        );
        let y = val * this.jump_height / this.jump_m_fct;

        // Store the new offset for future frames
        this.jump_last_val = y;

        // Apply the new offset
        m.translate(0, y, 0);

        // Update the fox's matrix (multiplying to preserve any rotations)
        this.matrix = m.multiply(this.matrix);
        this.requestUpdate();

        // Check if jump time is over
        this.jumping = this.jump_time_elapsed < this.jump_time;
    }

    /**
     * Sets the transformations of static parts (body, ears, nose, eyes) that
     * do not have continuous animation but depend on the overall fox matrix.
     */
    _updateStaticParts() {
        // Body
        this.shapes.get(K_BODY).setMatrix(
            this._getMMatrixCopy()
                .scale(1, 1, 2)
                .translate(0, 0, 1)
        );

        // Right Ear
        this.shapes.get(K_R_EAR).setMatrix(
            this._getMMatrixCopy()
                .translate(0.5, 1, 0.5)
                .scale(0.3, 0.5, 0.2)
        );

        // Left Ear
        this.shapes.get(K_L_EAR).setMatrix(
            this._getMMatrixCopy()
                .translate(-0.5, 1, 0.5)
                .scale(0.3, 0.5, 0.2)
        );

        // Nose
        this.shapes.get(K_NOSE).setMatrix(
            this._getMMatrixCopy()
                .translate(0, -0.3, 0)
                .scale(0.25, 0.25, 0.6)
        );

        // Right Eye
        this.shapes.get(K_R_EYE).setMatrix(
            this._getMMatrixCopy()
                .translate(0.4, 0.25, 0)
                .scale(0.2, 0.2, 0.1)
        );
        // Right Eye Ball (pupil)
        this.shapes.get(K_R_EYE_BALL).setMatrix(
            new Matrix4(this.shapes.get(K_R_EYE).getMatrix())
                .scale(0.5, 0.5, 1)
                .translate(0, 0, -0.1)
        );

        // Left Eye
        this.shapes.get(K_L_EYE).setMatrix(
            this._getMMatrixCopy()
                .translate(-0.4, 0.25, 0)
                .scale(0.2, 0.2, 0.1)
        );
        // Left Eye Ball (pupil)
        this.shapes.get(K_L_EYE_BALL).setMatrix(
            new Matrix4(this.shapes.get(K_L_EYE).getMatrix())
                .scale(0.5, 0.5, 1)
                .translate(0, 0, -0.1)
        );
    }

    /**
     * Updates the tail's transform based on two tail animations for wagging, etc.
     * @param {number} dt - Delta time since last frame.
     */
    _updateTail(dt) {
        let anims = [
            this.animations.get(K_TAIL_ANIM1),
            this.animations.get(K_TAIL_ANIM2)
        ];

        // Compute new rotations from each tail animation.
        let rotations = [];
        for (let anim of anims) {
            anim.tick(dt);
            rotations.push(anim.isFinished() ? 0 : anim.getProgress());
        }

        // Tail segment 1
        this.shapes.get(K_TAIL_1).setMatrix(
            this._getMMatrixCopy()
                .translate(0, 0, 4.5)
                .translate(0, 0, -0.6)
                .rotate(rotations[0], 0, 1, 0)
                .translate(0, 0, 0.6)
                .scale(0.3, 0.3, 0.6) 
        );

        // Tail segment 2
        this.shapes.get(K_TAIL_2).setMatrix(
            new Matrix4(this.shapes.get(K_TAIL_1).getMatrix())
                .scale(10/3, 10/3, 10/6)
                .translate(0, 0, 0.8)
                .rotate(rotations[1], 0, 1, 0)
                .scale(0.3, 0.3, 0.2)
        );
    }

    /**
     * Updates the four feet (front-right, front-left, back-left, back-right) based
     * on a single "feet" animation that oscillates the legs for walking.
     * @param {number} dt - Delta time since last frame.
     */
    _updateFeet(dt) {
        let anim = this.animations.get(K_FEET_ANIM);

        // Update the foot animation progress
        anim.tick(dt);
        let alpha = anim.isFinished() ? 0 : anim.getProgress();

        // Determine rotation axis for the foot movement (depends on moving direction).
        let rotateX = 0;
        let rotateZ = 0;

        // Handling diagonal or horizontal movement directions
        if (this.movingDirection === this.E || this.movingDirection === this.W) {
            rotateZ = -1;
        } else if (this.movingDirection === this.NE || this.movingDirection === this.SE) {
            rotateX = -1;
            rotateZ = -1;
        } else if (this.movingDirection === this.NW || this.movingDirection === this.SW) {
            rotateX = 1;
            rotateZ = -1;
        } else {
            // Normal forward/backward movement uses rotateX only.
            rotateX = -1;
        }

        // Front-right foot
        this.shapes.get(K_FR_FOOT).setMatrix(
            this._getMMatrixCopy()
                .translate(0.5, -1.2, 0.6)
                .rotate(alpha, rotateX, 0, rotateZ)
                .scale(0.4, 0.4, 0.4)
        );

        // Front-left foot
        this.shapes.get(K_FL_FOOT).setMatrix(
            this._getMMatrixCopy()
                .translate(-0.5, -1.2, 0.6)
                .rotate(-alpha, rotateX, 0, rotateZ)
                .scale(0.4, 0.4, 0.4)
        );

        // Back-left foot
        this.shapes.get(K_BL_FOOT).setMatrix(
            this._getMMatrixCopy()
                .translate(0.5, -1.2, 3.4)
                .rotate(-alpha, rotateX, 0, rotateZ)
                .scale(0.4, 0.4, 0.4)
        );

        // Back-right foot
        this.shapes.get(K_BR_FOOT).setMatrix(
            this._getMMatrixCopy()
                .translate(-0.5, -1.2, 3.4)
                .rotate(alpha, rotateX, 0, rotateZ)
                .scale(0.4, 0.4, 0.4)
        );
    }

    /**
     * Returns a copy of the fox's current matrix (used to build transformations).
     * @returns {Matrix4} A new Matrix4 instance duplicating the fox's matrix.
     */
    _getMMatrixCopy() {
        return new Matrix4(this.getMatrix());
    }
}
