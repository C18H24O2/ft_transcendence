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

function getColors()
{
	return (flavors[getTheme().split('-').pop()].colors);
}

/**@type {import('@catppuccin/palette').CatppuccinColors} */
let colors = getColors();

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

function cat_to_rgb(color)
{
	return (
		[
			color.r, 
			color.g,
			color.b,
		]
	)
}

main();

function main()
{
	document.addEventListener('keydown', keyDown);
	document.addEventListener('keyup', keyUp);
	if (!gl)
	{
		console.error('Your browser does not support webgl, consider using a different browser to access this functionnality');
		return;
	}

	const bgColor = rgb_to_webgl(colors.crust.rgb);
	gl.clearColor(bgColor.r, bgColor.g, bgColor.b, 1);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	const programInfo = initShaders(gl);

	let paddleHeight = 0.20;
	let paddleWidth = paddleHeight / 8;
	let paddleDepth = paddleHeight;	

	let projectionMatrix = mat4.create();

	let paddle = ShapeMaker.makeShape(gl, programInfo, mat4.create(), paddleHeight, paddleWidth, paddleDepth, cat_to_rgb(colors.sapphire.rgb));
	let paddle2 = ShapeMaker.makeShape(gl, programInfo, mat4.create(), paddleHeight, paddleWidth, paddleDepth, cat_to_rgb(colors.sapphire.rgb));

	let then = Date.now();
	let deltaTime = 0;

	function render() {
		let now = Date.now();
    	deltaTime = now - then;
		then = now;
		movePlayer(deltaTime);
		drawScene(paddle, paddle2, projectionMatrix);
	}
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

const fieldOfView = (45 * Math.PI) / 180;
const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
const zNear = 0.1;
const zFar = 100.0;

//example of a scene draw
function drawScene(object1, object2, projectionMatrix)
{	
	clearScene(gl);
	const xTranslate = 1.10;
	const zTranslate = -3;

	mat4.identity(projectionMatrix);
	mat4.perspective(projectionMatrix, fieldOfView, aspect, zNear, zFar);

	mat4.identity(object1.modelViewMatrix);
	object1.translate([-xTranslate, paddle1PositionY / gl.canvas.height, zTranslate]);
	object1.draw(projectionMatrix);

	mat4.identity(object2.modelViewMatrix);
	object2.translate([xTranslate, paddle2PositionY / gl.canvas.height, zTranslate]);
	object2.draw(projectionMatrix);
}