import { mat4 } from 'gl-matrix'
import { initBuffers } from './webgl-initbuffers';
import { initBuffers3d } from './webgl-initbuffers';


class Shape2d
{
	/**
	 * 
	 * @param {WebGL2RenderingContext} gl 
	 * @param {ProgramInfo} programInfo 
	 * @param {Array} vertice 
	 * @param {Array} color 
	 */
	constructor(gl, programInfo, vertice, color)
	{
		/** @type {WebGL2RenderingContext} */
		this.gl = gl;
		this.programInfo = programInfo;
		this.vertexCount = vertice.length;
		this.buffers = initBuffers(gl, vertice, color);
	}
	/**
	 * 
	 * @param {Array | mat4} matricesList 
	 */
	draw(matricesList)
	{
		this.gl.clearDepth(1.0); // Clear everything
		this.gl.enable(this.gl.DEPTH_TEST); // Enable depth testing
		this.gl.depthFunc(this.gl.LEQUAL); // Near things obscure far things

		this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

		let mvpMatrix = mat4.create();

		matricesList.forEach(matrix =>{
			mat4.multiply(mvpMatrix, mvpMatrix, matrix);
		});


		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffers.position);
		this.gl.vertexAttribPointer(this.programInfo.attribLocation.vertexPosition, 2, this.gl.FLOAT, false, 0, 0);
		this.gl.enableVertexAttribArray(this.programInfo.attribLocation.vertexPosition);

		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffers.color);
		this.gl.vertexAttribPointer(this.programInfo.attribLocation.vertexColor, 4, this.gl.FLOAT, false, 0, 0);
		this.gl.enableVertexAttribArray(this.programInfo.attribLocation.vertexColor);

		this.gl.useProgram(this.programInfo.program);

		this.gl.uniformMatrix4fv(this.programInfo.uniformLocation.mtpMatrix, false, mvpMatrix);
		this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, this.vertexCount / 2);
	}
}

const checkGLError = (gl) => {
    const error = gl.getError();
    if (error !== gl.NO_ERROR) {
        console.error('WebGL Error:', error);
    }
};

class Shape3d
{
	/**
	 * 
	 * @param {WebGL2RenderingContext} gl 
	 * @param {ProgramInfo} programInfo 
	 * @param {Array} vertice 
	 * @param {Array} color 
	 */
	constructor(gl, programInfo, vertice, color, indices)
	{
		/** @type {WebGL2RenderingContext} */
		this.gl = gl;
		this.programInfo = programInfo;
		this.vertexCount = indices.length;
		this.buffers = initBuffers3d(gl, vertice, color, indices);
	}
	/**
	 * 
	 * @param {mat4} mvpMatrix 
	 */
	draw(matrix)
	{
		this.gl.clearDepth(1.0); // Clear everything
		this.gl.enable(this.gl.DEPTH_TEST); // Enable depth testing
		this.gl.depthFunc(this.gl.LEQUAL); // Near things obscure far things

		this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffers.position);
		this.gl.vertexAttribPointer(this.programInfo.attribLocation.vertexPosition, 3, this.gl.FLOAT, false, 0, 0);
		this.gl.enableVertexAttribArray(this.programInfo.attribLocation.vertexPosition);

		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffers.color);
		this.gl.vertexAttribPointer(this.programInfo.attribLocation.vertexColor, 4, this.gl.FLOAT, false, 0, 0);
		this.gl.enableVertexAttribArray(this.programInfo.attribLocation.vertexColor);

		this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.buffers.indices);
		this.gl.useProgram(this.programInfo.program);
		this.gl.uniformMatrix4fv(this.programInfo.uniformLocation.mtpMatrix, false, matrix);
		this.gl.drawElements(this.gl.TRIANGLES, this.vertexCount, this.gl.UNSIGNED_SHORT, 0);
	}
}


export { Shape2d };
export { Shape3d };