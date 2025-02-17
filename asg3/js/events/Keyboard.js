class Keyboard {

    /**
     * You should call registerEvents() to finish the initialization.
     */
    constructor () {
        this.keys = new Map();
        this.jUp = false;
        this.jDown = false;
    }

    /**
     * It registers all the events.
     *
     * @param {string} canvasId the canvas' id
     */
    registerEvents (canvasId) {
        getElement(canvasId).onkeydown = e => {
            this.keys.set(e.keyCode, true);

            this.jUp = false;
            this.jDown = true;

            e.preventDefault();
        }

        getElement(canvasId).onkeyup = e => {
            this.keys.set(e.keyCode, false);

            this.jUp = true;
            this.jDown = false;

            e.preventDefault();
        }
    }

    /**
     * Returns true if the specified key is down.
     * @param {int} keyCode
     */
    isDown (keyCode) {
        return this.keys.get(keyCode) == undefined ? false : this.keys.get(keyCode);
    }

    /**
     * Returns true if a key has been released.
     * It will be turned to false once that this method has been called.
     * So you should only call it once.
     */
    justUp () {
        if (this.jUp) {
            this.jUp = false
            return true;
        } else {
            return false;
        }
    }

    /**
     * Returns true if a key has been pressed.
     * It will be turned to false once that this method has been called.
     * So you should only call it once.
     */
    justDown () {
        if (this.jDown) {
            this.jDown = false
            return true;
        } else {
            return false;
        }
    }
}

// Mappings

Keyboard.K_LEFT = 37;
Keyboard.K_UP = 38;
Keyboard.K_RIGHT = 39;
Keyboard.K_DOWN = 40;

Keyboard.K_W = 87;
Keyboard.K_A = 65;
Keyboard.K_S = 83;
Keyboard.K_D = 68;

Keyboard.K_Q = 81;
Keyboard.K_E = 69;

Keyboard.K_SHIFT = 16;
Keyboard.K_SPACE = 32;
Keyboard.K_CTRL = 17;