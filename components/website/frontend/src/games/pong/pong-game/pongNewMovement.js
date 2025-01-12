// @ts-check

import { BASE_PADDLE_SPEED, MAX_BALL_SPEED_MULTIPLIER, MAX_PADDLE_SPEED_MULTIPLIER, speedMult, height, width, paddleHeight, paddleWidth, ballSize, BASE_BALL_SPEED } from './3dpong.js'
import { gameObjects } from './3dpong.js';
import { GameObject } from './pong-classes.js';

import { ShapeMaker } from './pong-classes.js';


export function movePlayers(deltaTime, movementProviders)
{
	const speed = (BASE_PADDLE_SPEED * (1 + ((speedMult / MAX_BALL_SPEED_MULTIPLIER) * MAX_PADDLE_SPEED_MULTIPLIER)) * (deltaTime / 10));
	const limit = height - paddleHeight;

	if (movementProviders[0].key_values[0] != movementProviders[0].key_values[1])
	{
		if (movementProviders[0].key_values[0] && gameObjects[movementProviders[0].paddle_name].y > -limit)
		{
			let paddle = gameObjects[movementProviders[0].paddle_name];
			paddle.move([0, -speed, 0]);
			if (paddle.y < -limit)
				paddle.setPos([paddle.x, -limit, paddle.z]);
		}
		if (movementProviders[0].key_values[1] && gameObjects[movementProviders[0].paddle_name].y < limit)
		{
			let paddle = gameObjects[movementProviders[0].paddle_name];
			paddle.move([0, speed, 0]);
			if (paddle.y > limit)
				paddle.setPos([paddle.x, limit, paddle.z]);
		}
	}
	if (movementProviders[1].key_values[0] != movementProviders[1].key_values[1])
	{
		if (movementProviders[1].key_values[0] && gameObjects[movementProviders[1].paddle_name].y > -limit)
		{
			let paddle = gameObjects[movementProviders[1].paddle_name];
			paddle.move([0, -speed, 0]);
			if (paddle.y < -limit)
				paddle.setPos([paddle.x, -limit, paddle.z]);
		}
		if (movementProviders[1].key_values[1] && gameObjects[movementProviders[1].paddle_name].y < limit)
		{
			let paddle = gameObjects[movementProviders[1].paddle_name];
			paddle.move([0, speed, 0]);
			if (paddle.y > limit)
				paddle.setPos([paddle.x, limit, paddle.z]);
		}
	}
}

/**
 * @prop {String} paddle_name
 * @prop {[boolean, boolean]} key_values
 */
export class MovementProvider
{
	constructor(paddle_name = "paddle1")
	{
		this.paddle_name = paddle_name;
		this.key_values = [false, false];
	}
	initMovement()
	{
		return;
	}
	destroyMovement()
	{
		return;
	}
	pollPlayer()
	{
		return;
	}
	resetPlayer()
	{
		return;
	}
}

/**
 * @prop {Object} key_map
 */
export class PlayerMovementProvider extends MovementProvider
{
	constructor(keymap, paddle_name)
	{
		super(paddle_name);
		if (typeof(keymap) == 'object')
		{
			this.keymap = keymap;
		}
		else
			this.keymap = {};
		this.keyDown = this.keyDown.bind(this);
		this.keyUp = this.keyUp.bind(this);
	}
	keyUp(event)
	{
		const moveIndex = this.keymap[event.keyCode];
		if (moveIndex !== undefined) {
			event.preventDefault();
			this.key_values[moveIndex] = false;
		}
	}
	keyDown(event)
	{
		const moveIndex = this.keymap[event.keyCode];
		if (moveIndex !== undefined) {
			event.preventDefault();
			this.key_values[moveIndex] = true;
		}
	}
	initMovement()
	{
		console.log("setup movement");
		document.addEventListener('keydown', this.keyDown);
		document.addEventListener('keyup', this.keyUp);
	}
	destroyMovement()
	{
		console.log("destroyed movement");
		document.removeEventListener('keydown', this.keyDown);
		document.removeEventListener('keyup', this.keyUp);
	}
}

function moveBall(deltaTime, ball_representation)
{
	let movementX = speedMult * ball_representation[2] * (deltaTime / 10);
	let movementY = speedMult * ball_representation[3] * (deltaTime / 10);
	// console.log("expected:" + deltaTime);

	// console.log("before steps: x=" + ball_representation[0] + " y=" + ball_representation[1])
	console.log(`[AI] move ${movementX}*${movementY}`)
	

	const steps = Math.ceil(Math.max(Math.abs(movementX), Math.abs(movementY)) / ballSize);
	const stepX = movementX / steps;
	const stepY = movementY / steps;

	console.log(`[AI] running ${steps} times ${stepX}*${stepY}`)

	for (let i = 0; i < steps; i++)
	{
		ball_representation[0] += stepX;
		ball_representation[1] += stepY;
		if (ballCollide(ball_representation))
			break;
	}

	// console.log("after steps: x=" + ball_representation[0] + " y=" + ball_representation[1])
}

function ballCollide(ball_representation)
{

	const limit = width - (2 * paddleWidth);
	const ballXSide = Math.abs(ball_representation[0]) + ballSize;
	const ballYSide = Math.abs(ball_representation[1]) + ballSize;

	if (ballXSide >= limit)
		return true;
	if (ballYSide >= height)
	{
		ball_representation[1] = (height - ballSize) * Math.sign(ball_representation[1]);
		ball_representation[3] = -ball_representation[3];
		return (false)
	}
	return false;
}

/**
 * @prop {Number} polling_id
 * @prop {Array} current_representation
 */
export class AiMovementProvider extends MovementProvider
{
	constructor(paddle_name)
	{
		super(paddle_name);
		this.polling_id = undefined;
		this.current_paddle_pos = 0;
		this.ball_representation = [0, 0, 0, 0]; //fuck you i'm doing an array
		this.then = Date.now();
		this.updateObjects = this.updateObjects.bind(this);
	}
	initMovement()
	{
		this.polling_id = setInterval(this.updateObjects, 1000);
	}
	destroyMovement()
	{
		if (this.polling_id != undefined)
			clearInterval(this.polling_id);
	}
	updateObjects()
	{
		this.current_paddle_pos = gameObjects[this.paddle_name].y;
		this.ball_representation = [gameObjects.ball.x, gameObjects.ball.y, gameObjects.ball.speedX, gameObjects.ball.speedY];
		this.then = Date.now();
	}
	pollPlayer()
	{
		let now = Date.now();
		let deltaTime = now - this.then;
		this.then = now;

		const speed = (BASE_PADDLE_SPEED * (1 + ((speedMult / MAX_BALL_SPEED_MULTIPLIER) * MAX_PADDLE_SPEED_MULTIPLIER)) * (deltaTime / 10));
		const limit = height - paddleHeight;
		
		if (this.key_values[0] == true)
		{
			this.current_paddle_pos -= speed;
			if (this.current_paddle_pos < -limit)
				this.current_paddle_pos = -limit;
		}
		if (this.key_values[1] == true)
		{
			this.current_paddle_pos += speed;
			if (this.current_paddle_pos > limit)
				this.current_paddle_pos = limit;
		}
		
		moveBall(deltaTime, this.ball_representation);
		//console.log(this.current_paddle_pos)
		//console.log(this.ball_representation);

		if (this.ball_representation[1] < this.current_paddle_pos - paddleHeight / 4)
		{
			this.key_values[0] = true;
			this.key_values[1] = false;
		}
		else if (this.ball_representation[1] > this.current_paddle_pos + paddleHeight / 4)
		{
			this.key_values[1] = true;
			this.key_values[0] = false;
		}
		else
		{
			this.key_values[0] = false;
			this.key_values[1] = false;
		}

		gameObjects.my_ball.setPos([this.ball_representation[0], this.ball_representation[1], 0]);
		gameObjects.my_paddle.setPos([gameObjects.my_paddle.x, this.current_paddle_pos, 0]);
	}
	resetPlayer()
	{
		this.then = Date.now();
		this.current_paddle_pos = 0;
		this.ball_representation = [0, 0, BASE_BALL_SPEED, 0];
		this.key_values = [false, false];
	}
}