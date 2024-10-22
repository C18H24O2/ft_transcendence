import { getTheme } from "../../theme";
import { Shape3d } from "./webgl-shape";
import { flavors } from "@catppuccin/palette";

class gameObject
{
	constructor(x, y, ShapeObject) //I cannot for the life of me find a good name for these variables
	{
		this.x = x || 0;
		this.y = y || 0;

		this.shapeObject = ShapeObject;
	}
}

function getColors()
{
	return (flavors[getTheme().split('-').pop()].colors);
}

/**@type {import('@catppuccin/palette').CatppuccinColors} */
let colors = getColors();

function rgb_to_webgl(color)
{
	return (
		[
			color.r / 255, 
			color.g / 255,
			color.b / 255,
		]
	)
}

class ShapeMaker
{
	static makeShape(gl, programInfo, modelViewMatrix, paddleHeight, paddleWidth, paddleDepth) {
	
		const paddleVertices = [
			// Front face
			-paddleWidth / 2, -paddleHeight / 2, paddleDepth / 2,
			paddleWidth / 2, -paddleHeight / 2, paddleDepth / 2,
			paddleWidth / 2, paddleHeight / 2, paddleDepth / 2,
			-paddleWidth / 2, paddleHeight / 2, paddleDepth / 2,
	
			// Back face
			-paddleWidth / 2, -paddleHeight / 2, -paddleDepth / 2,
			-paddleWidth / 2, paddleHeight / 2, -paddleDepth / 2,
			paddleWidth / 2, paddleHeight / 2, -paddleDepth / 2,
			paddleWidth / 2, -paddleHeight / 2, -paddleDepth / 2,
	
			// Top face
			-paddleWidth / 2, paddleHeight / 2, -paddleDepth / 2,
			-paddleWidth / 2, paddleHeight / 2, paddleDepth / 2,
			paddleWidth / 2, paddleHeight / 2, paddleDepth / 2,
			paddleWidth / 2, paddleHeight / 2, -paddleDepth / 2,
	
			// Bottom face
			-paddleWidth / 2, -paddleHeight / 2, -paddleDepth / 2,
			paddleWidth / 2, -paddleHeight / 2, -paddleDepth / 2,
			paddleWidth / 2, -paddleHeight / 2, paddleDepth / 2,
			-paddleWidth / 2, -paddleHeight / 2, paddleDepth / 2,
	
			// Right face
			paddleWidth / 2, -paddleHeight / 2, -paddleDepth / 2,
			paddleWidth / 2, paddleHeight / 2, -paddleDepth / 2,
			paddleWidth / 2, paddleHeight / 2, paddleDepth / 2,
			paddleWidth / 2, -paddleHeight / 2, paddleDepth / 2,
	
			// Left face
			-paddleWidth / 2, -paddleHeight / 2, -paddleDepth / 2,
			-paddleWidth / 2, -paddleHeight / 2, paddleDepth / 2,
			-paddleWidth / 2, paddleHeight / 2, paddleDepth / 2,
			-paddleWidth / 2, paddleHeight / 2, -paddleDepth / 2,
		];
	

		// I LOVE COLOR PICKING ❗❗ I can't be bothered to add a lighting system right now
		const paddleColors = [
			rgb_to_webgl(colors.sky.rgb).concat(1), // Front face
			rgb_to_webgl(colors.sky.rgb).concat(1), // Back face
			rgb_to_webgl(colors.teal.rgb).concat(1), // Top face
			rgb_to_webgl(colors.teal.rgb).concat(1), // Bottom face
			rgb_to_webgl(colors.sapphire.rgb).concat(1), // Right face
			rgb_to_webgl(colors.sapphire.rgb).concat(1), // Left face
		];

		console

		let vertex_colors = []

		for (var j = 0; j < paddleColors.length; ++j) {
		const c = paddleColors[j];
		// Repeat each color four times for the four vertices of the face
		vertex_colors = vertex_colors.concat(c, c, c, c);
		}

	
		const paddleIndices = [
			0, 1, 2, 0, 2, 3,    // front
			4, 5, 6, 4, 6, 7,    // back
			8, 9, 10, 8, 10, 11, // top
			12, 13, 14, 12, 14, 15, // bottom
			16, 17, 18, 16, 18, 19, // right
			20, 21, 22, 20, 22, 23, // left
		];
	
		return new Shape3d(gl, programInfo, paddleVertices, vertex_colors, paddleIndices.flat(),modelViewMatrix);
	}
}


export { ShapeMaker };