class Camera {

    /**
     * Constructs a Camera instance with various parameters.
     * @param {WebGL2RenderingContext} gl - The WebGL context.
     * @param {Float} x - Camera's initial X position.
     * @param {Float} y - Camera's initial Y position.
     * @param {Float} z - Camera's initial Z position.
     * @param {Float} dirX - X component of the camera's viewing direction.
     * @param {Float} dirY - Y component of the camera's viewing direction.
     * @param {Float} dirZ - Z component of the camera's viewing direction.
     * @param {Float} fov - Field of view (vertical).
     * @param {Integer} screenWidth - Screen width in pixels.
     * @param {Integer} screenHeight - Screen height in pixels.
     * @param {Camera.FIRST_PERSON | Camera.THIRD_PERSON} mode - Camera mode.
     */
    constructor (gl, x, y, z, dirX, dirY, dirZ, fov, screenWidth, screenHeight, mode) {
        // Store the WebGL context
        this.gl = gl;
        // Store the camera mode (FIRST_PERSON or THIRD_PERSON)
        this.mode = mode;

        // Warn if the third-person camera is used (not fully functional)
        if (mode === Camera.THIRD_PERSON) console.warn("Third person camera not working correctly yet");

        // Array of listeners called whenever the camera moves
        this.cameraMovingListeners = [];

        // Camera perspective parameters
        this.fov = fov;
        this.aspect = screenWidth / screenHeight; // Aspect ratio
        this.far = 200; // Far clipping plane distance
        this.near = 1;  // Near clipping plane distance

        // Get the location of the uniform variable for the projection matrix in the shader
        this.u_ProjectionMatrix = this.gl.getUniformLocation(this.gl.program, 'u_ProjectionMatrix');
        // Initialize the projection matrix using the provided parameters
        this.updateProjectionMatrix();

        // Initial camera position
        this.cameraX = x;
        this.cameraY = y;
        this.cameraZ = z;

        // Angles for pitch (X-axis), yaw (Y-axis), roll (Z-axis)
        this.pitch = 0;
        this.yaw = 0;
        this.roll = 0;

        // Initial viewing direction
        this.directionX = dirX;
        this.directionY = dirY;
        this.directionZ = dirZ;

        // Up vector (usually pointing along Y)
        this.upX = 0;
        this.upY = 1;
        this.upZ = 0;

        // Get uniform locations for the view matrix and camera position (used in shaders)
        this.u_ViewMatrix = this.gl.getUniformLocation(this.gl.program, 'u_ViewMatrix');
        this.u_ViewPosition = this.gl.getUniformLocation(this.gl.program, 'u_ViewPosition');
        // Initialize the view matrix
        this.updateViewMatrix();

        // Variables to help with smooth animation transitions
        this.smoothRotation = 0;
        this.smoothTranslation = 0;

        // The current view matrix (Matrix4 is a utility class)
        this.viewMatrix = new Matrix4();
    }

    /**
     * Changes the camera's field of view and updates the projection.
     * @param {Float} fov - New field of view.
     */
    changeFov (fov) {
        this.fov = fov;
        this.updateProjectionMatrix();
    }

    /**
     * Updates the projection matrix using the current fov, aspect, near, and far.
     */
    updateProjectionMatrix () {
        // Create a new projection matrix
        let projectionMatrix = new Matrix4();
        // Set perspective projection
        projectionMatrix.setPerspective(this.fov, this.aspect, this.near, this.far);
        // Pass it to the shader
        this.gl.uniformMatrix4fv(this.u_ProjectionMatrix, false, projectionMatrix.elements);
    }

    /**
     * Moves the camera forward based on its current direction.
     * @param {Float} step - Movement amount.
     */
    moveForward (step) {
        this.move(step, 0);
    }

    /**
     * Moves the camera backward based on its current direction.
     * @param {Float} step - Movement amount.
     */
    moveBackward (step) {
        this.move(step, 1);
    }

    /**
     * Moves the camera left relative to its current direction.
     * @param {Float} step - Movement amount.
     */
    moveLeft (step) {
        this.move(step, 2);
    }

    /**
     * Moves the camera right relative to its current direction.
     * @param {Float} step - Movement amount.
     */
    moveRight (step) {
        this.move(step, 3);
    }

    /**
     * Moves the camera smoothly over time to a new position (x, y, z).
     * @param {Float} x - Target X position.
     * @param {Float} y - Target Y position.
     * @param {Float} z - Target Z position.
     * @param {Float} dt - Delta time since last frame.
     * @param {Float} time - Duration of the movement in seconds (default is 4).
     */
    moveToSmooth (x, y, z, dt, time=4) {
        // If the animation is not finished
        if (this.smoothTranslation < time) {
            this.smoothTranslation += dt;
            // Incrementally move cameraX/Y/Z toward target
            this.cameraX += (x - this.cameraX) * this.smoothTranslation / time;
            this.cameraY += (y - this.cameraY) * this.smoothTranslation / time;
            this.cameraZ += (z - this.cameraZ) * this.smoothTranslation / time;
            // Update the view matrix so the camera actually moves
            this.updateViewMatrix();
        } else {
            // If we've exceeded the animation time, move to final position directly
            this.moveTo(x, y, z);
        }
    }

    /**
     * Instantly moves the camera to the specified position.
     * @param {Float} x - Target X position.
     * @param {Float} y - Target Y position.
     * @param {Float} z - Target Z position.
     */
    moveTo (x, y, z) {
        this.cameraX = x;
        this.cameraY = y;
        this.cameraZ = z;
        this.updateViewMatrix();
    }

    /**
     * Changes the camera orientation smoothly over time to the given angles.
     * @param {Float} rx - Target pitch (in degrees).
     * @param {Float} ry - Target yaw (in degrees).
     * @param {Float} rz - Target roll (in degrees).
     * @param {Float} dt - Delta time since last frame.
     * @param {Float} time - Duration of rotation in seconds (default is 4).
     */
    headToSmooth (rx, ry, rz, dt, time=4) {
        // If the rotation animation is not finished
        if (this.smoothRotation < time) {
            this.smoothRotation += dt;
            // Smoothly change pitch, yaw, and roll
            this.pitch += (rx - this.pitch) * this.smoothRotation / time;
            this.yaw += (ry - this.yaw) * this.smoothRotation / time;
            this.roll += (rz - this.roll) * this.smoothRotation / time;
            // Update view matrix after applying angles
            this.updateViewMatrix();
        } else {
            // If done, set the angles directly
            this.headTo(rx, ry, rz);
        }
    }

    /**
     * Sets the camera's orientation (pitch, yaw, roll) immediately.
     * @param {Float} rx - Pitch in degrees.
     * @param {Float} ry - Yaw in degrees.
     * @param {Float} rz - Roll in degrees.
     */
    headTo (rx, ry, rz) {
        this.pitch = rx;
        this.yaw = ry;
        this.roll = rz;
        this.updateViewMatrix();
    }

    /**
     * Resets the translation smooth animation timer.
     */
    resetMovingAnimation () {
        this.smoothTranslation = 0;
    }

    /**
     * Resets the rotation smooth animation timer.
     */
    resetHeadingAnimation () {
        this.smoothRotation = 0;
    }

    /**
     * Helper method to move the camera in a specific direction.
     * @param {Float} step - Movement distance.
     * @param {0 | 1 | 2 | 3} direction - 0: forward, 1: backward, 2: left, 3: right.
     */
    move (step, direction) {
        // If direction is backward (1) or left (2), invert the step
        if (direction === 1 || direction === 2) step *= -1;

        // Forward/backward movement
        if (direction === 0 || direction === 1) {
            this.cameraX += step * this.directionX;
            this.cameraY += step * this.directionY;
            this.cameraZ += step * this.directionZ;
        } else {
            // Left/right movement: compute a cross product between direction and up vector to get a perpendicular
            let crossX = this.directionY * this.upZ - this.directionZ * this.upY;
            let crossY = this.directionX * this.upZ - this.directionZ * this.upX;
            let crossZ = this.directionX * this.upY - this.directionY * this.upX;

            // Normalize the cross product
            let length = Math.sqrt(crossX**2 + crossY**2 + crossZ**2);
            let normX = crossX / length;
            let normY = crossY / length;
            let normZ = crossZ / length;

            // Move in that perpendicular direction
            this.cameraX += normX * step;
            this.cameraY += normY * step;
            this.cameraZ += normZ * step;
        }
        // Update camera's view matrix after the movement
        this.updateViewMatrix();
    }

    /**
     * Rotates the camera around its X axis (pitch).
     * @param {Float} alpha - Angle in degrees.
     */
    rotateX (alpha) {
        this.pitch += alpha;
        // Constrain pitch between -89 and +89 degrees to avoid gimbal lock
        if(this.pitch > 89) this.pitch = 89;
        if(this.pitch < -89) this.pitch = -89;
        this.updateViewMatrix();
    }

    /**
     * Rotates the camera around its Y axis (yaw).
     * @param {Float} alpha - Angle in degrees.
     */
    rotateY (alpha) {
        this.yaw += alpha;
        this.updateViewMatrix();
    }

    /**
     * Rotates the camera around its Z axis (roll).
     * @param {Float} alpha - Angle in degrees.
     */
    rotateZ (alpha) {
        this.roll += alpha;
        this.updateViewMatrix();
    }

    /**
     * Sets the camera focus point if in third-person mode.
     * @param {Float} x - X coordinate of the focus point.
     * @param {Float} y - Y coordinate of the focus point.
     * @param {Float} z - Z coordinate of the focus point.
     */
    target (x, y, z) {
        // Only applies if camera is in THIRD_PERSON mode
        if (this.mode === Camera.THIRD_PERSON) {
            this.directionX = x;
            this.directionY = y;
            this.directionZ = z;
            this.updateViewMatrix();
        } else {
            // If in FIRST_PERSON, warn the developer
            console.warn('Do not use target(x, y, z) when using Camera.FIRST_PERSON');
        }
    }

    /**
     * Switches camera mode to FIRST_PERSON, setting initial position and direction.
     * @param {Float} x - Camera X position (player's eye X).
     * @param {Float} y - Camera Y position (player's eye Y).
     * @param {Float} z - Camera Z position (player's eye Z).
     * @param {Float} lx - X direction of where player looks.
     * @param {Float} ly - Y direction of where player looks.
     * @param {Float} lz - Z direction of where player looks.
     */
    setFirstPerson (x, y, z, lx, ly, lz) {
        // Set new camera position
        this.cameraX = x;
        this.cameraY = y;
        this.cameraZ = z;

        // Reset rotation angles
        this.pitch = 0;
        this.yaw = 0;
        this.roll = 0;
        this.lastRoll = 0;

        // Set the direction vector
        this.directionX = lx;
        this.directionY = ly;
        this.directionZ = lz;

        // Switch mode to FIRST_PERSON
        this.mode = Camera.FIRST_PERSON;

        // Update the view matrix to reflect changes
        this.updateViewMatrix();
    }

    /**
     * Switches camera mode to THIRD_PERSON, setting the camera position
     * and focusing on a player's position (px, py, pz).
     * @param {Float} x - Camera X position.
     * @param {Float} y - Camera Y position.
     * @param {Float} z - Camera Z position.
     * @param {Float} px - Target X position (e.g., player).
     * @param {Float} py - Target Y position (e.g., player).
     * @param {Float} pz - Target Z position (e.g., player).
     */
    setThirdPerson (x, y, z, px, py, pz) {
        // Inform the user that third-person mode is not fully implemented
        console.warn("Third person camera not working correctly yet");

        // Position the camera
        this.cameraX = x;
        this.cameraY = y;
        this.cameraZ = z;

        // Reset angles
        this.pitch = 0;
        this.yaw = 0;
        this.roll = 0;

        // Set direction to look at the given position
        this.directionX = px;
        this.directionY = py;
        this.directionZ = pz;

        // Switch mode to THIRD_PERSON
        this.mode = Camera.THIRD_PERSON;

        // Update the view matrix
        this.updateViewMatrix();
    }

    /**
     * Computes and sends the updated view matrix (and camera position) to the GPU.
     */
    updateViewMatrix () {
        // Start with a fresh Matrix4
        this.viewMatrix = new Matrix4();

        // If camera is in third-person, use lookAt with the stored direction as the "target"
        if (this.mode === Camera.THIRD_PERSON) {
            this.viewMatrix.lookAt(
                this.cameraX, this.cameraY, this.cameraZ,
                this.directionX, this.directionY, this.directionZ,
                this.upX, this.upY, this.upZ
            );
            // Apply any pitch, yaw, roll
            this.viewMatrix.rotate(this.pitch, 1, 0, 0);
            this.viewMatrix.rotate(this.yaw, 0, 1, 0);
            this.viewMatrix.rotate(this.roll, 0, 0, 1);
        } else {
            // Convert angles to radians
            let toRad = Math.PI/180;

            // Calculate the new direction vector from pitch and yaw
            this.directionX = Math.cos(this.yaw * toRad) * Math.cos(this.pitch * toRad);
            this.directionY = Math.sin(this.pitch * toRad);
            this.directionZ = Math.sin(this.yaw * toRad) * Math.cos(this.pitch * toRad);

            // If the roll angle changed, adjust the up vector
            if (this.roll !== this.lastRoll) {
                this.upX = this.upX * Math.cos(this.roll * toRad) - this.upY * Math.sin(this.roll * toRad);
                this.upY = this.upX * Math.sin(this.roll * toRad) + this.upY * Math.cos(this.roll * toRad);
                this.lastRoll = this.roll;
            }

            // Use lookAt with the direction relative to the camera's current position
            this.viewMatrix.lookAt(
                this.cameraX, this.cameraY, this.cameraZ,
                this.directionX + this.cameraX, this.directionY + this.cameraY, this.directionZ + this.cameraZ,
                this.upX, this.upY, this.upZ
            );
        }

        // Pass the view matrix to the GPU
        this.gl.uniformMatrix4fv(this.u_ViewMatrix, false, this.viewMatrix.elements);
        // Pass the camera's position to the GPU (useful for lighting calculations)
        this.gl.uniform3f(this.u_ViewPosition, this.cameraX, this.cameraY, this.cameraZ);

        // Trigger each registered listener (camera has moved)
        for (let listener of this.cameraMovingListeners) {
            listener(this);
        }
    }

    /**
     * Adds a function to be called whenever the camera updates its position or orientation.
     * @param {function(Camera)} func - A callback that receives the Camera instance.
     */
    addOnCamMovingListener (func) {
        this.cameraMovingListeners.push(func);
    }

    /**
     * Fires all on-camera-moving events.
     */
    fireEvents () {
        for (let listener of this.cameraMovingListeners) {
            listener(this);
        }
    }

    /**
     * Returns an object with all current camera information.
     */
    getInfo () {
        return {
            // Projection info
            fov: this.fov,
            aspect: this.aspect,
            far: this.far,
            near: this.near,

            // Position and orientation info
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

// Static constants indicating camera modes
Camera.FIRST_PERSON = 0;
Camera.THIRD_PERSON = 1;
