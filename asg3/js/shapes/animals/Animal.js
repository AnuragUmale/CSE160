/**
 *
 * Description:
 *  Parent class for animals.
 */

class Animal extends Shape {

    constructor (gl, matrix) {
        super(gl, matrix);
        this.shapes = [];
    }

    build () { }

    update (dt) { }

    draw () {
        this.shapes.forEach((shape, k) => {
            shape.build();
            shape.draw();
        });
    }
}