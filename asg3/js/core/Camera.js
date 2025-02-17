class Camera {

    /**
     * @param {WebGL2RenderingContext} gl
     * @param {Float} x position of the camera
     * @param {Float} y position of the camera
     * @param {Float} z position of the camera
     * @param {Float} dirX direction of the camera (what it looks)
     * @param {Float} dirY direction of the camera (what it looks)
     * @param {Float} dirZ direction of the camera (what it looks)
     * @param {Float} fov field of view
     * @param {Integer} screenWidth screen's width
     * @param {Integer} screenHeight screen's height
     * @param {Camera.FIRST_PERSON or Camera.THIRD_PERSON} mode
     */
    constructor (gl, x, y, z, dirX, dirY, dirZ, fov, screenWidth, screenHeight, mode) {
        this.gl = gl;
        this.mode = mode;

        if (mode === Camera.THIRD_PERSON) console.warn("Third person camera not working correctly yet");

        
        this.cameraMovingListeners = [];

        

        this.fov = fov;
        this.aspect = screenWidth / screenHeight;
        this.far = 200;
        this.near = 1;

        this.u_ProjectionMatrix = this.gl.getUniformLocation(this.gl.program, 'u_ProjectionMatrix');
        this.updateProjectionMatrix();

        

        this.cameraX = x;
        this.cameraY = y;
        this.cameraZ = z;

        this.pitch = 0;
        this.yaw = 0;
        this.roll = 0;

        this.directionX = dirX;
        this.directionY = dirY;
        this.directionZ = dirZ;

        this.upX = 0;
        this.upY = 1;
        this.upZ = 0;

        this.u_ViewMatrix = this.gl.getUniformLocation(this.gl.program, 'u_ViewMatrix');
        this.u_ViewPosition = this.gl.getUniformLocation(this.gl.program, 'u_ViewPosition');
        this.updateViewMatrix();

        
        this.smoothRotation = 0;
        this.smoothTranslation = 0;

        this.viewMatrix = new Matrix4();
    }

    

    changeFov (fov) {
        this.fov = fov;
        this.updateProjectionMatrix();
    }

    updateProjectionMatrix () {
        let projectionMatrix = new Matrix4();
        
        projectionMatrix.setPerspective(this.fov, this.aspect, this.near, this.far);
        this.gl.uniformMatrix4fv(this.u_ProjectionMatrix, false, projectionMatrix.elements);
    }

    

    /**
     * Moves the camera forward (relative to what's it's currrently looking at)
     * @param {Float} step
     */
    moveForward (step) {
        this.move(step, 0);
    }

    /**
     * Moves the camera backward (relative to what's it's currrently looking at)
     * @param {Float} step
     */
    moveBackward (step) {
        this.move(step, 1);
    }

    /**
     * Moves the camera on the left (relative to what's it's currrently looking at)
     * @param {Float} step
     */
    moveLeft (step) {
        this.move(step, 2);
    }

    /**
     * Moves the camera on the right (relative to what's it's currrently looking at)
     * @param {Float} step
     */
    moveRight (step) {
        this.move(step, 3);
    }

    /**
     * It moves the camera to the specified position, but smoothly.
     * Call resetAnimations() once that you reached the goal.
     * @param {Float} x
     * @param {Float} y
     * @param {Float} z
     * @param {Float} dt time elapsed since last call^
     * @param {Float} time animation duration in seconds (4 by default)
     */
    moveToSmooth (x, y, z, dt, time=4) {
        if (this.smoothTranslation < time) {
            this.smoothTranslation += dt;
            this.cameraX += (x - this.cameraX) * this.smoothTranslation / time;
            this.cameraY += (y - this.cameraY) * this.smoothTranslation / time;
            this.cameraZ += (z - this.cameraZ) * this.smoothTranslation / time;
            this.updateViewMatrix();
        } else {
            this.moveTo(x, y, z);
        }
    }

    /**
     * It moves the camera to the specified position.
     * @param {Float} x
     * @param {Float} y
     * @param {Float} z
     */
    moveTo (x, y, z) {
        this.cameraX = x;
        this.cameraY = y;
        this.cameraZ = z;
        this.updateViewMatrix();
    }

    /**
     * It changes the camera's heading, but smoothly.
     * Call resetAnimations() once that you reached the goal
     * @param {Float} rx degrees (pitch)
     * @param {Float} ry degrees (yaw)
     * @param {Float} rz degrees (roll)
     * @param {Float} dt time elapsed since last call
     * @param {Float} time animation duration in seconds (4 by default)
     */
    headToSmooth (rx, ry, rz, dt, time=4) {
        if (this.smoothRotation < time) {
            this.smoothRotation += dt;
            this.pitch += (rx - this.pitch) * this.smoothRotation / time;
            this.yaw += (ry - this.yaw) * this.smoothRotation / time;
            this.roll += (rz - this.roll) * this.smoothRotation / time;
            this.updateViewMatrix();
        } else {
            this.headTo(rx, ry, rz);
        }
    }

    /**
     * Changes the camera's heading.
     * @param {Float} rx degrees (pitch)
     * @param {Float} ry degrees (yaw)
     * @param {Float} rz degrees (roll)
     */
    headTo (rx, ry, rz) {
        this.pitch = rx;
        this.yaw = ry;
        this.roll = rz;
        this.updateViewMatrix();
    }

    /**
     * It resets the timer of moveToSmooth().
     */
    resetMovingAnimation () {
        this.smoothTranslation = 0;
    }

    /**
     * It resets the timer of headToSmooth().
     */
    resetHeadingAnimation () {
        this.smoothRotation = 0;
    }

    /**
     * Moves the camera.
     * @param {Float} step
     * @param {0, 1, 2, or 3} direction 0: forward, 1: backward, 2: left, 3: right
     */
    move (step, direction) {
        if (direction === 1 || direction === 2) step *= -1;

        if (direction === 0 || direction === 1) {
            this.cameraX += step * this.directionX;
            this.cameraY += step * this.directionY;
            this.cameraZ += step * this.directionZ;
        } else {
            
            let crossX = this.directionY * this.upZ - this.directionZ * this.upY;
            let crossY = this.directionX * this.upZ - this.directionZ * this.upX;
            let crossZ = this.directionX * this.upY - this.directionY * this.upX;

            
            let length = Math.sqrt(crossX**2 + crossY**2 + crossZ**2);

            let normX = crossX / length;
            let normY = crossY / length;
            let normZ = crossZ / length;

            this.cameraX += normX * step;
            this.cameraY += normY * step;
            this.cameraZ += normZ * step;
        }
        this.updateViewMatrix();
    }


    /**
     * It rotates the camera around the X axis.
     * @param {Float} alpha
     */
    rotateX (alpha) {
        this.pitch += alpha;
        if(this.pitch > 89) this.pitch =  89;
        if(this.pitch < -89) this.pitch = -89;
        this.updateViewMatrix();
    }

    /**
     * It rotates the camera around the Y axis.
     * @param {Float} alpha
     */
    rotateY (alpha) {
        this.yaw += alpha;
        this.updateViewMatrix();
    }

    /**
     * It rotates the camera around the Z axis.
     * @param {Float} alpha
     */
    rotateZ (alpha) {
        this.roll += alpha;
        this.updateViewMatrix();
    }

    /**
     * Not availible when using first person.
     * It changes what the camera is focusing.
     * @param {Float} x
     * @param {Float} y
     * @param {Float} z
     */
    target (x, y, z) {
        if (this.mode === Camera.THIRD_PERSON) {
            this.directionX = x;
            this.directionY = y;
            this.directionZ = z;
            this.updateViewMatrix();
        } else {
            console.warn('Do not use target(x, y, z) when using Camera.FIRST_PERSON');
        }
    }

    /**
     * It changes the camera mode to first person.
     * @param {Float} x x pos of the player's eyes
     * @param {Float} y y pos of the player's eyes
     * @param {Float} z z pos of the player's eyes
     * @param {Float} lx x pos of what the player is looking (usually 0 or 1 or -1)
     * @param {Float} ly y pos of what the player is looking (usually 0 or 1 or -1)
     * @param {Float} lz z pos of what the player is looking (usually 0 or 1 or -1)
     */
    setFirstPerson (x, y, z, lx, ly, lz) {
        
        this.cameraX = x;
        this.cameraY = y;
        this.cameraZ = z;

        
        this.pitch = 0;
        this.yaw = 0;
        this.roll = 0;
        this.lastRoll = 0;

        
        this.directionX = lx;
        this.directionY = ly;
        this.directionZ = lz;

        
        this.mode = Camera.FIRST_PERSON;

        this.updateViewMatrix();
    }

    /**
     * It changes the camera mode to third person.
     * @param {Float} x x pos of the camera somewhere around the player
     * @param {Float} y y pos of the camera somewhere around the player
     * @param {Float} z z pos of the camera somewhere around the player
     * @param {Float} px x pos the player
     * @param {Float} py y pos the player
     * @param {Float} pz z pos the player
     */
    setThirdPerson (x, y, z, px, py, pz) {
        console.warn("Third person camera not working correctly yet");

        
        this.cameraX = x;
        this.cameraY = y;
        this.cameraZ = z;

        
        this.pitch = 0;
        this.yaw = 0;
        this.roll = 0;

        
        this.directionX = px;
        this.directionY = py;
        this.directionZ = pz;

        
        this.mode = Camera.THIRD_PERSON;

        this.updateViewMatrix();
    }

    /**
     * It applies the last changes to the camera.
     */
    updateViewMatrix () {
        this.viewMatrix = new Matrix4();
        if (this.mode === Camera.THIRD_PERSON) {
            
            this.viewMatrix.lookAt(this.cameraX, this.cameraY, this.cameraZ, this.directionX, this.directionY, this.directionZ, this.upX, this.upY, this.upZ);
            this.viewMatrix.rotate(this.pitch, 1, 0, 0);
            this.viewMatrix.rotate(this.yaw, 0, 1, 0);
            this.viewMatrix.rotate(this.roll, 0, 0, 1);
        } else {
            let toRad = Math.PI/180;

            
            this.directionX = Math.cos(this.yaw * toRad) * Math.cos(this.pitch * toRad);
            this.directionY = Math.sin(this.pitch * toRad);
            this.directionZ = Math.sin(this.yaw * toRad) * Math.cos(this.pitch * toRad);

            
            if (this.roll !== this.lastRoll) {
                this.upX = this.upX * Math.cos(this.roll * toRad) - this.upY * Math.sin(this.roll * toRad);
                this.upY = this.upX * Math.sin(this.roll * toRad) + this.upY * Math.cos(this.roll * toRad);
                this.lastRoll = this.roll;
            }

            this.viewMatrix.lookAt(
                this.cameraX, this.cameraY, this.cameraZ,
                this.directionX + this.cameraX, this.directionY + this.cameraY, this.directionZ + this.cameraZ,
                this.upX, this.upY, this.upZ);
        }
        this.gl.uniformMatrix4fv(this.u_ViewMatrix, false, this.viewMatrix.elements);
        this.gl.uniform3f(this.u_ViewPosition, this.cameraX, this.cameraY, this.cameraZ);

        
        for (let listener of this.cameraMovingListeners) {
            listener(this);
        }
    }

    /**
     * The given function will be called everytime the camera moves.
     * @param {function with Camera as argument} func
     */
    addOnCamMovingListener (func) {
        this.cameraMovingListeners.push(func);
    }

    fireEvents () {
        for (let listener of this.cameraMovingListeners) {
            listener(this);
        }
    }

    /**
     * Returns all the information about the camera.
     */
    getInfo () {
        return {
            
            fov: this.fov,
            aspect: this.aspect,
            far: this.far,
            near: this.near,

            
            x : this.cameraX,
            y : this.cameraY,
            z : this.cameraZ,
            roll: this.roll,
            pitch: this.pitch,
            yaw: this.yaw,
            directionX : this.directionX,
            directionY : this.directionY,
            directionZ : this.directionZ,
            upX : this.upX,
            upY : this.upY,
            upZ : this.upZ,
            mode : this.mode
        }
    }
}

Camera.FIRST_PERSON = 0;
Camera.THIRD_PERSON = 1;