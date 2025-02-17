/**
 *
 * Description:
 *  This class is used to create a "skybox". It is a cube, but the texture
 *  is mapped differently
 */

class Sky extends Cube {

    constructor(gl, matrix, texture, textureName) {
        super(gl, matrix, null, texture, textureName);

        this.textureCoords = new Float32Array([
            0.25, 0.0,  0.0, 0.0,  0.0, 1.0,  0.25, 1.0, // Front
            0.25, 0.0,  0.25, 1.0,  0.5, 1.0,  0.5, 0.0, // Right
            0.2, 0.0,  0.0, 0.0,  0.0, 0.2,  0.2, 0.2, // Top
            1.0, 0.0,  0.75, 0.0,  0.75, 1.0,  1.0, 1.0, // Left
            0.01, 0.99,  0.005, 0.99,  0.005, 0.994,  0.01, 0.994, // Bottom
            0.5, 1.0,  0.75, 1.0,  0.75, 0.0,  0.5, 0.0, // Back
        ]);
    }

    draw () {
        this.gl.cullFace(this.gl.FRONT);
        super.draw();
        this.gl.cullFace(this.gl.BACK);
    }
}
