class GameLoop {

    /**
     * It creates and initializes all the attributes. Run start() to start the
     * game loop.
     *
     * Usage example:
     *  let gameLoop = new GameLoop(dt => this.update(dt), dt => this.render(dt));
     *
     * @param {function(float)} updateFunc the update function with dt has parameter
     * @param {function(float)} renderFunc the render function with dt has parameter
     */
    constructor(updateFunc, renderFunc) {
        this.fpsmeter = new FPSMeter({
            decimals: 0,
            graph: true,
            theme: 'transparent',
             left: '10px',
             top: '10px' 
        });

        this.last = this._timestamp();
        this.dt = 0;
        this.STEP = 1/60; // Number of updates per seconds

        this.uFunc = updateFunc;
        this.rFunc = renderFunc;

        this._tick = this._tick.bind(this);
    }

    /**
     * It starts the gameloop.
     */
    start () {
        requestAnimationFrame(this._tick);
    }

    /**
     * Tick tock tack
     */
    _tick () {
        this.fpsmeter.tickStart();

        let now = this._timestamp();
        this.dt = this.dt + Math.min(1, (now - this.last) / 1000);

        while (this.dt > this.STEP) {
            this.dt = this.dt - this.STEP;
            this.uFunc(this.STEP);
        }

        this.rFunc(this.dt);

        this.fpsmeter.tick();

        this.last = now;
        requestAnimationFrame(this._tick);
    }

    /**
     * Returns the timestamp in ms.
     */
    _timestamp() {
        return window.performance && window.performance.now ? window.performance.now() : new Date().getTime();
    }

}