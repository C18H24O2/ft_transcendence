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
	constructor(gl, programInfo, vertice, color, projectionMatrix, modelViewMatrix)
	{
		/** @type {WebGL2RenderingContext} */
		this.gl = gl;
		this.programInfo = programInfo;
		this.vertexCount = vertice.length;
		this.buffers = initBuffers(gl, vertice, color);
		this.projectionMatrix = projectionMatrix || mat4.create();
		this.modelViewMatrix = modelViewMatrix || mat4.create();
	}
	/**
	 * 
	 * @param {Array | mat4} matricesList 
	 */
	draw(matrix)
	{

		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffers.position);
		this.gl.vertexAttribPointer(this.programInfo.attribLocation.vertexPosition, 2, this.gl.FLOAT, false, 0, 0);
		this.gl.enableVertexAttribArray(this.programInfo.attribLocation.vertexPosition);

		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffers.color);
		this.gl.vertexAttribPointer(this.programInfo.attribLocation.vertexColor, 4, this.gl.FLOAT, false, 0, 0);
		this.gl.enableVertexAttribArray(this.programInfo.attribLocation.vertexColor);

		this.gl.useProgram(this.programInfo.program);
		if (matrix !== undefined)
			this.gl.uniformMatrix4fv(this.programInfo.uniformLocation.mtpMatrix, false, matrix);
		else
		{
			matrix = mat4.create();
			mat4.multiply(matrix, this.projectionMatrix, this.modelViewMatrix);
			this.gl.uniformMatrix4fv(this.programInfo.uniformLocation.mtpMatrix, false, matrix);
		}
		this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, this.vertexCount / 2);
	}
	rotate(radians, axis)
	{
		mat4.rotate(this.modelViewMatrix, this.modelViewMatrix, radians, axis);
	}
	translate(amount)
	{
		mat4.rotate(this.modelViewMatrix, this.modelViewMatrix, amount);
	}
	scale(vector)
	{
		mat4.scale(this.modelViewMatrix, this,this.modelViewMatrix, vector);
	}
}

class Shape3d
{
	/**
	 * 
	 * @param {WebGL2RenderingContext} gl 
	 * @param {ProgramInfo} programInfo 
	 * @param {Array} vertice 
	 * @param {Array} color 
	 */
	constructor(gl, programInfo, vertice, color, indices, projectionMatrix, modelViewMatrix)
	{
		/** @type {WebGL2RenderingContext} */
		this.gl = gl;
		this.programInfo = programInfo;
		this.vertexCount = indices.length;
		this.buffers = initBuffers3d(gl, vertice, color, indices);
		this.projectionMatrix = projectionMatrix || mat4.create();
		this.modelViewMatrix = modelViewMatrix || mat4.create();
	}
	/**
	 * 
	 * @param {mat4} mvpMatrix 
	 */
	draw(matrix)
	{
		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffers.position);
		this.gl.vertexAttribPointer(this.programInfo.attribLocation.vertexPosition, 3, this.gl.FLOAT, false, 0, 0);
		this.gl.enableVertexAttribArray(this.programInfo.attribLocation.vertexPosition);

		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffers.color);
		this.gl.vertexAttribPointer(this.programInfo.attribLocation.vertexColor, 4, this.gl.FLOAT, false, 0, 0);
		this.gl.enableVertexAttribArray(this.programInfo.attribLocation.vertexColor);

		this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.buffers.indices);
		this.gl.useProgram(this.programInfo.program);
		if (matrix !== undefined)
		{
			this.gl.uniformMatrix4fv(this.programInfo.uniformLocation.mtpMatrix, false, matrix);
		}
		else
		{
			matrix = mat4.create();
			mat4.multiply(matrix, this.projectionMatrix, this.modelViewMatrix);
			this.gl.uniformMatrix4fv(this.programInfo.uniformLocation.mtpMatrix, false, matrix);
		}
		this.gl.drawElements(this.gl.TRIANGLES, this.vertexCount, this.gl.UNSIGNED_SHORT, 0);
	}
	rotate(radians, axis)
	{
		mat4.rotate(this.modelViewMatrix, this.modelViewMatrix, radians, axis);
	}
	translate(amount)
	{
		mat4.translate(this.modelViewMatrix, this.modelViewMatrix, amount);
	}
	scale(vector)
	{
		mat4.scale(this.modelViewMatrix, this,this.modelViewMatrix, vector);
	}
}


export { Shape2d };
export { Shape3d };