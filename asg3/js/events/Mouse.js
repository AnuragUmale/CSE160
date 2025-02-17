class Mouse {

    /**
     * You should call registerEvents() to finish the initialization.
     */
    constructor () {
        // Press pos
        this.px = null;
        this.py = null;
        // Release pos
        this.rx = null;
        this.ry = null;

        // Moving pos
        this.mx = null;
        this.my = null;
        // Last moving pos
        this.lx = null;
        this.ly = null;

        this.last = null;

        this.bb = null;
        this.down = false;
    }

    /**
     * It registers all the events.
     *
     * @param {string} canvasId the canvas' id
     */
    registerEvents (canvasId) {
        getElement(canvasId).onmousedown = e => {
            this.down = true;

            this.px = e.clientX;
            this.py = e.clientY;

            this.bb = e.target.getBoundingClientRect();
        }

        getElement(canvasId).onmouseup = e => {
            this.down = false;

            this.rx = e.clientX;
            this.ry = e.clientY;

            this.bb = e.target.getBoundingClientRect();
        }

        getElement(canvasId).onmousemove = e => {
            this.mx = e.clientX;
            this.my = e.clientY;

            this.bb = e.target.getBoundingClientRect();
        }
    }

    /**
     * It records the last position with the given one (used by getDeltaPos)
     * @param {[int, int]} pos [x, y]
     */
    recordLastPos (pos) {
        this.last = pos;
    }

    /**
     * Returns the position [x, y] of the last down event or null if unset.
     */
    getPressPos () {
        return [this.px, this.py];
    }

    /**
     * Returns the position [x, y] of the last release event or null if unset.
     */
    getReleasePos () {
        return [this.rx, this.ry];
    }

    /**
     * Returns the position [x, y] of the last move event or null if unset.
     */
    getMovingPos () {
        return [this.mx, this.my];
    }

    /**
     * Returns the difference [dx, dy] between the current mouse
     * position, and the last one or null if unset.
     */
    getDeltaPos () {
        if (this.last == null) return [0, 0];
        return [this.mx - this.last[0], this.my - this.last[1]];
    }

    /**
     * Returns the bounding rect of the mouse or null if unset.
     */
    getBoundingBox () {
        return this.bb;
    }

    /**
     * Returns true if the mouse is being pressed.
     */
    isDown () {
        return this.down;
    }
}