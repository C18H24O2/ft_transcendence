import { getTheme } from '../../theme.js'
import { startMatch } from  './pong-game/3dpong.js'

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
		pong_set_player_move(moveIndex, false);
	}
}

function keyDown(event)
{
	const moveIndex = keyMap[event.keyCode];
	if (moveIndex !== undefined) {
		pong_set_player_move(moveIndex, true);
		if (moveIndex > 1)
			event.preventDefault();
	}
}

startMatch(keyDownFunc = keyDown, keyUpFunc = keyUp);
