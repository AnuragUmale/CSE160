class Sphere extends Shape {

    constructor(gl, matrix, color) {
        super(gl, matrix);

        let pitch = 10;

        // Vertices
        this.normals = [];
        this.vertices = [];
        for (let j = 0; j <= pitch; j ++) {
            let aj = j * Math.PI / pitch;
            let sj = Math.sin(aj);
            let cj = Math.cos(aj);

            for (let i = 0; i <= pitch; i ++) {
                let ai = i * 2 * Math.PI / pitch;
                let si = Math.sin(ai);
                let ci = Math.cos(ai);

                let x = si * sj;
                let y = cj;
                let z = ci * sj;

                this.vertices.push(x);
                this.vertices.push(y);
                this.vertices.push(z);

                // The normal is the vector between the vertex and the
                // center of the sphere. Since the sphere is set at 0,0,0,
                // it is x-0, y-0 & z-0.
                this.normals.push(x);
                this.normals.push(y);
                this.normals.push(z);
            }
        }
        this.vertices = new Float32Array(this.vertices);
        this.normals = new Float32Array(this.normals);

        // Indices
        this.indices = [];
        for (let j = 0; j < pitch; j ++) {
            for (let i = 0; i < pitch; i ++) {
                let p1 = j * (pitch+1) + i;
                let p2 = p1 + (pitch+1);

                this.indices.push(p1);
                this.indices.push(p2);
                this.indices.push(p1 + 1);

                this.indices.push(p1 + 1);
                this.indices.push(p2);
                this.indices.push(p2 + 1);
            }
        }
        this.indices = new Uint8Array(this.indices);

        // Color
        this.colors = [];
        for (let j = 0; j <= pitch; j ++) {
            for (let i = 0; i <= pitch; i ++) {
                this.colors.push(color[0]);
                this.colors.push(color[1]);
                this.colors.push(color[2]);
                this.colors.push(color[3]);
            }
        }
        this.colors = new Float32Array(this.colors);
    }

    build () {
        let updateColor = false;
        let updateMatrix = false;

        if (Shape.lastShape === null || !(Shape.lastShape instanceof Sphere)) {
            updateMatrix = true;
            updateColor = true;

            // The last shape is not a sphere, so we need to update the index buffer
            let indexBuffer = this.gl.createBuffer();
            this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
            this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, this.indices, this.gl.STATIC_DRAW);

            // Normals are the same for each sphere
            this._bindAttrib(this.normals, 3, this.gl.FLOAT, this.a_Normal);

            // All the sphere have the same vertices
            this._bindAttrib(this.vertices, 3, this.gl.FLOAT, this.a_Position);
        } else {
            updateColor = this.colors === null ? false : !float32Equals(Shape.lastShape.colors, this.colors);
            updateMatrix = Shape.lastShape.matrix !== this.matrix;
        }

        if (updateColor) {
            // Color
            this._bindAttrib(this.colors, 4, this.gl.FLOAT, this.a_Color);
        }

        if (updateMatrix) {
            this.gl.uniformMatrix4fv(this.u_ModelMatrix, false, this.matrix.elements);
        }

        Shape.lastShape = this;

        return this;
    }

    draw () {
        this.gl.drawElements(this.gl.TRIANGLES, this.indices.length, this.gl.UNSIGNED_BYTE, 0);
    }
}