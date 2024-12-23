// @ts-check

import { mat4, vec3 } from 'gl-matrix'
import { initBuffers3d } from './webgl-initbuffers';
import { getCatppuccinRGB } from './colorUtils';

/**
 * @property {WebGLRenderingContext} gl
 * @property {Object} programInfo
 * @property {WebGLTexture} texture
 * @property {string} colorName
 * @property {number} vertexCount
 * @property {mat4} normalMatrix
 * @property {mat4} modelMatrix
 */
class Shape3d {
	/**
	 * @param {WebGLRenderingContext} gl
	 * @param {Object} programInfo
	 * @param {mat4} modelMatrix
	 * @param {number[]} vertices
	 * @param {number[]} indices
	 * @param {WebGLTexture} texture
	 * @param {string} colorName
	 */
	constructor(gl, programInfo, modelMatrix, vertices, indices, texture, colorName) {
		this.gl = gl;
		this.programInfo = programInfo;
		this.texture = texture;
		this.colorName = colorName || "blue";
		this.vertexCount = indices.length;
		this.buffers = initBuffers3d(gl, vertices, indices);
		this.modelMatrix = modelMatrix || mat4.create();
		this.normalMatrix = mat4.create();
		this.mtpMatrix = mat4.create();
	}

	/**
	 * @param {mat4} ProjectionViewMatrix 
	 * @param {mat4} viewMatrix
	 */
	draw(ProjectionViewMatrix, viewMatrix) {
		//set each of the buffers webgl should use to draw the object
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

		//which Shaders webgl should use to render this object
		this.gl.useProgram(this.programInfo.program);

		//Create the ProjectionViewModelMatrix to actually get a shape in the 3d Space
		mat4.identity(this.mtpMatrix);
		mat4.multiply(this.mtpMatrix, this.mtpMatrix, ProjectionViewMatrix);
		mat4.multiply(this.mtpMatrix, this.mtpMatrix, this.modelMatrix);

		//Create the normals from the model and view Matrix (lighting)
		mat4.multiply(this.normalMatrix, viewMatrix, this.modelMatrix);
		mat4.invert(this.normalMatrix, this.normalMatrix);
		mat4.transpose(this.normalMatrix, this.normalMatrix);

		//Pass the matrices to the shaders
		this.gl.uniformMatrix4fv(this.programInfo.uniformLocation.mtpMatrix, false, this.mtpMatrix);
		this.gl.uniformMatrix4fv(this.programInfo.uniformLocation.normalMatrix, false, this.normalMatrix);

		//tell webgl which texture to sample from
		this.gl.activeTexture(this.gl.TEXTURE0);
		this.gl.bindTexture(this.gl.TEXTURE_2D, this.texture);
		this.gl.uniform1i(this.programInfo.uniformLocation.uSampler, 0);

		this.gl.drawElements(this.gl.TRIANGLES, this.vertexCount, this.gl.UNSIGNED_SHORT, 0);
	}

	/**
	 * @param {number} radians
	 * @param {vec3} axis
	 * @return {Shape3d} this
	 */
	rotate(radians, axis) {
		mat4.rotate(this.modelMatrix, this.modelMatrix, radians, axis);
		return this;
	}

	/**
	 * @param {vec3} amount
	 * @return {Shape3d} this
	 */
	translate(amount) {
		mat4.translate(this.modelMatrix, this.modelMatrix, amount);
		return this;
	}

	/**
	 * @param {vec3} vector
	 * @return {Shape3d} this
	 */
	scale(vector) {
		mat4.scale(this.modelMatrix, this.modelMatrix, vector);
		return this;
	}

	updateColor() {
		this.gl.deleteTexture(this.texture);
		const texture = this.gl.createTexture();

		this.gl.bindTexture(this.gl.TEXTURE_2D, texture);
		const colorPixel = new Uint8Array(getCatppuccinRGB(this.colorName).concat(255));
		this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, 1, 1, 0, this.gl.RGBA, this.gl.UNSIGNED_BYTE, colorPixel);
		this.gl.generateMipmap(this.gl.TEXTURE_2D);
		this.texture = texture;
	}

	/**
	 * @param {String} colorName
	 */
	changeColor(colorName) {
		this.colorName = colorName;
		this.updateColor();
	}
}

export { Shape3d };