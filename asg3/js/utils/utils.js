/**
 * Converts canvas (client) coordinates (x, y) to normalized WebGL coordinates (-1..1 range).
 * Optionally offsets them by worldX and worldY, if you want to shift the reference point.
 * 
 * @param {number} x - The X coordinate in client/canvas space.
 * @param {number} y - The Y coordinate in client/canvas space.
 * @param {DOMRect} r - The bounding rectangle of the canvas (from getBoundingClientRect()).
 * @param {number} [worldX=0.0] - Optional offset along the X axis in world space.
 * @param {number} [worldY=0.0] - Optional offset along the Y axis in world space.
 * @returns {[number, number]} Normalized WebGL coordinates [webglX, webglY].
 */
function canvasToWebglCoords(x, y, r, worldX=0.0, worldY=0.0) {
    // Obtain the canvas element from a global ID.
    let c = getElement(CANVAS_ID);

    // Convert from pixel coordinates to WebGL's -1..+1 range, and then apply any world offsets.
    return [
        ((x - r.left) - c.height / 2) / (c.height / 2) - worldX,
        (c.width / 2 - (y - r.top)) / (c.width / 2) - worldY
    ];
}

/**
 * Retrieves a DOM element by its ID. Logs an error if not found, returning null.
 *
 * @param {string} id - The HTML element's ID.
 * @returns {HTMLElement|null} The requested element, or null if not found.
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
 * Compares two Float32Array objects to check if they have the same length and identical values.
 *
 * @param {Float32Array} source - The first array to compare.
 * @param {Float32Array} target - The second array to compare.
 * @returns {boolean} True if both arrays match in length and all elements are equal; false otherwise.
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
 * Extracts the translation (x, y, z) component from a 4x4 matrix (in column-major order).
 * Typically used with cuon-matrix.js's Matrix4 type.
 *
 * @param {Matrix4} matrix - The 4x4 transform matrix.
 * @returns {[number, number, number]} An array containing the X, Y, Z translation components.
 */
function getPosition(matrix) {
    // Indices 12, 13, and 14 in the matrix elements correspond to translation in X, Y, Z.
    return [
        matrix.elements[12],
        matrix.elements[13],
        matrix.elements[14]
    ];
}
