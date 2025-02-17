class Lighting {

    /**
     * @param {WebGL2RenderingContext} gl
     * @param {Float} x light position
     * @param {Float} y light position
     * @param {Float} z light position
     * @param {Float} dr diffuse color
     * @param {Float} dg diffuse color
     * @param {Float} db diffuse color
     * @param {Float} sr specular color
     * @param {Float} sg specular color
     * @param {Float} sb specular color
     * @param {Float} sn specular power
     * @param {Float} ar ambient color
     * @param {Float} ag ambient color
     * @param {Float} ab ambient color
     */
    constructor (gl, x, y, z, dr, dg, db, sr, sg, sb, sn, ar, ag, ab) {
        this.gl = gl;

        this.u_AmbientLight = this.gl.getUniformLocation(this.gl.program, 'u_AmbientLight');
        this.u_DiffuseColor = this.gl.getUniformLocation(this.gl.program, 'u_DiffuseColor');
        this.u_SpecularColor = this.gl.getUniformLocation(this.gl.program, 'u_SpecularColor');
        this.u_SpecularN = this.gl.getUniformLocation(this.gl.program, 'u_SpecularN');
        this.u_LightPosition = this.gl.getUniformLocation(this.gl.program, 'u_LightPosition');

        this.setPos(x, y, z);
        this.setDiffuseColor(dr, dg, db);
        this.setSpecularColor(sr, sg, sb, sn);
        this.setAmbientColor(ar, ag, ab);

        this.lightSize = 1;
        let mat = (new Matrix4()).translate(this.pos.x, this.pos.y, this.pos.z).scale(this.lightSize, this.lightSize, this.lightSize);
        this.lightCube = new Cube(this.gl, mat, [1.0, 1.0, 1.0, 1], null, null);
    }

    setPos (x, y, z) {
        this.pos = {
            x: x,
            y: y,
            z: z
        };
        this.gl.uniform3f(this.u_LightPosition, x, y, z);
    }

    setDiffuseColor (r, g, b) {
        this.diffuseColor = {
            r: r,
            g: g,
            b: b
        };
        this.gl.uniform3f(this.u_DiffuseColor, r, g, b);
    }

    setSpecularColor (r, g, b, n) {
        this.specularColor = {
            r: r,
            g: g,
            b: b,
            n: n
        };
        this.gl.uniform3f(this.u_SpecularColor, r, g, b);
        this.gl.uniform1f(this.u_SpecularN, n);
    }

    setAmbientColor (r, g, b) {
        this.ambientColor = {
            r: r,
            g: g,
            b: b
        };
        this.gl.uniform3f(this.u_AmbientLight, r, g, b);
    }

    /**
     * It updates the light cube representing the light
     */
    updateLightCube () {
        this.lightCube.matrix = (new Matrix4()).translate(this.pos.x, this.pos.y, this.pos.z).scale(this.lightSize, this.lightSize, this.lightSize);
    }

    /**
     * It renders the light cube representing the light
     */
    renderLightCube () {
        this.lightCube.build();
        this.lightCube.draw();
    }
}