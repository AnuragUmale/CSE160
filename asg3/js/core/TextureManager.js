class TextureManager {

    /**
     * Manages the loading of textures for use in WebGL.
     *
     * @param {[String]} texturesNames - An array of texture names (without file extension).
     */
    constructor(texturesNames) {
        // Save the list of texture names.
        this.texturesNames = texturesNames;
        // Use a Map to store the name -> WebGLTexture association.
        this.textures = new Map();
    }

    /**
     * Loads all specified textures asynchronously and stores them in the `textures` map.
     * This method uses Promises so it can be awaited, ensuring all textures are loaded
     * before proceeding.
     *
     * @param {WebGL2RenderingContext} gl - The WebGL context where textures are created.
     */
    async loadTextures(gl) {
        // Define texture parameters.
        const level = 0; // Mipmap level (0 = base)
        const internalFormat = gl.RGBA; // Internal texture format
        const srcFormat = gl.RGBA;      // Source image format
        const srcType = gl.UNSIGNED_BYTE; // Data type for image texel data

        // Directory and file extension for texture files.
        const texturesDir = 'resources/textures/';
        const texturesExt = '.png';

        // Prepare an array of Promises for loading each texture.
        const promiseArray = [];

        // Loop through each texture name and create a promise that resolves when the image is loaded.
        for (let textureName of this.texturesNames) {
            promiseArray.push(new Promise(resolve => {
                // Create a WebGL texture object.
                const texture = gl.createTexture();
                // Create a new Image object.
                const image = new Image();

                // Once the image has been successfully loaded...
                image.onload = () => {
                    // Bind the texture so the next operations affect it.
                    gl.bindTexture(gl.TEXTURE_2D, texture);
                    // Upload the image data into the texture.
                    gl.texImage2D(
                        gl.TEXTURE_2D, 
                        level, 
                        internalFormat, 
                        srcFormat, 
                        srcType, 
                        image
                    );

                    // Check if the dimensions are powers of 2 to determine if we can use mipmaps.
                    if (this._isPowerOf2(image.width) && this._isPowerOf2(image.height)) {
                        // Generate mipmaps for power-of-2 textures.
                        gl.generateMipmap(gl.TEXTURE_2D);
                    } else {
                        // If not power-of-2, use clamp to edge and linear filtering.
                        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
                        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
                        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
                    }

                    // Store the created texture in the map, keyed by the textureName.
                    this.textures.set(textureName, texture);

                    console.debug('Loaded image ' + textureName);
                    // Resolve the promise for this texture.
                    resolve();
                };

                // Build the source path, then load the image.
                let src = texturesDir + textureName + texturesExt;
                console.debug('Loading image ' + textureName + ' from: ' + src);
                image.src = src;
            }));
        }

        // Wait until all textures in promiseArray have finished loading.
        await Promise.all(promiseArray);
    }

    /**
     * Returns a loaded WebGLTexture for the given texture name.
     *
     * @param {String} name - The name of the texture to retrieve.
     * @returns {WebGLTexture} The corresponding WebGL texture object.
     */
    getTexture(name) {
        return this.textures.get(name);
    }

    /**
     * Checks if a given integer (e.g., width or height) is a power of 2.
     * Power-of-2 textures are necessary for certain WebGL features like mipmap generation.
     *
     * @param {Integer} value - The integer to test.
     * @returns {Boolean} True if it's a power of 2, otherwise false.
     */
    _isPowerOf2(value) {
        // A number is a power of 2 if (value & (value - 1)) == 0.
        // Example: 8(1000) & 7(0111) = 0.
        return (value & (value - 1)) == 0;
    }
}
