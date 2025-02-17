class Animation {
    /**
     * @param {Float} startValue starting value,
     * @param {Float} endValue ending value,
     * @param {Float} valuePerSec speed in value per seconds
     * @param {Boolean} loop true means that the animation will do a "come and go" once finished. It will
     *      go from end to start, then start to end, and so on.
     */
    constructor(startValue, endValue, valuePerSec, loop) {
        this.actualStartValue = startValue;
        this.actualEndValue = endValue;
        this.valuePerSec = valuePerSec;

        this.loop = loop;
        this.paused = true;
        this.finished = true;

        this.startValue = this.actualStartValue;
        this.endValue = this.actualEndValue;
        this.currentValue = this.startValue;
        this.lastValue = this.currentValue;
    }

    /**
     * It starts the animation.
     */
    start() {
        this.paused = false;
        this.finished = false;
    }

    /**
     * It pauses the animation. Use resume() to resume.
     */
    pause() {
        this.paused = true;
    }

    /**
     * It resumes the animation from its last state.
     */
    resume() {
        this.paused = false;
    }

    /**
     * It stops the animation
     */
    stop() {
        this.finished = true;
        this.paused = true;
        this.startValue = this.actualStartValue;
        this.endValue = this.actualEndValue;
        this.currentValue = this.actualStartValue;
    }

    /**
     * It computes the new angle. Use getRotationAngle to get the computed rotation.
     * @param {Float} dt miliseconds since last update.
     */
    tick(dt) {
        if (this.paused || this.finished) return;

        this.lastValue = this.currentValue;

        // Change direction once one of the limit has been reached
        if (Math.abs(this.currentValue) >= Math.abs(this.endValue)) {
            if (this.loop) {
                let tmp = this.startValue;
                this.startValue = this.endValue;
                this.endValue = tmp;
            } else {
                this.stop();
                return;
            }
        }

        // Update rotation according to the direction
        if (this.startValue >= this.endValue) {
            this.currentValue -= this.valuePerSec * dt;
        } else {
            this.currentValue += this.valuePerSec * dt;
        }

        if (this.endValue < 0) this.currentValue = Math.max(this.currentValue, this.endValue);
        else  this.currentValue = Math.min(this.currentValue, this.endValue);
    }

    /**
     * Returns the speed of the animation (value per seconds)
     */
    getSpeed() {
        return this.valuePerSec;
    }

    /**
     * It updates the speed of the animation (value per seconds)
     * @param {float} speed
     */
    setSpeed(speed) {
        this.valuePerSec = speed;
    }

    /**
     * Returns true if the animation is finished. If loop is true,
     * it won't be false unless you manually call stop().
     */
    isFinished() {
        return this.finished;
    }

    /**
     * Returns true if the animation is paused. It will also returns
     * true if the animation is finished.
     */
    isPaused() {
        return this.paused;
    }

    /**
     * Returns the current value of the Animation (the progress).
     */
    getProgress() {
        return this.currentValue;
    }

    /**
     * Returns the last value of the Animation (the last progress).
     */
    getLastProgress() {
        return this.lastValue;
    }

    /**
     * It returns the difference between the last value, and the current one.
     * So it returns the progress made since last tick.
     */
    getProgressDiff() {
        return this.lastValue - this.currentValue;
    }
}