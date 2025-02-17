/**
 * Description:
 *  Thanks to this class, we can use polymorphism concepts.
 *  It will simplify a lot of code and prevent duplication.
 */

class Shape {

    /**
     * Creates a base Shape with a WebGL context and a model matrix.
     * Most shapes (Cube, Sphere, etc.) will extend this class to share
     * common rendering logic (like binding attribute buffers).
     *
     * @param {WebGL2RenderingContext} gl    - The WebGL context.
     * @param {Matrix4}                matrix - Model matrix for positioning/transforming the shape.
     */
    constructor(gl, matrix) {
        // Store the WebGL context and the model matrix.
        this.gl = gl;
        this.matrix = matrix;

        // Keep a copy of the default (initial) matrix for reference or resetting.
        this.defmatrix = new Matrix4(matrix);

        // Retrieve attribute/uniform locations from the current WebGL program.
        // a_Color:   Vertex color attribute
        // u_ModelMatrix: The model matrix uniform for the vertex shader
        // a_Position: Vertex position attribute
        // u_Sampler:  The sampler uniform (texture)
        // a_TexCoord: Texture coordinate attribute
        // a_Normal:   Normal vector attribute (for lighting calculations)
        this.a_Color =    this.gl.getAttribLocation(this.gl.program, 'a_Color');
        this.u_ModelMatrix = this.gl.getUniformLocation(this.gl.program, 'u_ModelMatrix');
        this.a_Position = this.gl.getAttribLocation(this.gl.program, 'a_Position');
        this.u_Sampler =  this.gl.getUniformLocation(this.gl.program,'u_Sampler');
        this.a_TexCoord = this.gl.getAttribLocation(this.gl.program, 'a_TexCoord');
        this.a_Normal =   this.gl.getAttribLocation(this.gl.program, 'a_Normal');
    }

    //// ABSTRACT METHODS ////
    // Subclasses (Cube, Sphere, etc.) will typically override these.

    build      ()   {}
    update     (dt) {}
    draw       ()   {}
    getInstance()   {}

    //// UTILITY METHODS /////

    /**
     * Binds the given data to the specified attribute in the GPU (ARRAY_BUFFER).
     * Sets up the data type, size, etc., and enables the attribute for rendering.
     *
     * @param {Float32Array} data - The array of data to bind.
     * @param {GLint}        num  - The number of components per attribute (e.g., 3 for x,y,z).
     * @param {GLenum}       type - The data type (e.g., gl.FLOAT).
     * @param {GLint}        a_attr - The location (index) of the shader attribute.
     */
    _bindAttrib(data, num, type, a_attr) {
        // Create a new buffer on the GPU.
        let buffer = this.gl.createBuffer();
        if (!buffer) {
            console.error('Could not create a buffer');
            return false;
        }

        // Bind the buffer as the current ARRAY_BUFFER.
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffer);
        // Upload the data to the GPU.
        this.gl.bufferData(this.gl.ARRAY_BUFFER, data, this.gl.STATIC_DRAW);

        // Specify how the data is laid out in the buffer for the shader.
        this.gl.vertexAttribPointer(a_attr, num, type, false, 0, 0);
        // Enable this attribute so the shader can use it.
        this.gl.enableVertexAttribArray(a_attr);
    }

    //// GETTERS ////

    /**
     * Returns the current model matrix of the shape.
     * @returns {Matrix4}
     */
    getMatrix() {
        return this.matrix;
    }

    /**
     * Returns the original default (initial) model matrix.
     * @returns {Matrix4}
     */
    getDefaultMatrix() {
        return new Matrix4(this.defmatrix);
    }

    //// SETTERS ////

    /**
     * Updates the shape's model matrix to a new one.
     * @param {Matrix4} matrix - The new model matrix.
     */
    setMatrix(matrix) {
        this.matrix = matrix;
    }
}

// A static property to keep track of the last shape that was built/drawn.
// This helps optimize buffer binding if consecutive draws share certain attributes.
Shape.lastShape = null;
