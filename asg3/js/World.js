class World {

    /**
     * Constructs a World object that manages all shapes, lighting, camera, and input handling.
     * Call `create()` to populate the scene with shapes before starting.
     *
     * @param {WebGL2RenderingContext} gl - The WebGL context.
     * @param {Mouse} mouse - The Mouse object for handling mouse input.
     * @param {Keyboard} keyboard - The Keyboard object for handling keyboard input.
     * @param {TextureManager} textures - For loading and retrieving textures.
     * @param {number} width - The canvas width in pixels.
     * @param {number} height - The canvas height in pixels.
     */
    constructor(gl, mouse, keyboard, textures, width, height) {
        this.gl = gl;
        this.mouse = mouse;
        this.keyboard = keyboard;

        // Arrays for storing shapes that are fully opaque vs. those with transparency.
        this.opaqueShapes = [];
        this.transparentShapes = [];

        // A GameLoop instance to handle updates/rendering once created.
        this.gameLoop = null;

        // Texture management.
        this.textures = textures;

        // Instantiate a Camera object, positioned and oriented, with a field of view of 90 degrees.
        // It defaults to FIRST_PERSON mode. Rotating Y by -90 aligns initial view direction.
        this.camera = new Camera(
            gl,
            -2, 5, 20,   // Camera X, Y, Z
            0, 0, 0,     // Direction vector X, Y, Z
            90.0,        // Field of view
            width,       // Screen width
            height,      // Screen height
            Camera.FIRST_PERSON
        );
        this.camera.rotateY(-90);

        // Sensitivity constants for mouse/keyboard controls.
        this.MOUSE_ROTATION_SENS = 5;
        this.KEYBOARD_ROTATION_SENS = 40;
        this.KEYBOARD_MOVING_SEN = 10;

        // Retrieve shader uniforms for toggling normal rendering and lighting usage.
        this.u_RenderNormals = this.gl.getUniformLocation(this.gl.program, 'u_RenderNormals');
        this.gl.uniform1i(this.u_RenderNormals, 0);

        this.u_UseLighting = this.gl.getUniformLocation(this.gl.program, 'u_UseLighting');
        this.gl.uniform1i(this.u_UseLighting, 1);

        // Set up lighting and related uniforms.
        this.normalMatrix = new Matrix4();
        this.u_NormalMatrix = this.gl.getUniformLocation(this.gl.program, 'u_NormalMatrix');

        // Create the Lighting object, initially placed at (10, 10, 10).
        // It has diffuse color (0.3,0.3,0.3), specular color (1,1,1), shininess 10,
        // and ambient color (0.2,0.2,0.2).
        this.lighting = new Lighting(
            this.gl,
            10, 10, 10,  // Light position
            0.3, 0.3, 0.3, // Diffuse
            1.0, 1.0, 1.0, // Specular
            10,            // Specular exponent
            0.2, 0.2, 0.2  // Ambient
        );

        // Listeners that will be notified whenever focus changes (e.g., fox vs. camera).
        this.onFocusChangedListeners = [];

        // Whether the camera is currently focusing on the fox.
        this.foxFocused = false;
        this.lastFoxFocused = false;

        // Variables controlling various rendering toggles.
        this.renderHouse = false;
        this.renderAxis = false;

        // Day/Night controls.
        this.automateAmbientColor = true;
        this.dayNightCycle = true;
        this.isNight = true;
    }

    /**
     * Creates the world elements (shapes, environment) and starts the main loop.
     * Called once to initialize all scene objects.
     */
    create() {
        // 1) Create the sky and add it to the opaqueShapes as index 0.
        //    The sky is a large cube with a night sky texture by default.
        this.opaqueShapes.push([
            'sky',
            new Sky(
                this.gl,
                new Matrix4().translate(0, 70, 0).scale(80,80,80),
                this.textures.getTexture('SkySmackdown_night'),
                'SkySmackdown_night'
            )
        ]);

        // 2) Create a Fox (index 1), placing it at (-3,0,7), rotated 180° in Y, scaled 0.3.
        this.opaqueShapes.push([
            'fox',
            new Fox(this.gl, new Matrix4().translate(-3, 0, 7).rotate(180, 0, 1, 0).scale(0.3,0.3,0.3))
        ]);

        // 3) Create an Axis for reference (index 2).
        this.opaqueShapes.push([
            'axis',
            new Axis(this.gl, [1,0,0], [0,1,0], [0,0,1])
        ]);

        // 4) Create a Floor object (index 3), sized 80×80, repeated texture (grass).
        this.opaqueShapes.push([
            'floor',
            new Floor(
                this.gl,
                new Matrix4().translate(0,0.9,0).scale(80, 0.1, 80),
                this.textures.getTexture('grass'),
                'grass',
                80
            )
        ]);

        // 5) Add some demo shapes (cubes & spheres) for visuals or testing.
        this.opaqueShapes.push([
            'demo_cube',
            new Cube(this.gl, new Matrix4().translate(-1.5, 15, 0), [0.5, 0.5, 0.5, 1.0], null, null)
        ]);
        this.opaqueShapes.push([
            'demo_sphere',
            new Sphere(this.gl, new Matrix4().translate(1.5, 15, 0), [0.5, 0.5, 0.5, 1.0])
        ]);
        this.opaqueShapes.push([
            'demo_sphere',
            new Sphere(this.gl, new Matrix4().translate(6, 15, 0).scale(2, 2, 2), [0.5, 0.5, 0.5, 1.0])
        ]);

        // Utility function to instantiate a Cube with the given block data.
        let createCube = (shape) => {
            // Position matrix to place the cube at (x+0.501, y+0.501, z+0.501).
            let pos = new Matrix4().translate(shape.x+0.501, shape.y+0.501, shape.z+0.501);

            // If it's a door block, adjust z-scaling to be thin and shift it.
            if (shape.block.startsWith('door')) {
                pos.translate(0, 0, 0.399).scale(0.499, 0.499, 0.1);
            } else {
                pos.scale(0.499, 0.499, 0.499);
            }

            // Retrieve texture from the TextureManager.
            let texture = this.textures.getTexture(shape.block);

            // Leaves get a specific color array with alpha=0 for transparency; otherwise normal texture usage.
            if (shape.block.startsWith('leaves')) {
                return new Cube(this.gl, pos, [0, 0.3, 0, 0], texture, shape.block);
            } else {
                return new Cube(this.gl, pos, null, texture, shape.block);
            }
        };

        // 6) Load opaque blocks from WORLD1.opaque.
        for (let shape of WORLD1.opaque) {
            this.opaqueShapes.push(['house', createCube(shape)]);
        }

        // 7) Load transparent blocks (like leaves, glass) from WORLD1.transparent.
        for (let shape of WORLD1.transparent) {
            this.transparentShapes.push(['house', createCube(shape)]);
        }

        // Sort the transparent shapes by distance from the camera so they render back-to-front.
        this.sortTransparentShapes();

        // Every time the camera moves, re-sort the transparent shapes.
        this.camera.addOnCamMovingListener(() => {
            this.sortTransparentShapes();
        });

        // Toggle the fox's tail animation by default.
        this.getFox().toggleTailAnimation();

        // Initialize the main game loop, specifying update & render functions.
        this.gameLoop = new GameLoop(
            dt => this._update(dt),
            dt => this._render(dt)
        );
        // Start the game loop.
        this.gameLoop.start();

        // Trigger camera event listeners immediately for initialization.
        this.camera.fireEvents();

        // Create an animation for moving the light over time, reversing direction (loop = true).
        this.movingLightAnimation = new Animation(0, 180, 20, true);
        this.movingLightAnimation.start();
    }

    /**
     * Internal update method, called each frame by the GameLoop.
     * @param {number} dt - The time step since the previous update (in seconds or ms).
     */
    _update(dt) {
        // 1) Day/night cycle if enabled.
        if (this.dayNightCycle) {
            this.movingLightAnimation.tick(dt);
            let alpha = this.movingLightAnimation.getProgress();

            // If it hits 180 degrees, switch from day <-> night.
            if (alpha === 180) {
                this.changeTime(this.isNight);
            }

            // Move the light in a circle (radius 80).
            let r = 80.0;
            let x = Math.cos(Math.PI / 180 * alpha) * r;
            let y = Math.sin(Math.PI / 180 * alpha) * r;

            this.lighting.setPos(x, y-1, 0);
            this.lighting.updateLightCube();

            // Automatically update ambient color if `automateAmbientColor` is true.
            if (this.automateAmbientColor) {
                // For night, max ~0.1, for day, max ~0.9, matching the sine wave.
                let max = this.isNight ? 0.1 : 0.9;
                let sinVal = Math.sin(Math.PI / 180 * alpha) * max;
                this.lighting.setAmbientColor(
                    Math.max(sinVal, 0.1),
                    sinVal + 0.1,
                    sinVal + 0.1
                );
            }
        }

        // 2) Mouse/keyboard rotation handling.
        if (
            this.mouse.isDown() ||
            this.keyboard.isDown(Keyboard.K_Q) ||
            this.keyboard.isDown(Keyboard.K_E)
        ) {
            let pitch = 0;   // Up/down rotation
            let yaw = 0;     // Left/right rotation
            // let roll = 0; // Unused example for Z rotation if needed

            // If the mouse is down, compute rotation from mouse movement deltas.
            if (this.mouse.isDown()) {
                yaw = this.mouse.getDeltaPos()[0];
                pitch = - this.mouse.getDeltaPos()[1];

                yaw *= this.MOUSE_ROTATION_SENS;
                pitch *= this.MOUSE_ROTATION_SENS;
            } else if (this.keyboard.isDown(Keyboard.K_Q)) {
                // Yaw left
                yaw = - this.KEYBOARD_ROTATION_SENS;
            } else {
                // Yaw right
                yaw = this.KEYBOARD_ROTATION_SENS;
            }

            // Scale by dt for smooth rotation over time.
            yaw *= dt;
            pitch *= dt;

            // If the fox is focused, rotate the fox. Otherwise, rotate the camera.
            if (this.foxFocused) {
                this.getFox().rotate(yaw);
                this.getFox().applyMovements();
            } else {
                // Constrain pitch to prevent flipping beyond ±90° if desired.
                this.camera.rotateX(Math.max(Math.min(pitch, 90), -90));
                this.camera.rotateY(yaw);
            }
        }

        // Record the mouse's last position for delta computation next frame.
        this.mouse.recordLastPos(this.mouse.getMovingPos());

        // 3) Keyboard movement for the fox and camera.

        // Fox movement.
        this.getFox().move(
            this.keyboard.isDown(Keyboard.K_UP),
            this.keyboard.isDown(Keyboard.K_DOWN),
            this.keyboard.isDown(Keyboard.K_RIGHT),
            this.keyboard.isDown(Keyboard.K_LEFT)
        );
        // Running, jumping, breakdancing triggers.
        this.getFox().run(this.keyboard.isDown(Keyboard.K_SHIFT));
        this.getFox().jump(this.keyboard.isDown(Keyboard.K_SPACE));
        this.getFox().breakdance(this.keyboard.isDown(Keyboard.K_CTRL));

        // Camera movement (WASD).
        if (this.keyboard.isDown(Keyboard.K_W)) {
            this.foxFocused = false;
            this.camera.moveForward(this.KEYBOARD_MOVING_SEN * dt);
        }
        if (this.keyboard.isDown(Keyboard.K_S)) {
            this.foxFocused = false;
            this.camera.moveBackward(this.KEYBOARD_MOVING_SEN * dt);
        }
        if (this.keyboard.isDown(Keyboard.K_D)) {
            this.foxFocused = false;
            this.camera.moveRight(this.KEYBOARD_MOVING_SEN * dt);
        }
        if (this.keyboard.isDown(Keyboard.K_A)) {
            this.foxFocused = false;
            this.camera.moveLeft(this.KEYBOARD_MOVING_SEN * dt);
        }

        // If the fox is moving or jumping, the camera tries to follow the fox.
        if (this.getFox().isMoving() || this.getFox().jumping) {
            this.followFox(dt);
            this.foxFocused = true;
        } else {
            // Reset camera's smooth animations if fox is stationary.
            this.camera.resetMovingAnimation();
            this.camera.resetHeadingAnimation();
        }

        // 4) Update shapes in the scene.
        for (let shapeInfo of this.opaqueShapes) {
            // Skip house shapes if we don't want to render the house, skip axis if disabled.
            if (shapeInfo[0] === 'house' && !this.renderHouse) continue;
            if (shapeInfo[0] === 'axis' && !this.renderAxis) continue;

            let shape = shapeInfo[1];
            shape.update(dt);
        }

        for (let shapeInfo of this.transparentShapes) {
            if (shapeInfo[0] === 'house' && !this.renderHouse) continue;
            let shape = shapeInfo[1];
            shape.update(dt);
        }

        // 5) Check if focus state changed; fire events if so.
        if (this.lastFoxFocused !== this.foxFocused) {
            for(let listener of this.onFocusChangedListeners) {
                listener(this.foxFocused);
            }
        }
        this.lastFoxFocused = this.foxFocused;
    }

    /**
     * Moves the camera to follow the fox smoothly, used if fox is in motion.
     * @param {number} dt - The time step for smooth transitions.
     */
    followFox(dt) {
        let lengthXZfromFox = 3; // Horizontal distance behind fox
        let heightFromFox = 1;   // Camera height above fox

        // The alpha is negative of (fox rotation + 90°),
        // so we position the camera behind the fox.
        let alpha = -(this.getFox().getRotation() + 90);

        let x = Math.cos(alpha * Math.PI / 180) * lengthXZfromFox;
        let z = Math.sin(alpha * Math.PI / 180) * lengthXZfromFox;

        // Grab the fox's position and apply offsets to place the camera behind & slightly above.
        let pos = getPosition(this.getFox().matrix);
        this.camera.moveToSmooth(x + pos[0], pos[1] + heightFromFox, z + pos[2], dt);

        // Rotate the camera to face the fox, also smoothly.
        this.camera.headToSmooth(0, -this.getFox().getRotation() + 90, 0, dt);
    }

    /**
     * Internal rendering method, called each frame by the GameLoop.
     * @param {number} dt - Delta time since the previous frame.
     */
    _render(dt) {
        // 1) Clear the screen (color+depth buffers).
        this.clear();

        // 2) Draw the small light cube representing the light's position.
        this.lighting.renderLightCube();

        // 3) Render opaque shapes first.
        for (let shapeInfo of this.opaqueShapes) {
            if (shapeInfo[0] === 'house' && !this.renderHouse) continue;
            if (shapeInfo[0] === 'axis' && !this.renderAxis) continue;

            let shape = shapeInfo[1];

            // Build the shape buffers (only re-binds if needed).
            shape.build();

            // Compute and set normalMatrix for lighting (inverse transpose of modelMatrix).
            this.normalMatrix = this.normalMatrix.setInverseOf(shape.matrix);
            this.normalMatrix.transpose();
            this.gl.uniformMatrix4fv(this.u_NormalMatrix, false, this.normalMatrix.elements);

            // Draw the shape.
            shape.draw();
        }

        // 4) Then render transparent shapes in sorted order.
        for (let shapeInfo of this.transparentShapes) {
            if (shapeInfo[0] === 'house' && !this.renderHouse) continue;

            let shape = shapeInfo[1];

            shape.build();

            this.normalMatrix = this.normalMatrix.setInverseOf(shape.matrix);
            this.normalMatrix.transpose();
            this.gl.uniformMatrix4fv(this.u_NormalMatrix, false, this.normalMatrix.elements);

            shape.draw();
        }
    }

    // ----- Utility / Event-based Methods -----

    /**
     * Registers a callback to be invoked whenever focus changes between fox and camera.
     * @param {function(boolean):void} func - A function that receives a boolean: true if fox is focused.
     */
    onFocusChangedListener(func) {
        this.onFocusChangedListeners.push(func);
    }

    /**
     * Updates the light position to match the camera's position, for debugging or toggling.
     */
    updateLightPosition() {
        let pos = this.camera.getInfo();
        this.lighting.setPos(pos.x, pos.y, pos.z);
        this.lighting.updateLightCube();
    }

    /**
     * Updates the diffuse color of the light (RGB).
     * @param {number} r - Red component
     * @param {number} g - Green component
     * @param {number} b - Blue component
     */
    updateDiffuseColor(r, g, b) {
        this.lighting.setDiffuseColor(r, g, b);
        this.lighting.updateLightCube();
    }

    /**
     * Updates the specular color (RGB) and shininess (n) of the light.
     * @param {number} r
     * @param {number} g
     * @param {number} b
     * @param {number} n - Specular exponent
     */
    updateSpecularColor(r, g, b, n) {
        this.lighting.setSpecularColor(r, g, b, n);
        this.lighting.updateLightCube();
    }

    /**
     * Updates the ambient color of the lighting (RGB).
     * @param {number} r
     * @param {number} g
     * @param {number} b
     */
    updateAmbientColor(r, g, b) {
        this.lighting.setAmbientColor(r, g, b);
    }

    /**
     * Enables or disables the day/night cycle. If disabled, pauses the moving light animation.
     * @param {boolean} bool - True to enable, false to disable.
     */
    setDayNightCycle(bool) {
        this.dayNightCycle = bool;
        if (bool) {
            this.movingLightAnimation.resume();
        } else {
            this.movingLightAnimation.pause();
        }
    }

    /**
     * Enables or disables automatically computing the ambient color while the light moves.
     * If disabled, resets ambient color to default (0.2, 0.2, 0.2).
     *
     * @param {boolean} bool
     */
    setAutomateAmbientColor(bool) {
        this.automateAmbientColor = bool;
        if (!bool) {
            this.lighting.setAmbientColor(0.2, 0.2, 0.2);
        }
    }

    /**
     * Sorts the transparent shapes in descending order by distance from the camera
     * (farthest first), ensuring correct blending.
     */
    sortTransparentShapes() {
        this.transparentShapes.sort((a, b) => {
            // Access the shape from each array entry: ['house', shapeObject]
            a = a[1];
            b = b[1];

            // Grab the camera position and each shape's position.
            let cam = this.camera.getInfo();
            let posa = getPosition(a.matrix);
            let posb = getPosition(b.matrix);

            let dista = Math.sqrt(
                (cam.x - posa[0])**2 + 
                (cam.y - posa[1])**2 + 
                (cam.z - posa[2])**2
            );
            let distb = Math.sqrt(
                (cam.x - posb[0])**2 + 
                (cam.y - posb[1])**2 + 
                (cam.z - posb[2])**2
            );

            // Sort from farthest to nearest so we draw far objects first.
            return distb - dista;
        });
    }

    /**
     * Enables or disables lighting in the shader (u_UseLighting).
     * @param {boolean} bool - True to enable, false to disable.
     */
    setLighting(bool) {
        this.gl.uniform1i(this.u_UseLighting, bool ? 1 : 0);
    }

    /**
     * Enables or disables rendering of normals in the fragment shader (u_RenderNormals).
     * @param {boolean} bool - True to show normals, false for normal shading.
     */
    setRenderNormals(bool) {
        this.gl.uniform1i(this.u_RenderNormals, bool ? 1 : 0);
    }

    /**
     * Returns the Camera object controlling the view.
     * @returns {Camera}
     */
    getCamera() {
        return this.camera;
    }

    /**
     * Returns the Fox object from the shape list (assuming index 1).
     * @returns {Fox}
     */
    getFox() {
        return this.opaqueShapes[1][1];
    }

    /**
     * Toggles between day and night. If 'day' is true, we switch to day,
     * else we switch to night. The sky texture and ambient color are updated accordingly.
     *
     * @param {boolean} day - True for day, false for night.
     */
    changeTime(day) {
        this.isNight = !day;
        let textureName;
        if (this.isNight) {
            textureName = 'SkySmackdown_night';
            this.updateAmbientColor(0.2, 0.2, 0.2);
        } else {
            textureName = 'SkySmackdown';
            this.updateAmbientColor(0.9, 0.9, 0.9);
        }

        // Update the sky's texture (shape with index [0]).
        this.opaqueShapes[0][1].changeTexture(this.textures.getTexture(textureName));
    }

    /**
     * Clears the screen (color+depth buffers).
     */
    clear() {
        this.gl.clearColor(0.0, 0.4, 1.0, 1.0);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
    }
}
