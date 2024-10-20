import '../../shared.js';
import { getTheme } from '../../theme.js';
import { flavors } from '@catppuccin/palette';
import { initShaders } from './webgl-initshader.js';
import './webgl-shape.js';
import { Shape2d } from './webgl-shape.js';
import { Shape3d } from './webgl-shape.js';
import { mat4 } from 'gl-matrix';

/**@type {HTMLCanvasElement} */
const canvas = document.getElementById("gameField");

/**@type {WebGL2RenderingContext} */
const gl = canvas.getContext("webgl2", {alpha: true});

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

	const projectionMatrix = mat4.create();
	const modelViewMatrix = mat4.create();

	const projectionMatrix2 = mat4.create();
	const modelViewMatrix2 = mat4.create();

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
		], colors, indices, projectionMatrix, modelViewMatrix);

		var cube2 = new Shape3d(gl, programInfo, [
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
			], colors, indices, projectionMatrix2, modelViewMatrix2);
		
		let then = 0;
		let deltaTime = 0;
		let cubeRotation = 0.0;

		function render(timestamp) {
			let now = timestamp * 0.001;
    		deltaTime = now - then;
			then = now;
			drawScene(cube, cube2, cubeRotation);
			cubeRotation += deltaTime;
			requestAnimationFrame(render);
		}
		requestAnimationFrame(render);
}

//constants for the fov

const fieldOfView = (45 * Math.PI) / 180;
const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
const zNear = 0.1;
const zFar = 100.0;

function clearScene(gl_to_clear)
{
	gl_to_clear.clearDepth(1.0);
	gl_to_clear.enable(gl_to_clear.DEPTH_TEST);
	gl_to_clear.depthFunc(gl_to_clear.LEQUAL);
	gl_to_clear.clear(gl_to_clear.COLOR_BUFFER_BIT | gl_to_clear.DEPTH_BUFFER_BIT);
}

//example of a scene draw
function drawScene(object, object2, cubeRotation)
{	
	clearScene(gl);
	mat4.identity(object.modelViewMatrix);
	mat4.identity(object.projectionMatrix);

	mat4.identity(object2.modelViewMatrix);
	mat4.identity(object2.projectionMatrix);

	mat4.perspective(object.projectionMatrix, fieldOfView, aspect, zNear, zFar);
	object.translate([-1.0, 1.0, -6.0]);
	object.rotate(cubeRotation, [0, 0, 1]);
	object.rotate(cubeRotation * 0.7, [0, 1, 0]);
	object.rotate(cubeRotation * 0.3, [1, 0, 0]);

	mat4.perspective(object2.projectionMatrix, fieldOfView, aspect, zNear, zFar);
	object2.translate([1.0, -1.0, -6.0]);
	object2.rotate(-cubeRotation, [0, 0, 1]);
	object2.rotate(-cubeRotation * 0.7, [0, 1, 0]);
	object2.rotate(-cubeRotation * 0.3, [1, 0, 0]);
	object.draw();
	object2.draw();
}