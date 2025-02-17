/**
 *
 * Description:
 *  This class represents a 3D axis.
 */

class Axis extends Shape {

    /**
     * @param {WebGL2RenderingContext} gl
     * @param {[float, float, float]} xColor color of the X axis
     * @param {[float, float, float]} yColor color of the Y axis
     * @param {[float, float, float]} zColor color of the Z axis
     */
    constructor (gl, xColor, yColor, zColor) {
        super(gl, new Matrix4());

        this.xColor = xColor;
        this.yColor = yColor;
        this.zColor = zColor;

        let depth = 20;

        this.vertices = new Float32Array([
            -depth, 0, 0,  depth, 0, 0,
            0, -depth, 0,  0, depth, 0,
            0, 0, -depth,  0, 0, depth
        ]);

        this.colors = new Float32Array([
            xColor[0], xColor[1], xColor[2], xColor[0], xColor[1], xColor[2],
            yColor[0], yColor[1], yColor[2], yColor[0], yColor[1], yColor[2],
            zColor[0], zColor[1], zColor[2], zColor[0], zColor[1], zColor[2]
        ]);

        this.indices = new Uint8Array([
            0, 1, 2, 3, 4, 5
        ]);

        this.u_ModelMatrix = this.gl.getUniformLocation(this.gl.program, 'u_ModelMatrix');
        this.a_Color = this.gl.getAttribLocation(this.gl.program, 'a_Color');
        this.a_Position = this.gl.getAttribLocation(this.gl.program, 'a_Position');
    }

    build () {
        let buffer = this.gl.createBuffer();
        if(!buffer) {
            console.error('Could not create a buffer');
            return null;
        }

        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, buffer);
        this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, this.indices, this.gl.STATIC_DRAW);

        this._bindAttrib(this.colors, 3, this.gl.FLOAT, this.a_Color);
        this._bindAttrib(this.vertices, 3, this.gl.FLOAT, this.a_Position);
        this.gl.uniformMatrix4fv(this.u_ModelMatrix, false, (new Matrix4()).elements);

        Shape.lastShape = this;
    }

    draw () {
        this.gl.drawElements(this.gl.LINES, this.indices.length, this.gl.UNSIGNED_BYTE, 0);
    }
}