import { Shape2d, Shape3d } from "./webgl-shape";

class gameObject
{
	constructor(x, y, volumeShape, flatShape) //I cannot for the life of me find a good name for these variables
	{
		this.x = x || 0;
		this.y = y || 0;

		this.volumeShape = volumeShape;
		this.flatShape = flatShape;
	}
}

class ShapeMaker
{
	static makePaddle(gl, programInfo, projectionMatrix, modelViewMatrix, paddleHeight, paddleWidth, paddleDepth) {
	
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
	
		const paddleColors = [
			[1.0, 1.0, 1.0, 1.0], // Front face: white
			[1.0, 0.0, 0.0, 1.0], // Back face: red
			[0.0, 1.0, 0.0, 1.0], // Top face: green
			[0.0, 0.0, 1.0, 1.0], // Bottom face: blue
			[1.0, 1.0, 0.0, 1.0], // Right face: yellow
			[1.0, 0.0, 1.0, 1.0], // Left face: purple
		];
		let colors = []

		for (var j = 0; j < paddleColors.length; ++j) {
		const c = paddleColors[j];
		// Repeat each color four times for the four vertices of the face
		colors = colors.concat(c, c, c, c);
		}

	
		const paddleIndices = [
			0, 1, 2, 0, 2, 3,    // front
			4, 5, 6, 4, 6, 7,    // back
			8, 9, 10, 8, 10, 11, // top
			12, 13, 14, 12, 14, 15, // bottom
			16, 17, 18, 16, 18, 19, // right
			20, 21, 22, 20, 22, 23, // left
		];
	
		return new Shape3d(gl, programInfo, paddleVertices, colors, paddleIndices.flat(), projectionMatrix, modelViewMatrix);
	}
}


export { ShapeMaker };