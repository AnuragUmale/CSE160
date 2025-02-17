class Animal extends Shape {

    /**
     * An abstract class for animal-like shapes that extend the base Shape class.
     * Holds sub-shapes (body parts, etc.) in an array to be drawn together.
     *
     * @param {WebGL2RenderingContext} gl - The WebGL context.
     * @param {Matrix4} matrix - The transformation matrix for this shape.
     */
    constructor (gl, matrix) {
        // Call the parent Shape constructor with the provided WebGL context and matrix.
        super(gl, matrix);

        // An array to store all sub-shapes (e.g., limbs, head, etc.) that make up this Animal.
        this.shapes = [];
    }

    /**
     * Builds (or rebuilds) the structure of the animal.
     * Placeholder method intended to be overridden by subclasses if needed.
     */
    build () {
        // Default implementation does nothing.
        // Subclasses could populate `this.shapes` here.
    }

    /**
     * Updates the animal over time, e.g., animations or behavior.
     * @param {number} dt - The time elapsed (in seconds or milliseconds, depending on usage) since last update.
     * Placeholder method intended to be overridden by subclasses.
     */
    update (dt) {
        // Default does nothing.
        // Subclasses might update shape transformations or animations here.
    }

    /**
     * Draws all the sub-shapes that make up this Animal.
     * Invokes build() and then draw() for each sub-shape in `this.shapes`.
     */
    draw () {
        // Iterate through each sub-shape in the array.
        this.shapes.forEach((shape) => {
            // Ensure the sub-shape is built (geometry and transformations) before drawing.
            shape.build();
            // Perform the rendering of the sub-shape.
            shape.draw();
        });
    }
}
