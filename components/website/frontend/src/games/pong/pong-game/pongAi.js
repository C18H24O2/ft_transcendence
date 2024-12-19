import {BASE_PADDLE_SPEED, MAX_BALL_SPEED_MULTIPLIER, MAX_PADDLE_SPEED_MULTIPLIER, speedMult, height, paddleHeight } from './3dpong.js'
import { gameObjects } from './3dpong.js';

let player_controlled = "paddle1";

export function movePlayers(deltaTime)
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
	//TODO: get an actual AI lmao


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


//in this module player 2 is controlled by an AI opponent
let keyMap = {
	83: 0,	//player 1 down
	87: 1,	//player 1 up
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


//not sure if its needed but might as well add it
function swapPlayer()
{
	player_controlled = player_controlled == "paddle1" ? "paddle2" : "paddle1";
	if (player_controlled == "paddle1") 
	{
		keyMap = {
			83: 0,	//player 1 down
			87: 1,	//player 1 up
		};
	}
	else
	{
		keymap = {
			40: 0,	//player 2 down
			38: 1,	//player 2 up
		};
	}
}

export function init_controls()
{
	document.addEventListener('keydown', keyDown);
	document.addEventListener('keyup', keyUp);
}

export function remove_controls()
{
	document.removeEventListener('keydown', keyDown);
	document.removeEventListener('keyup', keyUp);
}