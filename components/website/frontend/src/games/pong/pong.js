import { startMatch } from "./pong-game/3dpong";
import * as pong_ai from "./pong-game/pongAi";
import * as pong_pvp from "./pong-game/pongAi";

let mode = false; //false is pvp, true is against ai opponent
let player1 = "player1";
let player2 = "player2";

let SCORE_TO_WIN = 0;

function pong()
{

	function start_a_game()
	{
		if (mode)
		{
			pong_pvp.remove_controls();
			pong_ai.init_controls();
			startMatch(player1, player2, SCORE_TO_WIN, pong_ai.movePlayers);
		}
		else
		{
			pong_ai.remove_controls();
			pong_pvp.init_controls();
			startMatch(player1, player1, SCORE_TO_WIN, pong_pvp.movePlayers);
		}
	}
	window.start_a_game = start_a_game;
}

pong();
htmx.onLoad(pong);