import '../../shared.js';
import { getTheme } from '../../theme.js';
import { initShaders } from './webgl-initshader.js';
import { Shape3d } from './webgl-shape.js';
import { mat4 } from 'gl-matrix';
import { ShapeMaker, gameObject } from './pong-classes.js';
import { getCatppuccinWEBGL } from './colorUtils.js';

/**@type {HTMLCanvasElement} */
const canvas = document.getElementById("gameField");

/**@type {WebGLRenderingContext} */
const gl = canvas.getContext("webgl", {alpha: true});

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

	const projectionMatrix = mat4.create();
	const viewMatrix = mat4.create();
	let then = Date.now();
	let deltaTime = 0;
	let distance = 0;
	mat4.lookAt(viewMatrix, [0, 0, cameraDistance], [0, 0, 0], [0, 1, 0]);
	mat4.perspective(projectionMatrix, fieldOfView, aspect, zNear, zFar);

	function render() {
		let now = Date.now();
    	deltaTime = now - then;
		then = now;
		if (getTheme() != currentTheme)
		{
			console.log("changeTheme()");
			currentTheme = getTheme();
			setClearColor("crust", gl);
			gameObjects.paddle1.shape.updateColor();
			gameObjects.paddle2.shape.updateColor();
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

let projectionViewMatrix = mat4.create();

const fieldOfView = (45 * Math.PI) / 180;
const aspect = width / height;
const zNear = 0.1;
const zFar = 7000.0;
const cameraDistance = (width / Math.tan(fieldOfView / 2)) + paddleDepth;
let orthoMode = false;

function drawScene(projectionMatrix, viewMatrix)
{	
	clearScene(gl);

	mat4.identity(projectionViewMatrix);
	if (orthoMode != keyPress[4])
	{
		orthoMode = keyPress[4];
		mat4.identity(projectionMatrix);
		if (!keyPress[4])
			mat4.perspective(projectionMatrix, fieldOfView, aspect, zNear, zFar);
		else
			mat4.ortho(projectionMatrix, -width, width, -height, height, zNear, zFar);
	}
	mat4.multiply(projectionViewMatrix, projectionMatrix, viewMatrix);

	gameObjects.paddle1.draw(projectionViewMatrix, viewMatrix);
	gameObjects.paddle2.draw(projectionViewMatrix, viewMatrix);
	gameObjects.ball.draw(projectionViewMatrix, viewMatrix);
}

function movePlayers(deltaTime)
{
	const step = paddleHeight / 16;
	const speed = (step * (deltaTime / 10));
	const limit = height - paddleHeight;

	if (keyPress[0] ^ keyPress[1])
	{
		if (keyPress[0] && gameObjects.paddle1.y > -limit)
		{
			let paddle = gameObjects.paddle1;
			paddle.move([0, -speed, 0]);
			if (paddle.y < -limit)
				paddle.setPos([paddle.x, -limit, paddle.z]);
		}
		if (keyPress[1] && gameObjects.paddle1.y < limit)
		{
			let paddle = gameObjects.paddle1;
			paddle.move([0, speed, 0]);
			if (paddle.y > limit)
				paddle.setPos([paddle.x, limit, paddle.z]);
		}
	}
	if (keyPress[2] ^ keyPress[3])
	{
		if (keyPress[2] && gameObjects.paddle2.y >= -limit)
		{
			let paddle = gameObjects.paddle2;
			paddle.move([0, -speed, 0]);
			if (paddle.y < -limit)
				paddle.setPos([paddle.x, -limit, paddle.z]);
		}
		if (keyPress[3] && gameObjects.paddle2.y < limit)
		{
			let paddle = gameObjects.paddle2;
			paddle.move([0, speed, 0]);
			if (paddle.y > limit)
				paddle.setPos([paddle.x, limit, paddle.z]);
		}
	}
}

let keyPress = [
	false,	//player 1 down
	false,	//player 1 up
	false,	//player 2 down
	false,	//player 2 up
	false,	//temp view Switch
];

const keyMap = {
	83: 0,	//player 1 down
	87: 1,	//player 1 up
	40: 2,	//player 2 down
	38: 3,	//player 2 up
};

function keyUp(event)
{
	const moveIndex = keyMap[event.keyCode];
	if (moveIndex !== undefined) keyPress[moveIndex] = false;
}
  
function keyDown(event)
{
	const moveIndex = keyMap[event.keyCode];
	if (moveIndex !== undefined) keyPress[moveIndex] = true;


	if (event.keyCode == 32)
	{
		console.log("View switch!");
		keyPress[4] = !(keyPress[4]);
	}
}

function clearScene(gl_to_clear)
{
	gl_to_clear.clearDepth(1.0);
	gl_to_clear.enable(gl_to_clear.DEPTH_TEST);
	gl_to_clear.depthFunc(gl_to_clear.LEQUAL);
	gl_to_clear.clear(gl_to_clear.COLOR_BUFFER_BIT | gl_to_clear.DEPTH_BUFFER_BIT);
}
