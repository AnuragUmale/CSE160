
// Controls (used by the HTML buttons)

var C_AXIS = true;
var C_FOLLOW_FOX = true;

class HtmlEvents {

    /**
     * You should call registerEvents() to finish the initialization.
     *
     * @param {World} world world instance (not started yet)
     */
    constructor (world) {
        this.world = world;
    }

    /**
     * It registers all the events.
     */
    registerEvents () {
        this.world.getCamera().addOnCamMovingListener(cam => {
            let c = cam.getInfo();
            getElement('camera').innerHTML = (
                'x: ' + c.x.toFixed(2) + '<br>y: ' + c.y.toFixed(2) + '<br>z: ' + c.z.toFixed(2) + '<br>' +
                'pitch: ' + c.pitch.toFixed(2) + '<br>yaw: ' + c.yaw.toFixed(2) + '<br>roll: ' + c.roll.toFixed(2));
        });

        this.world.onFocusChangedListener(fox => {
            if (fox) {
                getElement('fox').style.color = 'green';
                getElement('fox').innerHTML = 'selected';
                getElement('cam').style.color = 'red';
                getElement('cam').innerHTML = 'unselected';
            } else {
                getElement('cam').style.color = 'green';
                getElement('cam').innerHTML = 'selected';
                getElement('fox').style.color = 'red';
                getElement('fox').innerHTML = 'unselected';
            }
        });

        getElement('light-pos').onclick = e => {
            this.world.updateLightPosition();
        }

        getElement('renderHouse').onclick = e => {
            this.world.renderHouse = e.target.checked
        }

        getElement('renderAxis').onclick = e => {
            this.world.renderAxis = e.target.checked;
        }

        getElement('renderNormals').onclick = e => {
            this.world.setRenderNormals(e.target.checked);
        }

        getElement('automateAmbientColor').onclick = e => {
            this.world.setAutomateAmbientColor(e.target.checked);
        }

        getElement('cycle').onclick = e => {
            this.world.setDayNightCycle(e.target.checked);

            if (e.target.checked) {
                getElement('automateAmbientColor').disabled = false;
                getElement('night').disabled = true;
                getElement('light-pos').disabled = true;
            } else {
                getElement('automateAmbientColor').disabled = true;
                getElement('night').disabled = false;
                getElement('light-pos').disabled = false;
            }
        }

        getElement('night').onclick = e => {
            if (e.target.checked) {
                this.world.changeTime(this.world.isNight);
            } else {
                this.world.changeTime(this.world.isNight);
            }
        }

        getElement('toggleLighting').onclick = e => {
            this.world.setLighting(e.target.checked);
        }

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

        updateDiffuseColor = updateDiffuseColor.bind(this);
        updateSpecularColor = updateSpecularColor.bind(this);

        getElement('diffuse-red').oninput = e => updateDiffuseColor();
        getElement('diffuse-green').oninput = e => updateDiffuseColor();
        getElement('diffuse-blue').oninput = e => updateDiffuseColor();

        getElement('specular-red').oninput = e => updateSpecularColor();
        getElement('specular-green').oninput = e => updateSpecularColor();
        getElement('specular-blue').oninput = e => updateSpecularColor();
        getElement('specular-n').oninput = e => updateSpecularColor();
    }

    /**
     * @param {Animation} animation the targetted animation
     * @param {string} startMsg the starting message of the animation
     * @param {string} endMsg the ending message of the animation
     * @param {HTML Button} target the button that triggers the animation
     * @param {[HTML Button]} concurrents the buttons that should be disabled
     */
    _toggleAnimation(animation, startMsg, endMsg, target, concurrents = []) {
        if (animation.isFinished()) {
            target.innerHTML = endMsg;
            animation.start();
            for (let concurrent of concurrents) concurrent.disabled = true;
        } else {
            target.innerHTML = startMsg;
            animation.stop();
            for (let concurrent of concurrents) concurrent.disabled = false;
        }
    }
}