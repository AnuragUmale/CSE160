class Engine {

    /**
     * It sets up all the attributes needed. Run init() to
     * init and start the engine.
     *
     * @param {string} canvasId the canvas' id
     */
    constructor (canvasId) {
        this.VSHADER_SOURCE = null;
        this.FSHADER_SOURCE = null;
        this.CANVAS_ID = canvasId;
        this.gl = null;
        this.started = false;
    }

    /**
     * Returns true if the engine is started.
     */
    started () {
        return this.started;
    }

    /**
     * It starts the engine that will initialize everything.
     * It is asynchronous, so you need to make sure that the
     * engine is started before doing anything - check started().
     *
     * dev: It will call _postInit once done.
     */
    init () {
        this.gl = getWebGLContext(getElement(this.CANVAS_ID));
        if (!this.gl) {
            console.error('Failed to get the rendering context for WebGL');
            return;
        }

        this._loadShaderFile(this.gl, 'shaders/fshader.glsl', this.gl.FRAGMENT_SHADER);
        this._loadShaderFile(this.gl, 'shaders/vshader.glsl', this.gl.VERTEX_SHADER);

        // It will automatically call _postInit once that the shaders' files are loaded
        // -> Because file loading is asynchronous
    }

    /**
     * Called when:
     * - The canvas is ready
     * - The WebGL context is ready
     * - The shaders' source code is loaded
     *
     * @param {WebGL2RenderingContext} gl WebGL Context
     */
    async _postInit(gl) {
        if (!initShaders(gl, this.VSHADER_SOURCE, this.FSHADER_SOURCE)) {
            console.error('Failed to initialize shaders:');
            console.error("Vertex shader code:", this.VSHADER_SOURCE);
            console.error("Fragment shader code:", this.FSHADER_SOURCE);
            return;
        }

        // To prevent rendering shapes that are behind over the other ones
        gl.enable(gl.DEPTH_TEST);

        // To use texture0
        gl.activeTexture(this.gl.TEXTURE0);

        // Transparency
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

        // Only the front fact should be rendered
        gl.enable(gl.CULL_FACE);
        gl.cullFace(gl.BACK);

        // Events - Keyboard
        let kb = new Keyboard();
        kb.registerEvents(this.CANVAS_ID);
        // Events - Mouse
        let m = new Mouse();
        m.registerEvents(this.CANVAS_ID);

        // Textures
        let tm = new TextureManager(
            [
                'stone', 'stonebrick', 'hardened_clay_stained_white',
                'hardened_clay_stained_black', 'leaves_big_oak', 'planks_oak',
                'door_wood_lower', 'door_wood_upper', 'glass_black', 'grass', 'house', 'SkySmackdown',
                'SkySmackdown_night'
            ]
        );
        await tm.loadTextures(gl);

        // World
        let canvas = getElement(this.CANVAS_ID);
        let world = new World(gl, m, kb, tm, canvas.width, canvas.height);

        // Events - User ipout (HTML)
        let htmlEvents = new HtmlEvents(world);
        htmlEvents.registerEvents();

        // THERE WE GOOOO
        world.create();

        this.started = true;
    }

    // Loading functions //

    /**
     * Function inspired from "WebGL Programming Guide: Interactive 3D Graphics
     * Programming with WebGL", 1st ed. written by Kouichi Matsudi and Rodger Lea
     * and published by WOW!.
     *
     * It loads a shader's source code. It must be called two times with the
     * vertex shader source code and the fragment shader source code.
     *
     * @param {WebGL2RenderingContext} gl WebGL context
     * @param {String} path shader path (../../../filename.extension)
     * @param {Shader} shader kind of shader (gl.VERTEX_SHADER or gl.FRAGMENT_SHADER)
     */
    _loadShaderFile(gl, path, shader) {
        // ES7 async code
        (async() => {
            try {
                let response = await fetch(path);
                let code = await response.text();
                this._onLoadShader(gl, code, shader);
            } catch (e) {
                console.error(e);
            }
        })();
    }

    /**
     * Function inspired from "WebGL Programming Guide: Interactive 3D Graphics
     * Programming with WebGL", 1st ed. written by Kouichi Matsudi and Rodger Lea
     * and published by WOW!.
     *
     * It puts the shader's source code in the right variable. Then, if both of the
     * shaders' codes are loaded, it calls postInit().
     *
     * ERRORS:
     * - If the shader type is unknown, a message will be sent to the console displaying
     *      the wrong shader.
     * - If one of the shader's code is null, the code may stop here. In this case, there
     *      should be an other error message coming from an other function.
     *
     * @param {WebGL2RenderingContext} gl WebGL context
     * @param {String} code the shader's code
     * @param {Shader} type kind of shader (gl.VERTEX_SHADER or gl.FRAGMENT_SHADER)
     */
    _onLoadShader(gl, code, shader) {
        switch (shader) {
            case gl.VERTEX_SHADER:
                this.VSHADER_SOURCE = code;
                break;
            case gl.FRAGMENT_SHADER:
                this.FSHADER_SOURCE = code;
                break;
            default:
                console.error("Unknown shader type", shader);
                break;
        }

        if(this._shadersLoaded()) {
            this._postInit(gl);
        }
    }

    /**
     * Returns true if the shaders' source codes were loaded.
     * Sources:
     * - VSHADER_SOURCE,
     * - FSHADER_SOURCE
     */
    _shadersLoaded() {
        return this.VSHADER_SOURCE !== null && this.FSHADER_SOURCE !== null;
    }
}