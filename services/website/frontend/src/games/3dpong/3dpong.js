import '../../shared.js';
import { getTheme } from '../../theme.js';
import { initShaders } from './webgl-initshader.js';
import { Shape3d } from './webgl-shape.js';
import { mat4 } from 'gl-matrix';
import { ShapeMaker, gameObject } from './pong-classes.js';
import { getCatppuccinWEBGL } from './colorUtils.js';

function setClearColor(colorName, setgl)
{
	const bgColor = getCatppuccinWEBGL(colorName);
	setgl.clearColor(bgColor.r, bgColor.g, bgColor.b, 1);
}


	//Getting the webgl context
/**@type {HTMLCanvasElement} */
const canvas = document.getElementById("gameField");

/**@type {WebGLRenderingContext} */
const gl = canvas.getContext("webgl", {alpha: true});


	//used to be able to keep track of theme changes
let currentTheme = getTheme();

	//global gameobjects container for ease of use
let gameObjects = {};


	//Basic info about the gamefield
const height = gl.canvas.height / 2;
const width = gl.canvas.width / 2;
const viewMatrix = mat4.create();
const projectionMatrix = mat4.create();
const projectionViewMatrix = mat4.create();


	//Score containers
const scoreP1 = document.getElementById("score-player");
const scoreP2 = document.getElementById("score-opponent");

	//Game Objects Size
//Because I am dumb and do not know how to write code, these dimensions are half of the size of the actual object, 
const base = height / 5;
const paddleHeight = base;
const paddleWidth = paddleHeight / 9;
const paddleDepth = paddleHeight;	
const ballSize = paddleHeight / 10;

	//Camera values (mostly perspective camera, but some are reused)
//camera fov + distance to get similar results between orthographic camera and perspective camera
const fieldOfView = (70 * Math.PI) / 180;
const aspect = width / height;
const zNear = 0.1;
const zFar = 7000.0;
const cameraDistance = (width / Math.tan(fieldOfView / 2)) + paddleDepth;

	//for the view switch between 3d and 2d
let view = true;


	//Values for the game difficulty ramp up and reset
let speedMult = 1; //Multiplier for speed, increases
const BASE_BALL_SPEED = 8;
const MAX_BALL_SPEED_MULTIPLIER = 20; //how fast the ball can go
const BALL_SPEED_INCREASE = MAX_BALL_SPEED_MULTIPLIER / 100; //how fast it ramps up
const MAX_PADDLE_SPEED_MULTIPLIER = MAX_BALL_SPEED_MULTIPLIER / 20; // (1 + MAX_PADDLE_SPEED_MULTIPLIER) is the max paddle speed, calculated based on (speedMult / MAX_BALL_SPEED_MULTIPILIER) * MAX_PADDLE_SPEED

document.addEventListener('DOMContentLoaded', main);

	//FUnction Setter, value initialisation and shader compilation
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

	let then = Date.now();
	let deltaTime = 0;
	let distance = 0;
	mat4.lookAt(viewMatrix, [0, 0, cameraDistance], [0, 0, 0], [0, 1, 0]);
	if (!view)
		mat4.perspective(projectionMatrix, fieldOfView, aspect, zNear, zFar);
	else
		mat4.ortho(projectionMatrix, -width, width, -height, height, zNear, zFar);
	mat4.multiply(projectionViewMatrix, projectionMatrix, viewMatrix);

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
			gameObjects.ball.shape.updateColor();
		}
		movePlayers(deltaTime);
		moveBall(deltaTime);
		checkGoal();
		drawScene();
		distance += deltaTime;
		requestAnimationFrame(render);
	}
	requestAnimationFrame(render);
}

	//set the paddles and the balls on the field
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

	gameObjects.ball.speedX = BASE_BALL_SPEED;
	gameObjects.ball.speedY = 0;

	gameObjects.paddle1.score = 0;
	gameObjects.paddle2.score = 0;
}

	//swap Between 2d and 3d
function viewSwitch()
{
	view = !view;

	mat4.identity(projectionMatrix);
	if (!view)
		mat4.perspective(projectionMatrix, fieldOfView, aspect, zNear, zFar);
	else
		mat4.ortho(projectionMatrix, -width, width, -height, height, zNear, zFar);
	mat4.identity(projectionViewMatrix);
	mat4.multiply(projectionViewMatrix, projectionMatrix, viewMatrix);
}
window.viewSwitch = viewSwitch;


//clear the gameField
function clearScene(gl_to_clear)
{
	gl_to_clear.clearDepth(1.0);
	gl_to_clear.enable(gl_to_clear.DEPTH_TEST);
	gl_to_clear.depthFunc(gl_to_clear.LEQUAL);
	gl_to_clear.clear(gl_to_clear.COLOR_BUFFER_BIT | gl_to_clear.DEPTH_BUFFER_BIT);
}

	//just calls draw on every object
function drawScene()
{	
	clearScene(gl);

	gameObjects.paddle1.draw(projectionViewMatrix, viewMatrix);
	gameObjects.paddle2.draw(projectionViewMatrix, viewMatrix);
	gameObjects.ball.draw(projectionViewMatrix, viewMatrix);
}

//code for player and ball movement under here

function reset(side = 0)
{
	const xTranslate = width - paddleWidth;

	gameObjects.paddle1.setPos([-xTranslate, 0, 0]);
	gameObjects.paddle2.setPos([xTranslate, 0, 0]);
	gameObjects.ball.setPos([0, 0, 0]);

	gameObjects.ball.speedX = BASE_BALL_SPEED * Math.sign(side);
	gameObjects.ball.speedY = 0;
	speedMult = 1;
}

function checkGoal()
{
	let ball = gameObjects.ball;	
	if (ball.x < -width || ball.x > width)
	{
		if (ball.x < -width)
		{
			gameObjects.paddle2.score += 1;
			scoreP2.textContent = String(gameObjects.paddle2.score).padStart(3, '0');
			console.log("caca");
			reset(-1);
		}
		if (ball.x > width)
		{
			gameObjects.paddle1.score += 1;
			scoreP1.textContent = String(gameObjects.paddle1.score).padStart(3, '0');
			reset(1);
		}
	}
}

function BoundingBox(x, y, width, height)
{
	let minX = x - width, maxX = x + width;
	let minY = y - height, maxY = y + height;

	return {minX, minY, maxX, maxY};
}

function boundingBoxCollide(bBoxA, bBoxB)
{
	let A_Left_B = bBoxA.maxX < bBoxB.minX;
	let A_Right_B = bBoxA.minX > bBoxB.maxX;
	let A_Above_B = bBoxA.maxY < bBoxB.minY;
	let A_Below_B = bBoxA.minY > bBoxB.maxY;
	return !(A_Left_B || A_Right_B || A_Above_B || A_Below_B);
}

function moveBall(deltaTime) {
	let ball = gameObjects.ball;
	let movementX = speedMult * ball.speedX * (deltaTime / 10);
	let movementY = speedMult * ball.speedY * (deltaTime / 10);

	console.log(speedMult);
	// Determine the number of steps needed for smooth collision detection
	const steps = Math.ceil(Math.max(Math.abs(movementX), Math.abs(movementY)) / ballSize);
	const stepX = movementX / steps;
	const stepY = movementY / steps;

	// Iterate over the calculated steps
	for (let i = 0; i < steps; i++) {
		ball.move([stepX, stepY, 0]);
		if (ballCollide(ball)) {
			// Exit early if a collision is detected
			break;
		}
	}
}

function ballCollide(ball) {
	let paddle;

	if (ball.speedX < 0) {
		paddle = gameObjects.paddle1;
	} else {
		paddle = gameObjects.paddle2;
	}

	const limit = width - (2 * paddleWidth);
	const ballXSide = Math.abs(ball.x) + ballSize;
	const ballYSide = Math.abs(ball.y) + ballSize;

	if (ballXSide >= limit)
	{
		const ballBoundingBox = BoundingBox(ball.x, ball.y, ballSize, ballSize);
		const paddleBoundingBox = BoundingBox(paddle.x, paddle.y, paddleWidth, paddleHeight);

		if (boundingBoxCollide(ballBoundingBox, paddleBoundingBox)) {
			ball.setPos([(limit - ballSize) * Math.sign(ball.x), ball.y, ball.z]);
			ball.speedX = -ball.speedX;

			let relBallY = ball.y - paddle.y;
			let nrmlrelBallY = relBallY / (paddleHeight + ballSize);

			const maxAngle = Math.PI*5 / 12;
			const angle = nrmlrelBallY * maxAngle;
			const speed = Math.sqrt(ball.speedX ** 2 + ball.speedY ** 2);

			ball.speedX = speed * Math.cos(angle) * Math.sign(ball.speedX);
			ball.speedY = speed * Math.sin(angle);

			if (speedMult < MAX_BALL_SPEED_MULTIPLIER) 
				speedMult = Math.min(speedMult + BALL_SPEED_INCREASE, MAX_BALL_SPEED_MULTIPLIER);
			
			return true; // Collision occurred
		}
	}
	if (ballYSide >= height) {
		ball.setPos([ball.x, (height - ballSize) * Math.sign(ball.y), ball.z]);
		ball.speedY = -ball.speedY;
		return (true)
	}

	return false; // No collision with paddles
}

function movePlayers(deltaTime)
{
	const step = paddleHeight / 12;
	const speed = (step * (1 + ((speedMult / MAX_BALL_SPEED_MULTIPLIER) * MAX_PADDLE_SPEED_MULTIPLIER)) * (deltaTime / 10));
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
}