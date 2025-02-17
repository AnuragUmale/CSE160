/**
 * Description:
 *  This class is used to easily create a cube:
 *    v6----- v5
 *   /|      /|
 *  v1------v0|
 *  | |     | |
 *  | |v7---|-|v4
 *  |/      |/
 *  v2------v3
 */

class Cube extends Shape {
    /**
     * Initializes all the arrays and buffers needed for rendering a textured or colored cube.
     *
     * @param {WebGL2RenderingContext} gl        - The WebGL rendering context.
     * @param {Matrix4}                matrix    - The model matrix for positioning/transforming the cube.
     * @param {Array}                  colors    - One of:
     *                                              1) An RGBA array of length 4 => single color for all faces.
     *                                              2) An RGBA array of length 4*6 => custom color for each face.
     *                                              3) Null => we must use a texture instead.
     * @param {WebGLTexture}           texture   - A WebGL texture object (optional). Null if not using textures.
     * @param {String}                 textureName - An identifier for the texture (optional).
     */
    constructor(gl, matrix, colors, texture, textureName) {
        // Invoke the parent constructor with the WebGL context and matrix.
        super(gl, matrix);

        // By default, no colors or texture are set unless passed in.
        this.colors = null;
        this.textureName = null;
        this.texture = null;

        // Handle colors array (either single color or per-face colors).
        if (colors !== null) {
            let vcolors = [];
            for (let i = 0; i < 6; i++) {        // 6 faces
                for (let j = 0; j < 4; j++) {    // 4 vertices per face
                    for (let k = 0; k < 4; k++) { 
                        // If the color array is length 4, use the same RGBA for all faces.
                        // Otherwise, pick face i's RGBA from the extended array (k+4*i).
                        vcolors.push(
                            colors.length === 4 ? colors[k] : colors[k + 4*i]
                        );
                    }
                }
            }
            // Store the final color array as a Float32Array.
            this.colors = new Float32Array(vcolors);
        }

        // Handle texture setup if provided (non-null).
        if (texture !== null) {
            this.textureName = textureName; 
            this.texture = texture;

            // Texture coordinates for each face (Front, Right, Top, Left, Bottom, Back).
            // Each face has 4 vertices => 8 floats (u,v) per face.
            this.textureCoords = new Float32Array([
                // Front face
                1.0, 0.0,   0.0, 0.0,   0.0, 1.0,   1.0, 1.0,
                // Right face
                0.0, 0.0,   0.0, 1.0,   1.0, 1.0,   1.0, 0.0,
                // Top face
                1.0, 0.0,   0.0, 0.0,   0.0, 1.0,   1.0, 1.0,
                // Left face
                0.0, 0.0,   1.0, 0.0,   1.0, 1.0,   0.0, 1.0,
                // Bottom face
                0.0, 0.0,   1.0, 0.0,   1.0, 1.0,   0.0, 1.0,
                // Back face
                0.0, 1.0,   1.0, 1.0,   1.0, 0.0,   0.0, 0.0
            ]);
        }

        if (texture === null && colors === null) {
            console.error('Please specify either the colors or the texture of the cube');
        }

        // Define normals for each face (for lighting calculations).
        // 6 faces * 4 vertices = 24 normal vectors.
        this.normals = new Float32Array([
            // Front face (z++)
            0.0, 0.0,  1.0,   0.0,  0.0,  1.0,   0.0,  0.0,  1.0,   0.0,  0.0,  1.0, 
            // Right face (x++)
            1.0, 0.0,  0.0,   1.0,  0.0,  0.0,   1.0,  0.0,  0.0,   1.0,  0.0,  0.0, 
            // Top face (y++)
            0.0, 1.0,  0.0,   0.0,  1.0,  0.0,   0.0,  1.0,  0.0,   0.0,  1.0,  0.0,
            // Left face (x--)
            -1.0, 0.0, 0.0,  -1.0,  0.0,  0.0,  -1.0,  0.0,  0.0,  -1.0,  0.0,  0.0,
            // Bottom face (y--)
            0.0, -1.0, 0.0,   0.0, -1.0,  0.0,   0.0, -1.0,  0.0,   0.0, -1.0,  0.0,
            // Back face (z--)
            0.0, 0.0, -1.0,   0.0,  0.0, -1.0,   0.0,  0.0, -1.0,   0.0,  0.0, -1.0
        ]);

        // Vertex positions (each face has 4 vertices).
        this.vertices = new Float32Array([
            // Front face: v0,v1,v2,v3
             1.0, 1.0, 1.0,  -1.0, 1.0, 1.0,  -1.0,-1.0, 1.0,   1.0,-1.0, 1.0,
            // Right face: v0,v3,v4,v5
             1.0, 1.0, 1.0,   1.0,-1.0, 1.0,   1.0,-1.0,-1.0,   1.0, 1.0,-1.0,
            // Top face: v0,v5,v6,v1
             1.0, 1.0, 1.0,   1.0, 1.0,-1.0,  -1.0, 1.0,-1.0,  -1.0, 1.0, 1.0,
            // Left face: v1,v6,v7,v2
            -1.0, 1.0, 1.0,  -1.0, 1.0,-1.0,  -1.0,-1.0,-1.0,  -1.0,-1.0, 1.0,
            // Bottom face: v7,v4,v3,v2
            -1.0,-1.0,-1.0,   1.0,-1.0,-1.0,   1.0,-1.0, 1.0,  -1.0,-1.0, 1.0,
            // Back face: v4,v7,v6,v5
             1.0,-1.0,-1.0,  -1.0,-1.0,-1.0,  -1.0, 1.0,-1.0,   1.0, 1.0,-1.0
        ]);

        // Indices define the two triangles per face (6 faces * 2 triangles = 12).
        // Each face has 4 vertices => 6 indices. 6 faces => 36 indices total.
        this.indices = new Uint8Array([
            0, 1, 2,    0, 2, 3,     // front face
            4, 5, 6,    4, 6, 7,     // right face
            8, 9,10,    8,10,11,     // top face
            12,13,14,  12,14,15,     // left face
            16,17,18,  16,18,19,     // bottom face
            20,21,22,  20,22,23      // back face
        ]);
    }

    /**
     * Fills the buffers with this Cube's vertices, indices, normals, etc.
     * Sets up attributes for color or texture, depending on which is provided.
     *
     * This method attempts to optimize re-binds if multiple cubes are drawn one after another.
     *
     * @return {Cube} - Returns the current instance for optional chaining, or null if there's an error.
     */
    build() {
        let updateColor = false;
        let updateTexture = false;
        let updateMatrix = false;

        // If the last shape is not a Cube, we need to set up all buffers.
        if (Shape.lastShape === null || !(Shape.lastShape instanceof Cube)) {
            updateColor = this.colors === null ? false : true;
            updateTexture = this.texture === null ? false : true;
            updateMatrix = true;

            // Create and bind index buffer for the ELEMENT_ARRAY_BUFFER
            let indexBuffer = this.gl.createBuffer();
            this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
            this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, this.indices, this.gl.STATIC_DRAW);

            // Bind normal attributes (used for lighting).
            this._bindAttrib(this.normals, 3, this.gl.FLOAT, this.a_Normal);

            // Bind vertex positions.
            this._bindAttrib(this.vertices, 3, this.gl.FLOAT, this.a_Position);
        } else {
            // If last shape is also a Cube, only update what's changed (color, texture, matrix).
            updateColor = (this.colors === null) ? false : !float32Equals(Shape.lastShape.colors, this.colors);
            updateTexture = (this.texture === null) ? false : (!float32Equals(Shape.lastShape.textureCoords, this.textureCoords) || Shape.lastShape.textureName !== this.textureName);
            updateMatrix = (Shape.lastShape.matrix !== this.matrix);
        }

        // If we need to update texture...
        if (updateTexture) {
            // Disable the color vertex attribute array to use the texture instead.
            this.gl.disableVertexAttribArray(this.a_Color);
            // Force default color = (0,0,0,0) for the shape.
            this.gl.vertexAttrib4f(this.a_Color, 0, 0, 0, 0);

            // Bind texture coordinates.
            this._bindAttrib(this.textureCoords, 2, this.gl.FLOAT, this.a_TexCoord);

            // Bind the actual texture to texture unit 0.
            this.gl.bindTexture(this.gl.TEXTURE_2D, this.texture);
            // Inform the shader that the texture is in texture unit 0.
            this.gl.uniform1i(this.u_Sampler, 0);
        }

        // If we need to update color...
        if (updateColor) {
            // If using only colors, disable the texture attribute array.
            if (this.texture === null) {
                this.gl.bindTexture(this.gl.TEXTURE_2D, null);
                this.gl.disableVertexAttribArray(this.a_TexCoord);
            }
            this._bindAttrib(this.colors, 4, this.gl.FLOAT, this.a_Color);
        }

        // If the matrix changed, update the uniform for the model matrix.
        if (updateMatrix) {
            this.gl.uniformMatrix4fv(this.u_ModelMatrix, false, this.matrix.elements);
        }

        // Mark this cube as the last shape used (for optimization).
        Shape.lastShape = this;

        return this;
    }

    /**
     * Draws the cube using the currently bound buffers and attributes.
     * Ensures we're drawing triangles using the index buffer.
     */
    draw() {
        // Render the 36 elements (6 faces * 6 indices each).
        this.gl.drawElements(this.gl.TRIANGLES, this.indices.length, this.gl.UNSIGNED_BYTE, 0);
    }

    /**
     * Replaces the texture of this cube with a new texture object.
     * @param {WebGLTexture} texture     - The new texture to apply.
     * @param {String}       textureName - Identifier for the new texture (optional).
     */
    changeTexture(texture, textureName) {
        this.texture = texture;
        this.textureName = textureName;
    }
}
