/**
 *
 * Description:
 *  Thanks to this class, we can use polymorphism concepts.
 *  It will simplify a lot of code and prevent duplication.
 */


class Shape {

    /**
     * @param {WebGL2RenderingContext} gl
     * @param {Matrix4} matrix model matrix
     */
    constructor(gl, matrix) {
        this.gl = gl;
        this.matrix = matrix;
        this.defmatrix = new Matrix4(matrix);

        // Color
        this.a_Color = this.gl.getAttribLocation(this.gl.program, 'a_Color');
        // Position
        this.u_ModelMatrix = this.gl.getUniformLocation(this.gl.program, 'u_ModelMatrix')
        this.a_Position = this.gl.getAttribLocation(this.gl.program, 'a_Position');
        // Texture
        this.u_Sampler = this.gl.getUniformLocation(this.gl.program,'u_Sampler');
        this.a_TexCoord = this.gl.getAttribLocation(this.gl.program, 'a_TexCoord');
        // Lighting
        this.a_Normal = this.gl.getAttribLocation(this.gl.program, 'a_Normal');
    }

    //// ABSTRACT METHODS ////

    build      ()   {}
    update     (dt) {}
    draw       ()   {}
    getInstance()   {}

    //// UTILITY METHODS /////

    /**
     * It binds the given data to the specified variable in the GPU.
     * @param {Float32Array} data the data,
     * @param {GLint} num the size,
     * @param {GLenum} type the variable type,
     * @param {String} attr the variable name (attribute)
     */
    _bindAttrib(data, num, type, a_attr) {
        let buffer = this.gl.createBuffer();
        if (!buffer) {
            console.error('Could not create a buffer');
            return false;
        }

        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, data, this.gl.STATIC_DRAW);

        this.gl.vertexAttribPointer(a_attr, num, type, false, 0, 0);
        this.gl.enableVertexAttribArray(a_attr);
    }

    //// GETTERS ////

    /**
     * Returns the model matrix of the cube
     */
    getMatrix() {
        return this.matrix;
    }

    getDefaultMatrix() {
        return new Matrix4(this.defmatrix);
    }

    //// SETTERS ////

    /**
     * Updates the model matrix of the cube.
     * @param {Matrix4} matrix model matrix of the cube
     */
    setMatrix(matrix) {
        this.matrix = matrix;
    }
}

Shape.lastShape = null;