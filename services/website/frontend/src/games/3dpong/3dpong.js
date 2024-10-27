import '../../shared.js';
import { getTheme } from '../../theme.js';
import { initShaders } from './webgl-initshader.js';
import { Shape3d } from './webgl-shape.js';
import { mat4 } from 'gl-matrix';
import { ShapeMaker, gameObject } from './pong-classes.js';
import { getCatppuccinWEBGL } from './colorUtils.js';

/**@type {HTMLCanvasElement} */
const canvas = document.getElementById("gameField");

/**@type {WebGL2RenderingContext} */
const gl = canvas.getContext("webgl2", {alpha: true});

let currentTheme = getTheme();

let gameObjects = {};

function setClearColor(colorName, setgl)
{
	const bgColor = getCatppuccinWEBGL(colorName);
	setgl.clearColor(bgColor.r, bgColor.g, bgColor.b, 1);
}

document.addEventListener('DOMContentLoaded', main);


let height = gl.canvas.height / 2;
let width = gl.canvas.width / 2;

function main()
{
	document.addEventListener('keydown', keyDown);
	document.addEventListener('keyup', keyUp);
	if (!gl)
	{
		console.error('Your browser does not support webgl, consider using a different browser to access this functionnality');
		return;
	}

	setClearColor("crust", gl);
	const programInfo = initShaders(gl);
	initShapes(programInfo);

	let projectionMatrix = mat4.create();
	let viewMatrix = mat4.create();

	const fieldOfView = (90 * Math.PI) / 180;
	const aspect = width / height;
	const zNear = 0.1;
	const zFar = 7000.0;

	const cameraDistance = (width / Math.tan(fieldOfView / 2)) + paddleDepth;

	mat4.perspective(projectionMatrix, fieldOfView, aspect, zNear, zFar);
	// mat4.ortho(projectionMatrix, -width, width, -height, height, zNear, zFar);
	mat4.lookAt(viewMatrix, [0, 0, cameraDistance], [0, 0, 0], [0, 1, 0]);

	let then = Date.now();
	let deltaTime = 0;
	let distance = 0;

	function render() {
		let now = Date.now();
    	deltaTime = now - then;
		then = now;
		if (getTheme() != currentTheme)
		{
			currentTheme = getTheme();
			setClearColor("crust", gl);
			paddle1.updateColor();
			paddle2.updateColor();
		}
		movePlayers(deltaTime);
		drawScene(projectionMatrix, viewMatrix);
		distance += deltaTime;
	}
	setInterval(render, 1000/60);
}

//Because I am dumb and do not know how to write code, these dimensions are half of the size of the actual object, 
const base = height / 5;
const paddleHeight = base;
const paddleWidth = paddleHeight / 9;
const paddleDepth = paddleHeight;	
const ballSize = paddleHeight / 10;
console.log(paddleHeight);

function initShapes(programInfo)
{
	const xTranslate = width - paddleWidth;

	let paddle1 = new gameObject(ShapeMaker.makeShape(gl, programInfo, mat4.create(), paddleHeight, paddleWidth, paddleDepth, "sapphire"));
	let paddle2 = new gameObject(ShapeMaker.makeShape(gl, programInfo, mat4.create(), paddleHeight, paddleWidth, paddleDepth, "sapphire"));
	let ball = new gameObject(ShapeMaker.makeShape(gl, programInfo, mat4.create(), ballSize, ballSize, ballSize, "sapphire"));

	gameObjects.paddle1 = paddle1;
	gameObjects.paddle2 = paddle2;
	gameObjects.ball = ball;

	gameObjects.paddle1.setPos([-xTranslate, 0, 0]);
	gameObjects.paddle2.setPos([xTranslate, 0, 0]);
	gameObjects.ball.setPos([0, 0, 0]);
}

//example of a scene draw
let projectionViewMatrix = mat4.create();

function drawScene(projectionMatrix, viewMatrix)
{	
	clearScene(gl);

	mat4.identity(projectionViewMatrix);
	mat4.multiply(projectionViewMatrix, projectionMatrix, viewMatrix);

	gameObjects.paddle1.draw(projectionViewMatrix, viewMatrix);
	gameObjects.paddle2.draw(projectionViewMatrix, viewMatrix);
	gameObjects.ball.draw(projectionViewMatrix, viewMatrix);
}

function movePaddle(paddle, speed, limit)
{
	paddle.move([0, speed, 0]);
	if (Math.abs(paddle.y) >= Math.abs(limit))
		paddle.setPos([paddle.x, limit, paddle.z]);
	console.log(paddle.y + " " + limit);
}

function movePlayers(deltaTime)
{
	const step = paddleHeight / 16;
	const speed = (step * (deltaTime / 10));
	const limit = height - paddleHeight;

	if (playerMove[0] && gameObjects.paddle1.y >= -limit)
		movePaddle(gameObjects.paddle1, -speed, -limit);
	if (playerMove[1] && gameObjects.paddle1.y <= limit)
		movePaddle(gameObjects.paddle1, speed, limit);
	if (playerMove[2] && gameObjects.paddle2.y >= -limit)
		movePaddle(gameObjects.paddle2, -speed, -limit);
	if (playerMove[3] && gameObjects.paddle2.y <= limit)
		movePaddle(gameObjects.paddle2, speed, limit);

	// console.log("paddle 1 position: " + gameObjects.paddle1.y);
	// console.log("paddle 2 position: " + gameObjects.paddle2.y);
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
