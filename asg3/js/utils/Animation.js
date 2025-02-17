/**
 * Converts mouse or screen coordinates (x, y) to normalized WebGL coordinates
 * (i.e., -1 to +1 range). Includes offsets for a "world" position shift if desired.
 *
 * @param {number} x - The X coordinate (e.g., mouse X in client space).
 * @param {number} y - The Y coordinate (e.g., mouse Y in client space).
 * @param {DOMRect} r - A bounding rectangle object (e.g., from getBoundingClientRect).
 * @param {number} worldX - Optional offset to shift in the X direction.
 * @param {number} worldY - Optional offset to shift in the Y direction.
 * @returns {[number, number]} An array with [webglX, webglY] in normalized device coordinates.
 */
function canvasToWebglCoords(x, y, r, worldX=0.0, worldY=0.0) {
    // Grab the canvas element (assuming a global CANVAS_ID).
    let c = getElement(CANVAS_ID);

    // Convert from client/canvas pixel coordinates to the WebGL range of -1..+1,
    // then apply the optional worldX/Y offsets.
    return [
        ((x - r.left) - c.height/2) / (c.height/2) - worldX,
        (c.width/2 - (y - r.top)) / (c.width/2) - worldY
    ];
}

/**
 * Retrieves an element by its ID. If the element is not found, logs an error.
 *
 * @param {string} id - The ID of the element to find (e.g., a canvas ID).
 * @returns {HTMLElement | null} The DOM element if found, otherwise null.
 */
function getElement(id) {
    let elem = document.getElementById(id);
    if (!elem) {
        console.error('Could not find canvas with id "' + id + '"');
        return null;
    }
    return elem;
}

/**
 * Checks if two Float32Array objects have the same length and identical values.
 *
 * @param {Float32Array} source - The first array to compare.
 * @param {Float32Array} target - The second array to compare.
 * @returns {boolean} True if they are the same length and contain the same values, else false.
 */
function float32Equals(source, target) {
    if (source === undefined || target === undefined) return false;
    if (source === null || target === null) return false;
    if (source.length !== target.length) return false;
    for (let i = 0; i < source.length; i++) {
        if (source[i] !== target[i]) return false;
    }
    return true;
}

/**
 * Returns the translation/position part [x, y, z] of a 4x4 transform matrix.
 *
 * @param {Matrix4} matrix - A 4x4 transform matrix (e.g., from cuon-matrix.js).
 * @returns {[number, number, number]} The X, Y, and Z components extracted from the matrix.
 */
function getPosition(matrix) {
    // In a typical column-major 4x4 matrix,
    // indices 12, 13, 14 represent translation in X, Y, Z.
    return [
        matrix.elements[12],
        matrix.elements[13],
        matrix.elements[14]
    ];
}
