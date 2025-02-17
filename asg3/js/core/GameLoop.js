class GameLoop {

    /**
     * Constructs a GameLoop instance that manages update and render functions, 
     * and handles fixed-time-step updates (STEP = 1/60 seconds).
     *
     * Usage example:
     *   let gameLoop = new GameLoop(
     *       dt => this.update(dt),
     *       dt => this.render(dt)
     *   );
     *
     * @param {function(float)} updateFunc - The update function, called with dt as a parameter (time step).
     * @param {function(float)} renderFunc - The render function, called with dt as a parameter (time step).
     */
    constructor(updateFunc, renderFunc) {
        // Set up an FPSMeter to display performance stats (FPS, graph, etc.).
        this.fpsmeter = new FPSMeter({
            decimals: 0,
            graph: true,
            theme: 'transparent',
            left: '10px',
            top: '10px'
        });

        // Store the timestamp of the last frame.
        this.last = this._timestamp();

        // Accumulated time since the last update.
        this.dt = 0;

        // Fixed timestep (in seconds) for each "update" call (60 updates per second).
        this.STEP = 1/60;

        // References to the update and render functions provided by the user.
        this.uFunc = updateFunc;
        this.rFunc = renderFunc;

        // Ensure 'this' is bound correctly inside the _tick method when used as a callback.
        this._tick = this._tick.bind(this);
    }

    /**
     * Starts the game loop by requesting the first animation frame.
     */
    start () {
        requestAnimationFrame(this._tick);
    }

    /**
     * This method is called each frame, and is responsible for:
     *  - Measuring time differences to compute dt.
     *  - Running fixed-timestep updates (possibly multiple times if dt is large).
     *  - Calling the render function once per frame.
     *  - Requesting the next frame.
     */
    _tick () {
        // Start measuring for the FPS meter.
        this.fpsmeter.tickStart();

        // Get current time in milliseconds.
        let now = this._timestamp();
        // Calculate how many seconds have passed since the last frame, capping at 1 second for safety.
        this.dt = this.dt + Math.min(1, (now - this.last) / 1000);

        // While there is enough accumulated time to perform an update step...
        while (this.dt > this.STEP) {
            // Decrease accumulated time by one fixed step.
            this.dt -= this.STEP;
            // Call the user-defined update function for that step.
            this.uFunc(this.STEP);
        }

        // Once updates are done, call the user-defined render function with the remaining dt.
        this.rFunc(this.dt);

        // End FPS meter measurement for this frame.
        this.fpsmeter.tick();

        // Store current time for the next frame.
        this.last = now;

        // Request the browser for the next animation frame.
        requestAnimationFrame(this._tick);
    }

    /**
     * Returns the current timestamp in milliseconds. Prefer performance.now() if available for accuracy.
     */
    _timestamp() {
        return window.performance && window.performance.now
            ? window.performance.now()
            : new Date().getTime();
    }

}
