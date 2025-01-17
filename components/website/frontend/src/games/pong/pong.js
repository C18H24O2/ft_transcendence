import { startMatch } from "./pong-game/3dpong";
import { PlayerMovementProvider, AiMovementProvider, movePlayers } from "./pong-game/pongNewMovement";

function pong()
{
	//player names for later
	let player1 = "player1";
	let player2 = "player2";

	//true is player, false is ai
	let player1_type = true;
	let player2_type = true;

	let SCORE_TO_WIN = 0;
	

	/**
	 * 
	 * @param {String} name 
	 * @param {Number} index 
	 */
	function update_player_name(name, index)
	{
		if (index === 1)
			player1 = name;
		else
			player2 = name;
	}
	window.update_player_name = update_player_name;

	/**
	 * 
	 * @param {Number} index 
	 * @param {boolean} value 
	 */
	function update_player_type(index, value)
	{
		if (index === 1)
			player1_type = value;
		else
			player2_type = value;
	}
	window.update_player_type = update_player_type;

	function start_a_game()
	{
		let player1_provider;
		let player2_provider;

		if (player1_type)
			player1_provider = new PlayerMovementProvider({83: 0, 87: 1}, "paddle1");
		else
			player1_provider = new AiMovementProvider("paddle1");

		if (player2_type)
			player2_provider = new PlayerMovementProvider({40: 0, 38: 1}, "paddle2");
		else
			player2_provider = new AiMovementProvider("paddle2");

		startMatch(player1, player2, SCORE_TO_WIN, movePlayers, [player1_provider, player2_provider]);
	}
	window.start_a_game = start_a_game;


	start_a_game();
}

// pong();
htmx.onLoad(pong);
