class Sphere extends Shape {

    /**
     * Creates a sphere by generating a set of vertices, normals, indices,
     * and colors for a subdivided sphere approximation.
     *
     * @param {WebGL2RenderingContext} gl - The WebGL rendering context.
     * @param {Matrix4} matrix - The transformation matrix for this sphere.
     * @param {[number, number, number, number]} color - RGBA color array (e.g., [1, 0, 0, 1] for red).
     */
    constructor(gl, matrix, color) {
        // Invoke the parent constructor with the given context and transformation matrix.
        super(gl, matrix);

        // 'pitch' determines how many segments the sphere is divided into (both in latitude and longitude).
        // Larger pitch = smoother sphere approximation.
        let pitch = 10;

        // Prepare arrays to store the vertex positions and normals.
        this.normals = [];
        this.vertices = [];

        // Generate vertices (position + normal) by sampling angles in spherical coordinates.
        for (let j = 0; j <= pitch; j++) {
            // aj is the polar angle from the "top" (0) to "bottom" (π).
            let aj = j * Math.PI / pitch;
            let sj = Math.sin(aj);
            let cj = Math.cos(aj);

            for (let i = 0; i <= pitch; i++) {
                // ai is the azimuth angle around the Y-axis (0 to 2π).
                let ai = i * 2 * Math.PI / pitch;
                let si = Math.sin(ai);
                let ci = Math.cos(ai);

                // Compute Cartesian coordinates (x, y, z) on the sphere.
                let x = si * sj;
                let y = cj;
                let z = ci * sj;

                // Push the vertex position.
                this.vertices.push(x, y, z);

                // Push the normal vector for lighting. Here, for a unit sphere at origin,
                // the normal is just the position vector (x, y, z).
                this.normals.push(x, y, z);
            }
        }

        // Convert to typed arrays.
        this.vertices = new Float32Array(this.vertices);
        this.normals = new Float32Array(this.normals);

        // Generate the index array, connecting vertices into triangles.
        // Each small "tile" is composed of two triangles.
        this.indices = [];
        for (let j = 0; j < pitch; j++) {
            for (let i = 0; i < pitch; i++) {
                // p1 and p2 identify two adjacent rows of vertices.
                let p1 = j * (pitch + 1) + i;
                let p2 = p1 + (pitch + 1);

                // Define two triangles: (p1, p2, p1+1) and (p1+1, p2, p2+1)
                this.indices.push(p1, p2, p1 + 1);
                this.indices.push(p1 + 1, p2, p2 + 1);
            }
        }
        this.indices = new Uint8Array(this.indices);

        // Build a color array, assigning the same RGBA for all vertices.
        this.colors = [];
        for (let j = 0; j <= pitch; j++) {
            for (let i = 0; i <= pitch; i++) {
                this.colors.push(color[0], color[1], color[2], color[3]);
            }
        }
        this.colors = new Float32Array(this.colors);
    }

    /**
     * Builds or updates the GPU buffers (indices, normals, vertices, colors, etc.).
     * Attempts to minimize re-binds if multiple spheres are drawn consecutively.
     *
     * @returns {Sphere} The current instance, for optional chaining.
     */
    build() {
        let updateColor = false;
        let updateMatrix = false;

        // If the last drawn shape was not a Sphere, we must bind everything.
        if (Shape.lastShape === null || !(Shape.lastShape instanceof Sphere)) {
            updateMatrix = true;
            updateColor = true;

            // Create a new buffer for the index data and bind it to ELEMENT_ARRAY_BUFFER.
            let indexBuffer = this.gl.createBuffer();
            this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
            this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, this.indices, this.gl.STATIC_DRAW);

            // Bind the normals.
            this._bindAttrib(this.normals, 3, this.gl.FLOAT, this.a_Normal);

            // Bind the vertex positions.
            this._bindAttrib(this.vertices, 3, this.gl.FLOAT, this.a_Position);
        } else {
            // Otherwise, only re-bind color or matrix if changed.
            updateColor = (this.colors !== null) && !float32Equals(Shape.lastShape.colors, this.colors);
            updateMatrix = (Shape.lastShape.matrix !== this.matrix);
        }

        // If colors changed or this is the first sphere, re-bind color data.
        if (updateColor) {
            this._bindAttrib(this.colors, 4, this.gl.FLOAT, this.a_Color);
        }

        // If the matrix changed (or we haven't set it yet), update the uniform.
        if (updateMatrix) {
            this.gl.uniformMatrix4fv(this.u_ModelMatrix, false, this.matrix.elements);
        }

        // Mark this shape as the last used to optimize subsequent draws.
        Shape.lastShape = this;

        return this;
    }

    /**
     * Renders the sphere using the GPU buffers bound in build().
     */
    draw() {
        // Use the index array to draw all the triangles.
        this.gl.drawElements(this.gl.TRIANGLES, this.indices.length, this.gl.UNSIGNED_BYTE, 0);
    }
}
