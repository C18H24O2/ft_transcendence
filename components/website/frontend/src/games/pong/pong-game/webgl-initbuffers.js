// @ts-check

/**
 * @typedef {Object} Buffers
 * @property {WebGLBuffer} normal
 * @property {WebGLBuffer} position
 * @property {WebGLBuffer} textureCoord
 * @property {WebGLBuffer} indices
 */

/**
 * @param {WebGLRenderingContext} gl
 * @param {number[]} vertices
 * @param {number[]} indices
 * @returns {Buffers}
 */
function initBuffers3d(gl, vertices, indices) {
    const positionBuffer = createNewPositionBuffer(gl, vertices);
    const textureBuffer = createNewTextureBuffer(gl);
    const indexBuffer = createNewIndexBuffer(gl, indices);
    const normalBuffer = createNewNormalBuffer(gl, calculateVertexNormals(vertices, indices));

    return {
        normal: normalBuffer,
        position: positionBuffer,
        textureCoord: textureBuffer,
        indices: indexBuffer,
    };
}

/**
 * @param {WebGLRenderingContext} gl 
 * @param {Float32Array} normals
 * @returns {WebGLBuffer}
 */
function createNewNormalBuffer(gl, normals) {
    const normalBuffer = gl.createBuffer();

    gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, normals, gl.STATIC_DRAW);

    return normalBuffer;
}

/**
 * @param {number[]} vertices
 * @param {number[]} indices
 * @returns {Float32Array}
 */
function calculateVertexNormals(vertices, indices) {
    const vertexNormals = new Float32Array(vertices.length).fill(0);

    // Step 1: Calculate face normals
    for (let i = 0; i < indices.length; i += 3) {
        const i0 = indices[i] * 3;
        const i1 = indices[i + 1] * 3;
        const i2 = indices[i + 2] * 3;

        // Vectors u and v from vertices
        const u = [
            vertices[i1] - vertices[i0],
            vertices[i1 + 1] - vertices[i0 + 1],
            vertices[i1 + 2] - vertices[i0 + 2],
        ];
        const v = [
            vertices[i2] - vertices[i0],
            vertices[i2 + 1] - vertices[i0 + 1],
            vertices[i2 + 2] - vertices[i0 + 2],
        ];

        // Cross product of u and v to get face normal
        const normal = [
            u[1] * v[2] - u[2] * v[1],
            u[2] * v[0] - u[0] * v[2],
            u[0] * v[1] - u[1] * v[0],
        ];

        // Add this normal to each vertex of the face
        for (let j = 0; j < 3; j++) {
            const idx = indices[i + j] * 3;
            vertexNormals[idx] += normal[0];
            vertexNormals[idx + 1] += normal[1];
            vertexNormals[idx + 2] += normal[2];
        }
    }

    // Step 2: Normalize vertex normals
    for (let i = 0; i < vertexNormals.length; i += 3) {
        const length = Math.sqrt(
            vertexNormals[i] ** 2 +
            vertexNormals[i + 1] ** 2 +
            vertexNormals[i + 2] ** 2
        );
        vertexNormals[i] /= length;
        vertexNormals[i + 1] /= length;
        vertexNormals[i + 2] /= length;
    }

    return vertexNormals;
}

/**
 * @param {WebGLRenderingContext} gl
 * @param {number[]} indices
 * @returns {WebGLBuffer}
 */
function createNewIndexBuffer(gl, indices) {
    const indexBuffer = gl.createBuffer();

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);

    return indexBuffer;
}

/**
 * @param {WebGLRenderingContext} gl
 * @param {number[]} positions
 * @returns {WebGLBuffer}
 */
function createNewPositionBuffer(gl, positions) {
    const positionBuffer = gl.createBuffer();

    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

    return positionBuffer;
}

/**
 * @param {WebGLRenderingContext} gl
 * @returns {WebGLBuffer}
 */
function createNewTextureBuffer(gl) {
    const textureBuffer = gl.createBuffer();


    //We make the texture fit to the size of the face its on
    const textureCoords = [
        // Front
        0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0,
        // Back
        0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0,
        // Top
        0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0,
        // Bottom
        0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0,
        // Right
        0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0,
        // Left
        0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0,
    ];

    gl.bindBuffer(gl.ARRAY_BUFFER, textureBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textureCoords), gl.STATIC_DRAW);

    return textureBuffer;
}

export { initBuffers3d }; 