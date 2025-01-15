// @ts-check

import { Shape3d } from "./webgl-shape";
import { getCatppuccinRGB } from "./colorUtils";
import { mat4 } from "gl-matrix";

export class ShapeMaker
{
	/**
	 * @param {WebGLRenderingContext} gl
	 * @param {Object} programInfo
	 * @param {mat4} modelMatrix
	 * @param {number} paddleHeight
	 * @param {number} paddleWidth
	 * @param {number} paddleDepth
	 * @param {String} colorName
	 */
	static makeShape(gl, programInfo, modelMatrix, paddleHeight, paddleWidth, paddleDepth, colorName)
	{	
		const paddleVertices = [
			// Front face
			-paddleWidth, -paddleHeight, paddleDepth,
			paddleWidth, -paddleHeight, paddleDepth,
			paddleWidth, paddleHeight, paddleDepth,
			-paddleWidth, paddleHeight, paddleDepth,
	
			// Back face
			-paddleWidth, -paddleHeight, -paddleDepth,
			-paddleWidth, paddleHeight, -paddleDepth,
			paddleWidth, paddleHeight, -paddleDepth,
			paddleWidth, -paddleHeight, -paddleDepth,
	
			// Top face
			-paddleWidth, paddleHeight, -paddleDepth,
			-paddleWidth, paddleHeight, paddleDepth,
			paddleWidth, paddleHeight, paddleDepth,
			paddleWidth, paddleHeight, -paddleDepth,
	
			// Bottom face
			-paddleWidth, -paddleHeight, -paddleDepth,
			paddleWidth, -paddleHeight, -paddleDepth,
			paddleWidth, -paddleHeight, paddleDepth,
			-paddleWidth, -paddleHeight, paddleDepth,
	
			// Right face
			paddleWidth, -paddleHeight, -paddleDepth,
			paddleWidth, paddleHeight, -paddleDepth,
			paddleWidth, paddleHeight, paddleDepth,
			paddleWidth, -paddleHeight, paddleDepth,
	
			// Left face
			-paddleWidth, -paddleHeight, -paddleDepth,
			-paddleWidth, -paddleHeight, paddleDepth,
			-paddleWidth, paddleHeight, paddleDepth,
			-paddleWidth, paddleHeight, -paddleDepth,
		];
	
		const texture = gl.createTexture();

		gl.bindTexture(gl.TEXTURE_2D, texture);
		const colorPixel = new Uint8Array(getCatppuccinRGB(colorName).concat(255));
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, colorPixel);
		gl.generateMipmap(gl.TEXTURE_2D);

		const paddleIndices = [
			0, 1, 2, 0, 2, 3,    // front
			4, 5, 6, 4, 6, 7,    // back
			8, 9, 10, 8, 10, 11, // top
			12, 13, 14, 12, 14, 15, // bottom
			16, 17, 18, 16, 18, 19, // right
			20, 21, 22, 20, 22, 23, // left
		];
	
		return new Shape3d(gl, programInfo, modelMatrix, paddleVertices, paddleIndices, texture, colorName);
	}
}

/**
 * @prop {Shape3d | null} shape
 * @prop {number} x
 * @prop {number} y
 * @prop {number} z
 */
export class GameObject
{
	/**
	 * @param {Shape3d | null} shape
	 * @param {number} [x]
	 * @param {number} [y]
	 * @param {number} [z]
	 */
	constructor(shape, x = 0, y = 0, z = 0)
	{
		this.shape = shape;
		this.x = x;
		this.y = y;
		this.z = z;
	}
	
	/**
	 * @param {[number, number, number]} coordinates
	 */
	setPos(coordinates)
	{
		this.x = coordinates[0];
		this.y = coordinates[1];
		this.z = coordinates[2];
	}
	
	/**
	 * @param {[number, number, number]} vector
	 */
	move(vector)
	{
		this.x += vector[0];
		this.y += vector[1];
		this.z += vector[2];
	}

	/**
	 * @param {mat4} ProjectionMatrix
	 * @param {mat4} viewMatrix
	 */
	draw(ProjectionMatrix, viewMatrix)
	{
		if (!(this.shape instanceof Shape3d))
			return;
		mat4.identity(this.shape.modelMatrix);
		this.shape.translate([this.x, this.y, this.z]);
		this.shape.draw(ProjectionMatrix, viewMatrix);
	}
}
