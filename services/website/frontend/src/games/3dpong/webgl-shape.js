import { mat4 } from 'gl-matrix'
import { initBuffers3d } from './webgl-initbuffers';
import { getCatppuccinRGB } from './colorUtils';

class Shape3d
{
	/**
	 * 
	 * @param {WebGL2RenderingContext} gl 
	 * @param {ProgramInfo} programInfo 
	 * @param {Array} vertice 
	 * @param {Array} color 
	 */
	constructor(gl, programInfo, modelViewMatrix, vertice, indices, texture, colorName)
	{
		/** @type {WebGL2RenderingContext} */
		this.gl = gl;
		this.programInfo = programInfo;
		this.vertexCount = indices.length;
		this.texture = texture;
		this.colorName = colorName || "blue";
		this.buffers = initBuffers3d(gl, vertice, indices);
		this.modelViewMatrix = modelViewMatrix || mat4.create();
		this.normalMatrix = mat4.create();
		this.mtpMatrix = mat4.create();
	}
	/**
	 * 
	 * @param {mat4} ProjectionMatrix 
	 */
	draw(ProjectionMatrix)
	{
		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffers.position);
		this.gl.vertexAttribPointer(this.programInfo.attribLocation.vertexPosition, 3, this.gl.FLOAT, false, 0, 0);
		this.gl.enableVertexAttribArray(this.programInfo.attribLocation.vertexPosition);

		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffers.textureCoord);
		this.gl.vertexAttribPointer(this.programInfo.attribLocation.textureCoord, 2, this.gl.FLOAT, false, 0, 0);
		this.gl.enableVertexAttribArray(this.programInfo.attribLocation.textureCoord);

		this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.buffers.indices);

		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffers.normal);
		this.gl.vertexAttribPointer(this.programInfo.attribLocation.vertexNormal, 3, this.gl.FLOAT, false, 0, 0);
		this.gl.enableVertexAttribArray(this.programInfo.attribLocation.vertexNormal);

		this.gl.useProgram(this.programInfo.program);
		
		mat4.identity(this.mtpMatrix);
		mat4.multiply(this.mtpMatrix, ProjectionMatrix, this.modelViewMatrix);
		mat4.invert(this.normalMatrix, this.modelViewMatrix);
		mat4.transpose(this.normalMatrix, this.normalMatrix);

		this.gl.uniformMatrix4fv(this.programInfo.uniformLocation.mtpMatrix, false, this.mtpMatrix);
		this.gl.uniformMatrix4fv(this.programInfo.uniformLocation.normalMatrix, false, this.normalMatrix);

		this.gl.activeTexture(this.gl.TEXTURE0);
		this.gl.bindTexture(this.gl.TEXTURE_2D, this.texture);
		this.gl.uniform1i(this.programInfo.uniformLocation.uSampler, 0);

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
		mat4.scale(this.modelViewMatrix,this.modelViewMatrix, vector);
	}
	updateColor()
	{
		this.gl.deleteTexture(this.texture);
		const texture = this.gl.createTexture();

		this.gl.bindTexture(this.gl.TEXTURE_2D, texture);
		const colorPixel = new Uint8Array(getCatppuccinRGB(this.colorName).concat(255));
		this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, 1, 1, 0, this.gl.RGBA, this.gl.UNSIGNED_BYTE, colorPixel);
		this.gl.generateMipmap(this.gl.TEXTURE_2D);
		this.texture = texture;
	}
	changeColor(colorName)
	{
		this.colorName = colorName;
		this.updateColor();
	}
}

export { Shape3d };