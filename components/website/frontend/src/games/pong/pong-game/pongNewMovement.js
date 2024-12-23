import { BASE_PADDLE_SPEED, MAX_BALL_SPEED_MULTIPLIER, MAX_PADDLE_SPEED_MULTIPLIER, speedMult, height, paddleHeight } from './3dpong.js'
import { gameObjects } from './3dpong.js';

export function movePlayers(deltaTime, movementProviders)
{
	const speed = (BASE_PADDLE_SPEED * (1 + ((speedMult / MAX_BALL_SPEED_MULTIPLIER) * MAX_PADDLE_SPEED_MULTIPLIER)) * (deltaTime / 10));
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

class MovementProvider
{
	constructor()
	{
		this.key_values = [false, false];
	}
}

class PlayerMovementProvider extends MovementProvider
{
	constructor(keymap)
	{
		if (typeof(keymap) == 'object')
		{
			this.keymap = keymap;
		}
		else
			this.keymap = {};
		super();
	}
	keyUp(event)
	{
		const moveIndex = keyMap[event.keyCode];
		if (moveIndex !== undefined) {
			event.preventDefault();
			this.keymap[moveIndex] = false;
		}
	}
	keyDown(event)
	{
		const moveIndex = keyMap[event.keyCode];
		if (moveIndex !== undefined) {
			event.preventDefault();
			this.keymap[moveIndex] = true;
		}
	}
}

class AiMovementProvider extends MovementProvider
{
	constructor()
	{
		super();
	}

}