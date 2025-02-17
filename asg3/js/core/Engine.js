class Engine {

    /**
     * It sets up all the attributes needed. Run init() to
     * initialize and start the engine.
     *
     * @param {string} canvasId - The ID of the HTML canvas element.
     */
    constructor (canvasId) {
        // The vertex shader source code (initially null until loaded).
        this.VSHADER_SOURCE = null;
        // The fragment shader source code (initially null until loaded).
        this.FSHADER_SOURCE = null;
        // The ID of the canvas in the HTML document.
        this.CANVAS_ID = canvasId;
        // Will hold the WebGL2RenderingContext once we have it.
        this.gl = null;
        // Flag indicating if the engine has started.
        this.started = false;
    }

    /**
     * Returns true if the engine is started.
     * NOTE: This method's name is the same as the "started" property,
     *       which can cause a conflict or confusion if used incorrectly.
     */
    started () {
        return this.started;
    }

    /**
     * Initiates the process of starting the engine.
     * - Gets the WebGL context from the canvas.
     * - Loads both fragment and vertex shaders asynchronously.
     * - Once both shader files are loaded, it calls _postInit().
     */
    init () {
        // Retrieve the WebGL context from the canvas element.
        this.gl = getWebGLContext(getElement(this.CANVAS_ID));
        if (!this.gl) {
            console.error('Failed to get the rendering context for WebGL');
            return;
        }

        // Load the fragment shader code from an external file.
        this._loadShaderFile(this.gl, 'shaders/fshader.glsl', this.gl.FRAGMENT_SHADER);
        // Load the vertex shader code from an external file.
        this._loadShaderFile(this.gl, 'shaders/vshader.glsl', this.gl.VERTEX_SHADER);

        // NOTE: _postInit will be called automatically once both shaders are loaded,
        //       because shader loading is asynchronous.
    }

    /**
     * Called when:
     *  - The canvas is ready.
     *  - The WebGL context is ready.
     *  - Both vertex and fragment shaders' source code have been loaded.
     *
     * @param {WebGL2RenderingContext} gl - The WebGL2 context.
     */
    async _postInit(gl) {
        // Initialize shaders using the loaded shader source code.
        if (!initShaders(gl, this.VSHADER_SOURCE, this.FSHADER_SOURCE)) {
            console.error('Failed to initialize shaders:');
            console.error("Vertex shader code:", this.VSHADER_SOURCE);
            console.error("Fragment shader code:", this.FSHADER_SOURCE);
            return;
        }

        // Enable depth testing (so nearer objects hide farther ones).
        gl.enable(gl.DEPTH_TEST);

        // Use the texture unit 0 as the active texture.
        gl.activeTexture(this.gl.TEXTURE0);

        // Enable alpha blending for transparency.
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

        // Enable face culling, and specify that we do not render back faces.
        gl.enable(gl.CULL_FACE);
        gl.cullFace(gl.BACK);

        // Keyboard events setup.
        let kb = new Keyboard();
        kb.registerEvents(this.CANVAS_ID);

        // Mouse events setup.
        let m = new Mouse();
        m.registerEvents(this.CANVAS_ID);

        // Texture loading: provide a list of texture names to load.
        let tm = new TextureManager([
            'stone', 'stonebrick', 'hardened_clay_stained_white',
            'hardened_clay_stained_black', 'leaves_big_oak', 'planks_oak',
            'door_wood_lower', 'door_wood_upper', 'glass_black', 'grass',
            'house', 'SkySmackdown', 'SkySmackdown_night'
        ]);
        // Asynchronously load textures.
        await tm.loadTextures(gl);

        // Retrieve the canvas element to get its dimensions.
        let canvas = getElement(this.CANVAS_ID);
        // Create a new World instance with the WebGL context, mouse, keyboard, textures, and canvas dimensions.
        let world = new World(gl, m, kb, tm, canvas.width, canvas.height);

        // HTML-based events (like UI controls).
        let htmlEvents = new HtmlEvents(world);
        htmlEvents.registerEvents();

        // Creates the world (loads objects, etc.).
        world.create();

        // Once everything is set up, mark the engine as started.
        this.started = true;
    }

    // Loading functions //

    /**
     * Loads a shader file from a given path (asynchronously).
     * This function will be called twice: once for the vertex shader,
     * and once for the fragment shader.
     *
     * @param {WebGL2RenderingContext} gl - WebGL context
     * @param {String} path - Shader path (e.g. 'shaders/fshader.glsl')
     * @param {Number} shader - The WebGL shader type (gl.VERTEX_SHADER or gl.FRAGMENT_SHADER)
     */
    _loadShaderFile(gl, path, shader) {
        // Using async/await to fetch the file contents
        (async() => {
            try {
                let response = await fetch(path);
                let code = await response.text();
                // Once the code is fetched, handle the loaded code.
                this._onLoadShader(gl, code, shader);
            } catch (e) {
                console.error(e);
            }
        })();
    }

    /**
     * Assigns the loaded shader code to the correct variable (vertex or fragment),
     * then checks if both shaders are loaded. If yes, calls _postInit().
     *
     * @param {WebGL2RenderingContext} gl - The WebGL context
     * @param {String} code - The loaded shader code
     * @param {Number} shader - The WebGL shader type (gl.VERTEX_SHADER or gl.FRAGMENT_SHADER)
     */
    _onLoadShader(gl, code, shader) {
        // Store the loaded source code in the appropriate variable.
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

        // If both vertex and fragment shaders are loaded, proceed.
        if(this._shadersLoaded()) {
            this._postInit(gl);
        }
    }

    /**
     * Checks if both shader sources (vertex & fragment) are non-null.
     * @returns {Boolean} True if both shaders have been loaded; false otherwise.
     */
    _shadersLoaded() {
        return this.VSHADER_SOURCE !== null && this.FSHADER_SOURCE !== null;
    }
}
