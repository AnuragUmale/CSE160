/**
 * Description:
 *  This class is used to create a "skybox". It is a specialized cube with a different
 *  texture mapping, allowing seamless wrapping of a sky texture around the inside.
 */

class Sky extends Cube {

    /**
     * @param {WebGL2RenderingContext} gl - The WebGL context.
     * @param {Matrix4} matrix - The model matrix for positioning/transforming the skybox.
     * @param {WebGLTexture} texture - The texture to apply as the skybox.
     * @param {String} textureName - A name or identifier for the texture.
     */
    constructor(gl, matrix, texture, textureName) {
        // Call the parent Cube constructor with no colors, using the provided texture.
        super(gl, matrix, null, texture, textureName);

        // Override the default texture coordinates with a custom mapping.
        // This mapping arranges how each face of the cube samples from the sky texture.
        this.textureCoords = new Float32Array([
            // Front face
            0.25, 0.0,   0.0, 0.0,   0.0, 1.0,   0.25, 1.0,
            // Right face
            0.25, 0.0,   0.25, 1.0,  0.5, 1.0,   0.5, 0.0,
            // Top face
            0.2,  0.0,   0.0,  0.0,   0.0,  0.2,   0.2,  0.2,
            // Left face
            1.0,  0.0,   0.75, 0.0,   0.75, 1.0,   1.0,  1.0,
            // Bottom face
            0.01, 0.99,  0.005, 0.99, 0.005, 0.994, 0.01, 0.994,
            // Back face
            0.5,  1.0,   0.75, 1.0,   0.75, 0.0,    0.5,  0.0,
        ]);
    }

    /**
     * Draws the skybox. By default, the inside of the cube is shown,
     * so culling the FRONT faces shows the inside faces.
     */
    draw() {
        // Temporarily cull the "front" side so we can see the inside of the cube.
        this.gl.cullFace(this.gl.FRONT);
        // Call the parent (Cube) draw method.
        super.draw();
        // Revert to culling the back faces (default).
        this.gl.cullFace(this.gl.BACK);
    }
}
