class Axis extends Shape {

    /**
     * Creates an axis shape (3 lines) that represents the X, Y, and Z axes.
     *
     * @param {WebGL2RenderingContext} gl - The WebGL context.
     * @param {[float, float, float]} xColor - The color of the X axis (RGB).
     * @param {[float, float, float]} yColor - The color of the Y axis (RGB).
     * @param {[float, float, float]} zColor - The color of the Z axis (RGB).
     */
    constructor (gl, xColor, yColor, zColor) {
        // Call the parent constructor with a default identity matrix.
        super(gl, new Matrix4());

        // Store the axis colors
        this.xColor = xColor;
        this.yColor = yColor;
        this.zColor = zColor;

        // Half-length of each axis line
        let depth = 20;

        // Vertex coordinates for 3 lines along X, Y, Z axes.
        // Each line is from -depth to +depth for that axis.
        this.vertices = new Float32Array([
            // X axis
            -depth, 0, 0,
             depth, 0, 0,
            // Y axis
            0, -depth, 0,
            0,  depth, 0,
            // Z axis
            0, 0, -depth,
            0, 0,  depth
        ]);

        // Colors for each vertex: X axis uses xColor, Y axis uses yColor, Z axis uses zColor.
        // We have 2 vertices per axis, each with the same color.
        this.colors = new Float32Array([
            // X axis (2 points)
            xColor[0], xColor[1], xColor[2],
            xColor[0], xColor[1], xColor[2],
            // Y axis (2 points)
            yColor[0], yColor[1], yColor[2],
            yColor[0], yColor[1], yColor[2],
            // Z axis (2 points)
            zColor[0], zColor[1], zColor[2],
            zColor[0], zColor[1], zColor[2]
        ]);

        // Indices: we have 6 vertices, forming 3 lines -> (0,1), (2,3), (4,5).
        this.indices = new Uint8Array([
            0, 1,   // X axis
            2, 3,   // Y axis
            4, 5    // Z axis
        ]);

        // Get uniform and attribute locations from the shader.
        this.u_ModelMatrix = this.gl.getUniformLocation(this.gl.program, 'u_ModelMatrix');
        this.a_Color = this.gl.getAttribLocation(this.gl.program, 'a_Color');
        this.a_Position = this.gl.getAttribLocation(this.gl.program, 'a_Position');
    }

    /**
     * Builds the buffers and prepares the data for rendering.
     */
    build () {
        // Create a buffer for the ELEMENT_ARRAY_BUFFER (indices).
        let buffer = this.gl.createBuffer();
        if(!buffer) {
            console.error('Could not create a buffer');
            return null;
        }

        // Bind and fill the ELEMENT_ARRAY_BUFFER with the indices array.
        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, buffer);
        this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, this.indices, this.gl.STATIC_DRAW);

        // Bind the color attributes.
        this._bindAttrib(this.colors, 3, this.gl.FLOAT, this.a_Color);

        // Bind the position attributes.
        this._bindAttrib(this.vertices, 3, this.gl.FLOAT, this.a_Position);

        // Set the model matrix to identity (no transformation).
        this.gl.uniformMatrix4fv(this.u_ModelMatrix, false, (new Matrix4()).elements);

        // Keep track of the last shape rendered (for potential debugging or state).
        Shape.lastShape = this;
    }

    /**
     * Renders the axis lines using the bound buffers.
     */
    draw () {
        // Draw 3 lines using the indices in the element array buffer.
        this.gl.drawElements(this.gl.LINES, this.indices.length, this.gl.UNSIGNED_BYTE, 0);
    }
}
