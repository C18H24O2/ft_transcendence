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

function setClearColor(colorName, setgl)
{
	const bgColor = getCatppuccinWEBGL(colorName);
	setgl.clearColor(bgColor.r, bgColor.g, bgColor.b, 1);
}

let gameObjects = {};

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

	setClearColor("crust", gl);
	const programInfo = initShaders(gl);

	let paddleHeight = 0.20;
	let paddleWidth = paddleHeight / 8;
	let paddleDepth = paddleHeight;	
	let ballSize = 1 / 50;
	const xTranslate = 1.10;
	const zTranslate = -3;

	let projectionMatrix = mat4.create();

	let paddle1 = new gameObject(ShapeMaker.makeShape(gl, programInfo, mat4.create(), paddleHeight, paddleWidth, paddleDepth, "sapphire"));
	let paddle2 = new gameObject(ShapeMaker.makeShape(gl, programInfo, mat4.create(), paddleHeight, paddleWidth, paddleDepth, "sapphire"));
	let ball = new gameObject(ShapeMaker.makeShape(gl, programInfo, mat4.create(), ballSize, ballSize, ballSize, "sapphire"));

	gameObjects.paddle1 = paddle1;
	gameObjects.paddle2 = paddle2;
	gameObjects.ball = ball;

	gameObjects.paddle1.setPos([-xTranslate, 0, zTranslate]);
	gameObjects.paddle2.setPos([xTranslate, 0, zTranslate]);
	gameObjects.ball.setPos([0, 0, zTranslate]);

	let then = Date.now();
	let deltaTime = 0;

	function render() {
		let now = Date.now();
    	deltaTime = now - then;
		then = now;
		movePlayer(deltaTime);
		if (getTheme() != currentTheme)
		{
			currentTheme = getTheme();
			setClearColor("crust", gl);
			paddle1.updateColor();
			paddle2.updateColor();
		}
		drawScene(projectionMatrix);
	}
	setInterval(render, 1000/60);
}

function movePlayer(deltaTime)
{
	const step = 22;
	const speed = (step * (deltaTime / 10)) / gl.canvas.height;

	console.log(speed);
	if (playerMove[0])
		gameObjects.paddle1.move([0, -speed, 0]);
	if (playerMove[1])
		gameObjects.paddle1.move([0, speed, 0]);
	if (playerMove[2])
		gameObjects.paddle2.move([0, -speed, 0]);
	if (playerMove[3])
		gameObjects.paddle2.move([0, speed, 0]);
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
function drawScene(projectionMatrix)
{	
	clearScene(gl);

	mat4.identity(projectionMatrix);
	mat4.perspective(projectionMatrix, fieldOfView, aspect, zNear, zFar);

	gameObjects.paddle1.draw(projectionMatrix);
	gameObjects.paddle2.draw(projectionMatrix);
	gameObjects.ball.draw(projectionMatrix);
}