import '../../shared.js';
import { getTheme } from '../../theme.js';
import { flavors } from '@catppuccin/palette';
import { initShaders } from './webgl-initshader.js';
import './webgl-shape.js';
import { Shape2d } from './webgl-shape.js';
import { Shape3d } from './webgl-shape.js';

import { mat4 } from 'gl-matrix';

let frameRate = 240;

main();

function getColors()
{
	return (flavors[getTheme().split('-').pop()].colors);
}

function rgb_to_webgl(color)
{
	return (
		{
			r: color.r / 255, 
			g: color.g / 255,
			b: color.b / 255,
		}
	)
}

function main()
{
	/**@type {HTMLCanvasElement} */
	const canvas = document.getElementById("gameField");

	/**@type {WebGL2RenderingContext} */
	const gl = canvas.getContext("webgl2", {alpha: true});

	if (!gl)
	{
		console.error('Your browser does not support webgl, consider using a different browser to access this functionnality');
		return;
	}
	
	/**@type {import('@catppuccin/palette').CatppuccinColors} */
	const cat_colors = getColors();

	const bgColor = rgb_to_webgl(cat_colors.crust.rgb);
	gl.clearColor(bgColor.r, bgColor.g, bgColor.b, 1);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	const programInfo = initShaders(gl);

	// const square = new Shape2d(gl, programInfo, [1.0, 1.0, -1.0, 1.0, 1.0, -1.0, -1.0, -1.0], [
	// 	1.0,
	// 	1.0,
	// 	1.0,
	// 	1.0,
	// 	1.0,
	// 	1.0,
	// 	1.0,
	// 	1.0,
	// 	1.0,
	// 	1.0,
	// 	1.0,
	// 	1.0,
	// 	1.0,
	// 	1.0,
	// 	1.0,
	// 	1.0,
	// ]);

	const faceColors = [
		[1.0, 1.0, 1.0, 1.0], // Front face: white
		[1.0, 0.0, 0.0, 1.0], // Back face: red
		[0.0, 1.0, 0.0, 1.0], // Top face: green
		[0.0, 0.0, 1.0, 1.0], // Bottom face: blue
		[1.0, 1.0, 0.0, 1.0], // Right face: yellow
		[1.0, 0.0, 1.0, 1.0], // Left face: purple
	];

	let colors = []

	for (var j = 0; j < faceColors.length; ++j) {
		const c = faceColors[j];
		// Repeat each color four times for the four vertices of the face
		colors = colors.concat(c, c, c, c);
	}

	const indices = [
		0, 1, 2,
		0, 2, 3, // front
		4, 5, 6,
		4, 6, 7, // back
		8, 9, 10,
		8, 10, 11, // top
		12, 13, 14,
		12, 14, 15, // bottom
		16, 17, 18,
		16, 18, 19, // right
		20, 21, 22,
		20, 22, 23, // left
	];

	var cube = new Shape3d(gl, programInfo, [
		// Front face
		-1.0, -1.0, 1.0,
		1.0, -1.0, 1.0,
		1.0, 1.0, 1.0,
		-1.0, 1.0, 1.0,
	  
		// Back face
		-1.0, -1.0, -1.0,
		-1.0, 1.0, -1.0,
		1.0, 1.0, -1.0,
		1.0, -1.0, -1.0,
	  
		// Top face
		-1.0, 1.0, -1.0,
		-1.0, 1.0, 1.0,
		1.0, 1.0, 1.0,
		1.0, 1.0, -1.0,
	  
		// Bottom face
		-1.0, -1.0, -1.0,
		1.0, -1.0, -1.0,
		1.0, -1.0, 1.0,
		-1.0, -1.0, 1.0,
	  
		// Right face
		1.0, -1.0, -1.0,
		1.0, 1.0, -1.0,
		1.0, 1.0, 1.0,
		1.0, -1.0, 1.0,
	  
		// Left face
		-1.0, -1.0, -1.0,
		-1.0, -1.0, 1.0,
		-1.0, 1.0, 1.0,
		-1.0, 1.0, -1.0,
		], colors, indices);

		let then = Date.now();
		let deltaTime = 0;
		let cubeRotation = 0.0;

		function render() {
			let now = Date.now();
    		deltaTime = now - then;
			then = now;

			drawScene(gl, cube, cubeRotation);
			cubeRotation += deltaTime / 1000;
		}

		setInterval(render, 1000 / frameRate);
}


function drawScene(gl, object, cubeRotation)
{
	const fieldOfView = (45 * Math.PI) / 180; // in radians
	const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
	const zNear = 0.1;
	const zFar = 100.0;
	const projectionMatrix = mat4.create();
	  
	// note: glmatrix.js always has the first argument
	// as the destination to receive the result.
	mat4.perspective(projectionMatrix, fieldOfView, aspect, zNear, zFar);
	
	const modelViewMatrix = mat4.create();

	mat4.translate(
		modelViewMatrix, // destination matrix
		modelViewMatrix, // matrix to translate
		[-0.0, Math.sin(cubeRotation), -6.0]
	); // amount to translate
	
	mat4.rotate(
		modelViewMatrix, // destination matrix
		modelViewMatrix, // matrix to rotate
		cubeRotation, // amount to rotate in radians
		[0, 0, 1]
	); // axis to rotate around (Z)
	mat4.rotate(
		modelViewMatrix, // destination matrix
		modelViewMatrix, // matrix to rotate
		cubeRotation * 0.7, // amount to rotate in radians
		[0, 1, 0]
	); // axis to rotate around (Y)
	mat4.rotate(
		modelViewMatrix, // destination matrix
		modelViewMatrix, // matrix to rotate
		cubeRotation * 0.3, // amount to rotate in radians
		[1, 0, 0]
	);

	const mtpMatrix = mat4.create();
	mat4.multiply(mtpMatrix, projectionMatrix, modelViewMatrix);
	object.draw(mtpMatrix);
}