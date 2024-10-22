import '../../shared.js';
import { getTheme } from '../../theme.js';
import { flavors } from '@catppuccin/palette';
import { initShaders } from './webgl-initshader.js';
import './webgl-shape.js';
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

	let paddleHeight = 0.45;
	let paddleWidth = paddleHeight / 8;
	let paddleDepth = 0.5;		

	let projectionMatrix = mat4.create();

	let paddle = ShapeMaker.makeShape(gl, programInfo, mat4.create(), paddleHeight, paddleWidth, paddleDepth);
	let paddle2 = ShapeMaker.makeShape(gl, programInfo, mat4.create(), paddleHeight, paddleWidth, paddleDepth);

	let then = Date.now();
	let deltaTime = 0;
	let cubeRotation = 0.0;

		function render() {
			let now = Date.now();
    		deltaTime = now - then;
			then = now;
			movePlayer(deltaTime);
			drawScene(paddle, paddle2, projectionMatrix, cubeRotation /1000);
			cubeRotation += deltaTime;
		}
		document.addEventListener('keydown', keyDown);
		document.addEventListener('keyup', keyUp);
		setInterval(render, 1000/60);
}

let paddle1PositionY = 0;
let paddle2PositionY = 0;

function movePlayer(deltaTime)
{
	const step = 22;
	const speed = step * (deltaTime / 10);
	if (playerMove[0])
		paddle1PositionY -= speed;
	if (playerMove[1])
		paddle1PositionY += speed;
	if (playerMove[2])
		paddle2PositionY -= speed;
	if (playerMove[3])
		paddle2PositionY += speed;
}

let playerMove = [
	false,	//player 1 down
	false,	//player 1 up
	false,	//player 2 down
	false	//player 2 up
];

const keyMap = {
	83: 0,	//player 1 down
	87: 1,	//player 1 up
	40: 2,	//player 2 down
	38: 3	//player 2 up
};

function keyUp(event)
{
	const moveIndex = keyMap[event.keyCode];
	if (moveIndex !== undefined) playerMove[moveIndex] = false;
}
  
function keyDown(event)
{
	const moveIndex = keyMap[event.keyCode];
	if (moveIndex !== undefined) playerMove[moveIndex] = true;
}
//constants for the fov

function clearScene(gl_to_clear)
{
	gl_to_clear.clearDepth(1.0);
	gl_to_clear.enable(gl_to_clear.DEPTH_TEST);
	gl_to_clear.depthFunc(gl_to_clear.LEQUAL);
	gl_to_clear.clear(gl_to_clear.COLOR_BUFFER_BIT | gl_to_clear.DEPTH_BUFFER_BIT);
}

let width = gl.canvas.width / 2;
let height 

//example of a scene draw
function drawScene(object1, object2, projectionMatrix, cubeRotation)
{	
	clearScene(gl);
	mat4.identity(projectionMatrix);
	mat4.perspective(projectionMatrix, fieldOfView, aspect, zNear, zFar);
	mat4.identity(object1.modelViewMatrix);
	object1.translate([-1, paddle1PositionY / gl.canvas.height, -3]);
	object1.draw(projectionMatrix);

	mat4.identity(projectionMatrix);
	mat4.perspective(projectionMatrix, fieldOfView, aspect, zNear, zFar);
	mat4.identity(object2.modelViewMatrix);
	object2.translate([1, paddle2PositionY / gl.canvas.height, -3]);
	object2.draw(projectionMatrix);
}