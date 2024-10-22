import '../../shared.js';
import { getTheme } from '../../theme.js';
import { flavors } from '@catppuccin/palette';
import { initShaders } from './webgl-initshader.js';
import './webgl-shape.js';
import { Shape2d } from './webgl-shape.js';
import { Shape3d } from './webgl-shape.js';
import { mat4 } from 'gl-matrix';
import { ShapeMaker } from './pong-classes.js';

/**@type {HTMLCanvasElement} */
const canvas = document.getElementById("gameField");

/**@type {WebGL2RenderingContext} */
const gl = canvas.getContext("webgl2", {alpha: true});

const fieldOfView = (45 * Math.PI) / 180;
const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
const zNear = 0.1;
const zFar = 100.0;

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

		let paddleHeight = 1.5;
		let paddleWidth = 0.15;
		let paddleDepth = 0.5;		

		let projectionMatrix = mat4.create();

		let paddle = ShapeMaker.makePaddle(gl, programInfo, projectionMatrix, mat4.create(), paddleHeight, paddleWidth, paddleDepth);
		let paddle2 = ShapeMaker.makePaddle(gl, programInfo, projectionMatrix, mat4.create(), paddleHeight, paddleWidth, paddleDepth);

		let then = 0;
		let deltaTime = 0;
		let cubeRotation = 0.0;

		function render(timestamp) {
			let now = timestamp * 0.001;
    		deltaTime = now - then;
			then = now;
			drawScene(paddle, paddle2, cubeRotation);
			cubeRotation += deltaTime;
			requestAnimationFrame(render);
		}
		requestAnimationFrame(render);
}

//constants for the fov

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
	object.translate([-1.0, 1.3, -5.21]);
	object.rotate(1, [1, 1, 0]);

	mat4.perspective(object2.projectionMatrix, fieldOfView, aspect, zNear, zFar);
	object2.translate([2.0, -1.2, -5.21]);

	object.draw();
	object2.draw();
}