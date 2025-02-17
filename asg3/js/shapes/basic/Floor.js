/**
 *
 * Description:
 *  This class is used to create a repeating floor.
 */


class Floor extends Cube {

    constructor(gl, matrix, texture, textureName, repeat) {
        super(gl, matrix, null, texture, textureName);

        for (let i = 0; i < this.textureCoords.length; i++) {
            this.textureCoords[i] *= repeat;
        }
    }
}