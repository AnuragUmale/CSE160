/**
 * Description:
 *  This class is used to create a repeating floor by extending a textured Cube.
 */

class Floor extends Cube {

    /**
     * Constructs a floor by creating a Cube with a repeated texture.
     *
     * @param {WebGL2RenderingContext} gl         - The WebGL context.
     * @param {Matrix4}                matrix     - The model matrix for positioning/transforming the floor.
     * @param {WebGLTexture}           texture    - The WebGL texture to apply to the floor.
     * @param {String}                 textureName - A name or identifier for the texture.
     * @param {Number}                 repeat     - The factor by which to repeat the texture coordinates.
     */
    constructor(gl, matrix, texture, textureName, repeat) {
        // Call the parent Cube constructor with no colors, using the provided texture.
        super(gl, matrix, null, texture, textureName);

        // Multiply all texture coordinates by 'repeat' to achieve tiled repetition.
        for (let i = 0; i < this.textureCoords.length; i++) {
            this.textureCoords[i] *= repeat;
        }
    }
}
