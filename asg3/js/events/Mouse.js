class Mouse {

    /**
     * Constructs a Mouse object to track mouse interactions on a specific canvas.
     * You must call registerEvents() to attach the event listeners to the canvas.
     */
    constructor () {
        // Press (mouse down) position
        this.px = null; // X coordinate of last mousedown
        this.py = null; // Y coordinate of last mousedown

        // Release (mouse up) position
        this.rx = null; // X coordinate of last mouseup
        this.ry = null; // Y coordinate of last mouseup

        // Current move position (updated on mousemove)
        this.mx = null; // Current X
        this.my = null; // Current Y

        // Last move position recorded, used for calculating deltas
        this.lx = null;
        this.ly = null;

        // A stored "last" position array [x, y] for computing movement deltas
        this.last = null;

        // A bounding box (the client area of the canvas) from the event
        this.bb = null;

        // Whether the mouse is currently pressed down
        this.down = false;
    }

    /**
     * Registers event handlers (mousedown, mouseup, mousemove) on the canvas.
     *
     * @param {string} canvasId - The ID of the canvas element in the HTML.
     */
    registerEvents (canvasId) {
        // When mouse button is pressed down
        getElement(canvasId).onmousedown = e => {
            this.down = true;

            // Record the X and Y positions of this mouse down event
            this.px = e.clientX;
            this.py = e.clientY;

            // Store bounding client rect from the event target (the canvas)
            this.bb = e.target.getBoundingClientRect();
        };

        // When mouse button is released
        getElement(canvasId).onmouseup = e => {
            this.down = false;

            // Record the X and Y positions of this mouse up event
            this.rx = e.clientX;
            this.ry = e.clientY;

            // Store bounding client rect again
            this.bb = e.target.getBoundingClientRect();
        };

        // When the mouse is moved
        getElement(canvasId).onmousemove = e => {
            // Update the current mouse position
            this.mx = e.clientX;
            this.my = e.clientY;

            // Update the bounding rect
            this.bb = e.target.getBoundingClientRect();
        };
    }

    /**
     * Stores a "last position" for future delta calculations.
     * @param {[number, number]} pos - An array [x, y] representing a mouse position.
     */
    recordLastPos (pos) {
        this.last = pos;
    }

    /**
     * Returns the position [x, y] of the most recent mouse down event,
     * or [null, null] if it hasn't occurred yet.
     * @returns {[number, number]} An array with [x, y].
     */
    getPressPos () {
        return [this.px, this.py];
    }

    /**
     * Returns the position [x, y] of the most recent mouse up event,
     * or [null, null] if it hasn't occurred yet.
     * @returns {[number, number]} An array with [x, y].
     */
    getReleasePos () {
        return [this.rx, this.ry];
    }

    /**
     * Returns the position [x, y] of the most recent mouse move event,
     * or [null, null] if it hasn't occurred yet.
     * @returns {[number, number]} An array with [x, y].
     */
    getMovingPos () {
        return [this.mx, this.my];
    }

    /**
     * Computes and returns the difference [dx, dy] between the current
     * mouse position and the "last" recorded position, useful for
     * dragging/rotation logic.
     * @returns {[number, number]} An array [dx, dy].
     */
    getDeltaPos () {
        // If there's no last position stored, return [0, 0].
        if (this.last == null) return [0, 0];
        return [this.mx - this.last[0], this.my - this.last[1]];
    }

    /**
     * Returns the bounding client rect of the canvas on which the mouse
     * event happened, or null if no event has occurred yet.
     * @returns {DOMRect} A bounding rectangle object.
     */
    getBoundingBox () {
        return this.bb;
    }

    /**
     * Returns true if the mouse button is currently held down, false otherwise.
     * @returns {boolean} True if mouse is down, false if not.
     */
    isDown () {
        return this.down;
    }
}
