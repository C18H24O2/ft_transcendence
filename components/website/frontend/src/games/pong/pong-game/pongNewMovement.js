// @ts-check

import { BASE_PADDLE_SPEED, MAX_BALL_SPEED_MULTIPLIER, MAX_PADDLE_SPEED_MULTIPLIER, speedMult, height, paddleHeight } from './3dpong.js'
import { gameObjects } from './3dpong.js';


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
class MovementProvider
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
		this.current_representation = [0, 0];
		this.then = Date.now();
		this.updateObjects = this.updateObjects.bind(this);
	}
	updateObjects()
	{
		this.current_representation[0] = gameObjects[this.paddle_name].y;
		this.current_representation[1] = gameObjects.ball.y;
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
			this.current_representation[0] -= speed;
			if (this.current_representation[0] < -limit)
				this.current_representation[0] = -limit;
		}
		if (this.key_values[1] == true)
		{
			this.current_representation[0] += speed;
			if (this.current_representation[0] > limit)
				this.current_representation[0] = limit;
		}

		if (this.current_representation[1] < this.current_representation[0])
		{
			this.key_values[0] = true;
			this.key_values[1] = false;
		}
		else if (this.current_representation[1] > this.current_representation[0])
		{
			this.key_values[1] = true;
			this.key_values[0] = false;
		}
		else
		{
			this.key_values[0] = false;
			this.key_values[1] = false;
		}
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
}