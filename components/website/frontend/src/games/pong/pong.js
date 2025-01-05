import { startMatch } from "./pong-game/3dpong";
import { PlayerMovementProvider, AiMovementProvider, movePlayers } from "./pong-game/pongNewMovement";

let mode = false; //false is pvp, true is against ai opponent
let player1 = "player1";
let player2 = "player2";

let SCORE_TO_WIN = 0;

function pong()
{

	function start_a_game()
	{
		let player1_provider = new PlayerMovementProvider({83: 0, 87: 1}, "paddle1");
		//let player2_provider = new AiMovementProvider("paddle2");
		let player2_provider = new PlayerMovementProvider({38: 0, 40: 1}, "paddle2");
		startMatch(player1, player2, SCORE_TO_WIN, movePlayers, [player1_provider, player2_provider]);
	}
	window.start_a_game = start_a_game;
	start_a_game();
}

pong();
htmx.onLoad(pong);
