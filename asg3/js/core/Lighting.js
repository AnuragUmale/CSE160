class Lighting {

    /**
     * Creates a Lighting instance for configuring and sending
     * light properties (position, colors, etc.) to the GPU.
     *
     * @param {WebGL2RenderingContext} gl - WebGL context.
     * @param {Float} x - Light position in X.
     * @param {Float} y - Light position in Y.
     * @param {Float} z - Light position in Z.
     * @param {Float} dr - Diffuse color red component.
     * @param {Float} dg - Diffuse color green component.
     * @param {Float} db - Diffuse color blue component.
     * @param {Float} sr - Specular color red component.
     * @param {Float} sg - Specular color green component.
     * @param {Float} sb - Specular color blue component.
     * @param {Float} sn - Specular exponent (shininess).
     * @param {Float} ar - Ambient color red component.
     * @param {Float} ag - Ambient color green component.
     * @param {Float} ab - Ambient color blue component.
     */
    constructor (gl, x, y, z, dr, dg, db, sr, sg, sb, sn, ar, ag, ab) {
        // Store the WebGL context
        this.gl = gl;

        // Get uniform locations from the currently active shader program
        // These are the variables in your shaders for light properties.
        this.u_AmbientLight = this.gl.getUniformLocation(this.gl.program, 'u_AmbientLight');
        this.u_DiffuseColor = this.gl.getUniformLocation(this.gl.program, 'u_DiffuseColor');
        this.u_SpecularColor = this.gl.getUniformLocation(this.gl.program, 'u_SpecularColor');
        this.u_SpecularN = this.gl.getUniformLocation(this.gl.program, 'u_SpecularN');
        this.u_LightPosition = this.gl.getUniformLocation(this.gl.program, 'u_LightPosition');

        // Initialize the light’s position, diffuse color, specular color, and ambient color.
        this.setPos(x, y, z);
        this.setDiffuseColor(dr, dg, db);
        this.setSpecularColor(sr, sg, sb, sn);
        this.setAmbientColor(ar, ag, ab);

        // Create a small cube to visualize the light’s position in the scene.
        this.lightSize = 1;
        let mat = (new Matrix4())
            .translate(this.pos.x, this.pos.y, this.pos.z)
            .scale(this.lightSize, this.lightSize, this.lightSize);

        // Build the cube with a white color (RGBA = [1.0, 1.0, 1.0, 1]).
        // The last two parameters for Cube could be texture and normals (null here).
        this.lightCube = new Cube(this.gl, mat, [1.0, 1.0, 1.0, 1], null, null);
    }

    /**
     * Sets the light position (also updates the uniform in the shader).
     * @param {Float} x - New X position.
     * @param {Float} y - New Y position.
     * @param {Float} z - New Z position.
     */
    setPos (x, y, z) {
        this.pos = { x: x, y: y, z: z };
        this.gl.uniform3f(this.u_LightPosition, x, y, z);
    }

    /**
     * Sets the diffuse light color (and updates the shader).
     * @param {Float} r - Red component (0 to 1).
     * @param {Float} g - Green component (0 to 1).
     * @param {Float} b - Blue component (0 to 1).
     */
    setDiffuseColor (r, g, b) {
        this.diffuseColor = { r: r, g: g, b: b };
        this.gl.uniform3f(this.u_DiffuseColor, r, g, b);
    }

    /**
     * Sets the specular light color and exponent (shininess) in the shader.
     * @param {Float} r - Red component (0 to 1).
     * @param {Float} g - Green component (0 to 1).
     * @param {Float} b - Blue component (0 to 1).
     * @param {Float} n - Specular exponent (1 to 128+).
     */
    setSpecularColor (r, g, b, n) {
        this.specularColor = { r: r, g: g, b: b, n: n };
        this.gl.uniform3f(this.u_SpecularColor, r, g, b);
        this.gl.uniform1f(this.u_SpecularN, n);
    }

    /**
     * Sets the ambient light color (and updates the shader).
     * @param {Float} r - Red component (0 to 1).
     * @param {Float} g - Green component (0 to 1).
     * @param {Float} b - Blue component (0 to 1).
     */
    setAmbientColor (r, g, b) {
        this.ambientColor = { r: r, g: g, b: b };
        this.gl.uniform3f(this.u_AmbientLight, r, g, b);
    }

    /**
     * Updates the transformation matrix for the light's cube,
     * so it follows the light position and scale.
     */
    updateLightCube () {
        this.lightCube.matrix = (new Matrix4())
            .translate(this.pos.x, this.pos.y, this.pos.z)
            .scale(this.lightSize, this.lightSize, this.lightSize);
    }

    /**
     * Renders (draws) the small cube that represents the light in the scene.
     */
    renderLightCube () {
        // Build the geometry based on the latest matrix.
        this.lightCube.build();
        // Draw the cube onto the scene.
        this.lightCube.draw();
    }
}
