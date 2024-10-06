import { mat4 } from 'gl-matrix'

class Shape2d
{
	/**
	 * 
	 * @param {WebGLRenderingContext} gl 
	 * @param {ProgramInfo} programInfo 
	 * @param {Array} vertice 
	 * @param {Array} color 
	 */
	constructor(gl, programInfo, vertice, color)
	{
		/** @type {WebGLRenderingContext} */
		this.gl = gl;
		this.programInfo = programInfo;
		this.vertexCount = vertice.length();
		this.buffers = initBuffers(vertice, color);
	}
	/**
	 * 
	 * @param {Array | mat4} matricesList 
	 */
	draw(matricesList)
	{
		let mvpMatrix = mat4.create();

		matricesList.forEach(matrix =>{
			mat4.multiply(mvpMatrix, mvpMatrix, matrix);
		});

		this.gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers.position);
		this.gl.vertexAttribPointer(this.programInfo.attribLocation.vertexPosition, 2, this.gl.FLOAT, false, 0, 0);
		this.gl.enableVertexAttribArray(this.programInfo.attribLocation.vertexPosition);

		this.gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers.color);
		this.gl.vertexAttribPointer(this.programInfo.attribLocation.vertexColor, 4, this.gl.FLOAT, false, 0, 0);
		this.gl.enableVertexAttribArray(this.programInfo.attribLocation.vertexColor);

		this.gl.useProgram(this.programInfo.program);

		this.gl.uniformMatrix4fv(this.programInfo.uniformLocation.mtpMatrix);
		this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, this.vertexCount);
	}
}

class Shape3d
{

}
