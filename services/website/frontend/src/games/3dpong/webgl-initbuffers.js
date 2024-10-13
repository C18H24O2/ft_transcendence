function initBuffers(gl, vertices, colors)
{
	const positionBuffer = createNewPositionBuffer(gl, vertices);
	const colorBuffer = createNewColorBuffer(gl, colors);

	const buffers = {
		position: positionBuffer,
		color: colorBuffer,
	};
	return buffers;
}

function initBuffers3d(gl, vertices, colors, indices)
{
	const positionBuffer = createNewPositionBuffer(gl, vertices);
	const colorBuffer = createNewColorBuffer(gl, colors);
	const indexBuffer = createNewIndexBuffer(gl, indices);

	const buffers = {
		position: positionBuffer,
		color: colorBuffer,
		indices: indexBuffer,
	};
	return buffers;
}

/**
 * 
 * @param {WebGL2RenderingContext} gl
 * @param {Float64Array | Float32Array} positions
 * @returns {WebGLBuffer}
 */

function createNewIndexBuffer(gl, indices)
{
	const indexBuffer = gl.createBuffer();

	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);

	return indexBuffer;
}

/**
 * 
 * @param {WebGL2RenderingContext} gl
 * @param {Float64Array | Float32Array} positions
 * @returns {WebGLBuffer}
 */

function createNewPositionBuffer(gl, positions)
{
	const positionBuffer = gl.createBuffer();

	gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

	return positionBuffer;
}

/**
 * 
 * @param {WebGL2RenderingContext} gl
 * @param {Float64Array | Float32Array} colors
 * @returns {WebGLBuffer}
 */
function createNewColorBuffer(gl, colors)
{
	const colorBuffer = gl.createBuffer();

	gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);

	return colorBuffer;
}

export { initBuffers };
export { initBuffers3d }; 