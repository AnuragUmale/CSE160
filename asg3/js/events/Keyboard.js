class Keyboard {

    /**
     * Constructs a Keyboard object to track key states.
     * You must call registerEvents() to bind to the canvas events.
     */
    constructor () {
        // A Map to store whether a key is currently pressed (true) or not (false).
        // Key: keyCode (int), Value: boolean
        this.keys = new Map();

        // Flags to track one-time states (just pressed, just released).
        this.jUp = false;    // True when a key was just released.
        this.jDown = false;  // True when a key was just pressed.
    }

    /**
     * Binds 'keydown' and 'keyup' events to the canvas element with the given ID.
     *
     * @param {string} canvasId - The ID of the canvas in which we'll capture keyboard events.
     */
    registerEvents (canvasId) {
        // When a key is pressed in the canvas, set the key state to true.
        getElement(canvasId).onkeydown = e => {
            this.keys.set(e.keyCode, true);

            // Mark that a key has just been pressed (jDown).
            this.jUp = false;
            this.jDown = true;

            // Prevent default browser behavior (e.g., scrolling with arrow keys).
            e.preventDefault();
        };

        // When a key is released in the canvas, set the key state to false.
        getElement(canvasId).onkeyup = e => {
            this.keys.set(e.keyCode, false);

            // Mark that a key has just been released (jUp).
            this.jUp = true;
            this.jDown = false;

            // Prevent default browser behavior.
            e.preventDefault();
        };
    }

    /**
     * Checks if the specified key is currently being held down.
     * @param {int} keyCode - The numerical code of the key (e.g., Keyboard.K_W).
     * @returns {boolean} True if the key is down, otherwise false.
     */
    isDown (keyCode) {
        // If not defined yet, return false; otherwise return the stored boolean.
        return this.keys.get(keyCode) === undefined ? false : this.keys.get(keyCode);
    }

    /**
     * Checks if a key was just released.
     * - Returns true if it was just released since the last check.
     * - Immediately sets jUp back to false, so it only returns true once.
     * @returns {boolean} True if a key has just been released, false otherwise.
     */
    justUp () {
        if (this.jUp) {
            this.jUp = false;
            return true;
        } else {
            return false;
        }
    }

    /**
     * Checks if a key was just pressed.
     * - Returns true if it was just pressed since the last check.
     * - Immediately sets jDown back to false, so it only returns true once.
     * @returns {boolean} True if a key has just been pressed, false otherwise.
     */
    justDown () {
        if (this.jDown) {
            this.jDown = false;
            return true;
        } else {
            return false;
        }
    }
}

// Mappings for commonly used keys
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
