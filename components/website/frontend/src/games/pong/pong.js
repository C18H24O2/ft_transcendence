import {BASE_PADDLE_SPEED, MAX_BALL_SPEED_MULTIPLIER, MAX_PADDLE_SPEED_MULTIPLIER, speedMult, height, paddleHeight } from './pong-game/3dpong.js'
import { startMatch, gameObjects } from './pong-game/3dpong.js';

function movePlayers(deltaTime)
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

let keyPress = [
	false,	//player 1 down
	false,	//player 1 up
	false,	//player 2 down
	false,	//player 2 up
];

export function pongSetPlayerMove(index, value)
{
	if (typeof(index) !== "number" || typeof(value) !== "boolean")
		return;
	keyPress[index] = value;
}

const keyMap = {
	83: 0,	//player 1 down
	87: 1,	//player 1 up
	40: 2,	//player 2 down
	38: 3,	//player 2 up
};

function keyUp(event)
{
	const moveIndex = keyMap[event.keyCode];
	if (moveIndex !== undefined) {
		pongSetPlayerMove(moveIndex, false);
	}
}

function keyDown(event)
{
	const moveIndex = keyMap[event.keyCode];
	if (moveIndex !== undefined) {
		pongSetPlayerMove(moveIndex, true);
		if (moveIndex > 1)
			event.preventDefault();
	}
}

document.addEventListener('keydown', keyDown);
document.addEventListener('keyup', keyUp);
startMatch("player1", "player2", 0, movePlayers);
