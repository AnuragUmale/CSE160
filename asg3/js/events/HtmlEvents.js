// Global variables that might be toggled by the HTML UI
var C_AXIS = true;
var C_FOLLOW_FOX = true;

class HtmlEvents {

    /**
     * Handles HTML-based events and ties them to the `world` object.
     * After creating an instance, call `registerEvents()` to bind event listeners.
     *
     * @param {World} world - A reference to the game/scene world (not started yet).
     */
    constructor (world) {
        // Store a reference to the world object.
        this.world = world;
    }

    /**
     * Registers all HTML events with their respective DOM elements.
     * This method connects UI controls (checkboxes, sliders, buttons)
     * to corresponding methods and state changes in the World object.
     */
    registerEvents () {
        // 1) Update camera info display when the camera moves.
        this.world.getCamera().addOnCamMovingListener(cam => {
            let c = cam.getInfo();
            // Show camera position and angles in the overlay (id="camera").
            getElement('camera').innerHTML = (
                'x: ' + c.x.toFixed(2) + '<br>' +
                'y: ' + c.y.toFixed(2) + '<br>' +
                'z: ' + c.z.toFixed(2) + '<br>' +
                'pitch: ' + c.pitch.toFixed(2) + '<br>' +
                'yaw: ' + c.yaw.toFixed(2) + '<br>' +
                'roll: ' + c.roll.toFixed(2)
            );
        });

        // 2) Update UI to show whether the Fox or the Camera is currently selected.
        this.world.onFocusChangedListener(fox => {
            if (fox) {
                // Fox is selected, so update HTML elements accordingly.
                getElement('fox').style.color = 'green';
                getElement('fox').innerHTML = 'selected';
                getElement('cam').style.color = 'red';
                getElement('cam').innerHTML = 'unselected';
            } else {
                // Camera is selected instead.
                getElement('cam').style.color = 'green';
                getElement('cam').innerHTML = 'selected';
                getElement('fox').style.color = 'red';
                getElement('fox').innerHTML = 'unselected';
            }
        });

        // 3) Button to update light position.
        getElement('light-pos').onclick = e => {
            this.world.updateLightPosition();
        };

        // 4) Checkbox to render the house or not.
        getElement('renderHouse').onclick = e => {
            this.world.renderHouse = e.target.checked;
        };

        // 5) Checkbox to display the axis or not.
        getElement('renderAxis').onclick = e => {
            this.world.renderAxis = e.target.checked;
        };

        // 6) Checkbox to toggle rendering of normals.
        getElement('renderNormals').onclick = e => {
            this.world.setRenderNormals(e.target.checked);
        };

        // 7) Checkbox to automate ambient color changes (day/night).
        getElement('automateAmbientColor').onclick = e => {
            this.world.setAutomateAmbientColor(e.target.checked);
        };

        // 8) Checkbox to enable/disable the day/night cycle.
        //    Also handles the enabling/disabling of UI controls related to lighting.
        getElement('cycle').onclick = e => {
            this.world.setDayNightCycle(e.target.checked);

            if (e.target.checked) {
                // If the cycle is active, enable ambient automation and disable manual controls.
                getElement('automateAmbientColor').disabled = false;
                getElement('night').disabled = true;
                getElement('light-pos').disabled = true;
            } else {
                // If the cycle is off, disable ambient automation and allow manual toggles.
                getElement('automateAmbientColor').disabled = true;
                getElement('night').disabled = false;
                getElement('light-pos').disabled = false;
            }
        };

        // 9) Button or checkbox that manually switches between night and day when day/night cycle is off.
        getElement('night').onclick = e => {
            // The world uses isNight boolean to decide if it's night or day.
            // This toggles the time when the user clicks.
            this.world.changeTime(this.world.isNight);
        };

        // 10) Checkbox to toggle overall lighting in the scene.
        getElement('toggleLighting').onclick = e => {
            this.world.setLighting(e.target.checked);
        };

        // 11) Functions to update diffuse and specular lighting colors based on slider inputs.
        //     We bind them to `this` so they can access `this.world`.
        function updateDiffuseColor () {
            let r = getElement('diffuse-red').value;
            let g = getElement('diffuse-green').value;
            let b = getElement('diffuse-blue').value;
            this.world.updateDiffuseColor(r, g, b);
        }

        function updateSpecularColor () {
            let r = getElement('specular-red').value;
            let g = getElement('specular-green').value;
            let b = getElement('specular-blue').value;
            let n = getElement('specular-n').value;
            this.world.updateSpecularColor(r, g, b, n);
        }

        // Bind these functions to preserve the correct `this` context.
        updateDiffuseColor = updateDiffuseColor.bind(this);
        updateSpecularColor = updateSpecularColor.bind(this);

        // Attach them to the `input` events of the corresponding range sliders.
        getElement('diffuse-red').oninput = e => updateDiffuseColor();
        getElement('diffuse-green').oninput = e => updateDiffuseColor();
        getElement('diffuse-blue').oninput = e => updateDiffuseColor();

        getElement('specular-red').oninput = e => updateSpecularColor();
        getElement('specular-green').oninput = e => updateSpecularColor();
        getElement('specular-blue').oninput = e => updateSpecularColor();
        getElement('specular-n').oninput = e => updateSpecularColor();
    }

    /**
     * A helper function to toggle an animation on or off when a button is clicked.
     *
     * @param {Animation} animation - The target animation object.
     * @param {string} startMsg - The label to show on the button when animation can start.
     * @param {string} endMsg - The label to show on the button when animation is running.
     * @param {HTMLButtonElement} target - The button that triggers the animation.
     * @param {[HTMLButtonElement]} concurrents - An array of other buttons to disable when this animation starts.
     */
    _toggleAnimation(animation, startMsg, endMsg, target, concurrents = []) {
        // If the animation has finished or is not running, start it.
        if (animation.isFinished()) {
            target.innerHTML = endMsg;
            animation.start();
            // Disable the concurrent buttons.
            for (let concurrent of concurrents) {
                concurrent.disabled = true;
            }
        } else {
            // Otherwise, stop the animation.
            target.innerHTML = startMsg;
            animation.stop();
            // Re-enable the concurrent buttons.
            for (let concurrent of concurrents) {
                concurrent.disabled = false;
            }
        }
    }
}
