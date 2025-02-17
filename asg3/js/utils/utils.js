function canvasToWebglCoords(x, y, r, worldX=0.0, worldY=0.0) {
    let c = getElement(CANVAS_ID);

    return [
        ((x - r.left) - c.height/2) / (c.height/2) - worldX,
        (c.width/2 - (y - r.top)) / (c.width/2) - worldY
    ];
}

/**
 * It returns the element with the specified id. It writes an
 * error if the id could not be found.
 *
 * ERROR:
 * It returns null if the element could not be found.
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
 * Returns true if the arrays are the same.
 * @param {Float32Array} source
 * @param {Float32Array} target
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
 * Returns the (x, y, z) coordinates from a 4x4 matrix.
 * @param {Matrix4} matrix
 */
function getPosition(matrix) {
    return [matrix.elements[12], matrix.elements[13], matrix.elements[14]];
}