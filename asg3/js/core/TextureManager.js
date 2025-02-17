class TextureManager {

    /**
     * @param {[String]} texturesNames
     */
    constructor(texturesNames) {
        this.texturesNames = texturesNames;
        this.textures = new Map();
    }

    /**
     * It loads all the the textures. Compatile with async keyword (it uses promises).
     * @param {WebGL2RenderingContext} gl
     */
    async loadTextures (gl) {
        // Parameters
        const level = 0;
        const internalFormat = gl.RGBA;
        const srcFormat = gl.RGBA;
        const srcType = gl.UNSIGNED_BYTE;

        // Texture path
        const texturesDir = 'resources/textures/';
        const texturesExt = '.png';

        // To make "await" work
        const promiseArray = [];

        for (let textureName of this.texturesNames) {
            promiseArray.push(new Promise(resolve => {
                const texture = gl.createTexture();
                const image = new Image();

                image.onload = () => {
                    gl.bindTexture(gl.TEXTURE_2D, texture);
                    gl.texImage2D(gl.TEXTURE_2D, level, internalFormat, srcFormat, srcType, image);

                    if (this._isPowerOf2(image.width) && this._isPowerOf2(image.height)) {
                        // Yes, it's a power of 2. Generate mips.
                        gl.generateMipmap(gl.TEXTURE_2D);
                    } else {
                        // No, it's not a power of 2. Turn off mips and set
                        // wrapping to clamp to edge
                        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
                        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
                        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
                    }

                    this.textures.set(textureName, texture);

                    console.debug('Loaded image ' + textureName);
                    resolve();
                }

                let src = texturesDir + textureName + texturesExt
                console.debug('Loading image ' + textureName + ' from: ' + src);
                image.src = src;
            }));
        }

        await Promise.all(promiseArray);
    }

    /**
     * It returns a ready-to-use WebGL texture from its name.
     * @param {String} name
     */
    getTexture (name) {
        return this.textures.get(name);
    }

    /**
     * Returns true if the given value is a power of 2.
     * @param {Integer} value
     */
    _isPowerOf2(value) {
        return (value & (value - 1)) == 0;
    }
}