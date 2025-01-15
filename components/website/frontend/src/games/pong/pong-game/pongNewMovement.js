// @ts-check

import { 
	BASE_PADDLE_SPEED, 
	MAX_BALL_SPEED_MULTIPLIER, 
	MAX_PADDLE_SPEED_MULTIPLIER, 
	speedMult, 
	height, 
	width, 
	paddleHeight, 
	paddleWidth, 
	ballSize, 
} from './3dpong.js'

import { gameObjects } from './3dpong.js';
import { GameObject } from './pong-classes.js';

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
		document.addEventListener('keydown', this.keyDown);
		document.addEventListener('keyup', this.keyUp);
	}
	destroyMovement()
	{
		document.removeEventListener('keydown', this.keyDown);
		document.removeEventListener('keyup', this.keyUp);
	}
}

function moveBall(deltaTime, ball)
{
	let movementX = speedMult * ball.speedX * (deltaTime / 10);
	let movementY = speedMult * ball.speedY * (deltaTime / 10);

	const steps = Math.ceil(Math.max(Math.abs(movementX), Math.abs(movementY)) / ballSize);
	const stepX = movementX / steps;
	const stepY = movementY / steps;

	for (let i = 0; i < steps; i++)
	{
		ball.move([stepX, stepY, 0]);
		if (ballCollideFake(ball)) {
			break;
		}
	}
}

function ballCollideFake(ball)
{

	const limit = width - (2 * paddleWidth);
	const ballXSide = Math.abs(ball.x) + ballSize;
	const ballYSide = Math.abs(ball.y) + ballSize;

	if (ballXSide >= limit)
	{
		ball.speedX *= -1;
		return true;
	}
	if (ballYSide >= height)
	{
		ball.setPos([ball.x, (height - ballSize) * Math.sign(ball.y), ball.z]);
		ball.speedY = -ball.speedY;
		return (true);
	}
	return (false);
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
		this.current_paddle_pos = 0;
		this.ball = new GameObject(null, 0, 0, 0);
		this.then = Date.now();
		this.last_update = Date.now();
	}
	initMovement()
	{
		this.last_update = Date.now();
		this.updateObjects();
	}
	updateObjects()
	{
		this.current_paddle_pos = gameObjects[this.paddle_name].y;
		this.ball.x = gameObjects.ball.x;
		this.ball.y = gameObjects.ball.y;
		this.ball.speedX = gameObjects.ball.speedX;
		this.ball.speedY = gameObjects.ball.speedY;
		this.then = Date.now();
	}
	pollPlayer()
	{
		let now = Date.now();
		let deltaTime = now - this.then;
		this.then = now;

		if (now - this.last_update >= 1000)
		{
			this.last_update = now;
			this.updateObjects();
		}
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
		
		moveBall(deltaTime, this.ball);

		if (this.ball.y < this.current_paddle_pos - paddleHeight / 10)
		{
			this.key_values[0] = true;
			this.key_values[1] = false;
		}
		else if (this.ball.y > this.current_paddle_pos + paddleHeight / 10)
		{
			this.key_values[1] = true;
			this.key_values[0] = false;
		}
		else
		{
			this.key_values[0] = false;
			this.key_values[1] = false;
		}

		
		//debug values
		// gameObjects.my_ball.setPos([this.ball.x, this.ball.y, 0]);
		// gameObjects.my_ball.speedX = this.ball.speedX;
		// gameObjects.my_ball.speedY = this.ball.speedY;
		// gameObjects.my_paddle.setPos([gameObjects.my_paddle.x, this.current_paddle_pos, 0]);
	}
	resetPlayer()
	{
		this.then = Date.now();
		this.current_paddle_pos = 0;
		this.ball.setPos([0, 0, 0])
		this.ball.speedX = gameObjects.ball.speedX;
		this.ball.speedY = gameObjects.ball.speedY;
		this.key_values = [false, false];
	}
}
