import { PongGame } from "./pong-game/3dpong.js";
import { PlayerMovementProvider, AiMovementProvider } from "./pong-game/pongNewMovement";
import '../../shared.js';
import { setupPage } from "../../shared.js";

let pongInstance;

let SCORE_TO_WIN = 0;

let player1_type = true;
let player2_type = true;



function start_game()
{
	if (pongInstance === null)
	{
		console.warn("your pong instance is invalid");
		return;
	}
	let player1_provider;
	let player2_provider;

	let game_section = document.getElementById('game');
	if (game_section)
		game_section.scrollIntoView();

	if (player1_type)
		player1_provider = new PlayerMovementProvider({83: 0, 87: 1}, "paddle1", pongInstance);
	else
		player1_provider = new AiMovementProvider("paddle1", pongInstance);

	if (player2_type)
		player2_provider = new PlayerMovementProvider({40: 0, 38: 1}, "paddle2", pongInstance);
	else
		player2_provider = new AiMovementProvider("paddle2", pongInstance);
	let player1 = document.getElementById("player1-name")?.value ?? "player1";
	let player2 = document.getElementById("player2-name")?.value ?? "player2";
	pongInstance.startMatch(player1, player2, SCORE_TO_WIN, [player1_provider, player2_provider]);
}

function stop_game()
{
	if (pongInstance === null)
	{
		console.warn("your pong instance is invalid");
		return;
	}
	let parameter_section = document.getElementById('parameters')
	if (parameter_section)
		parameter_section.scrollIntoView();
	pongInstance.stopMatch();
	pongInstance.resetMatch(1);
}

function player_switch()
{
	// console.log('click!');
	if (this.id === "player1-switch")
		player1_type = !player1_type;
	if (this.id === "player2-switch")
		player2_type = !player2_type;
}

function ctor()
{
	pongInstance = PongGame.create("gameField", "score-player1", "score-player2", "change-theme-button", "view-button");
	let start_game_button = document.getElementById('start-game-button');
	let stop_game_button = document.getElementById('stop-game-button');
	let player1_switch = document.getElementById('player1-switch');
	let player2_switch = document.getElementById('player2-switch');
	if (start_game_button)
		start_game_button.addEventListener('click', start_game);
	if (stop_game_button)
		stop_game_button.addEventListener('click', stop_game);
	if (player1_switch)
	{
		player1_switch.addEventListener('click', player_switch);
		player1_switch.addEventListener('click', player_switch);
	}
	if (player2_switch)
		player2_switch.addEventListener('click', player_switch);
}

function dtor()
{
	pongInstance.cleanup();
	console.log("cleanup called!");
	removeEventListener('click', start_game);
	removeEventListener('click', stop_game);
	removeEventListener('click', player_switch);
}

setupPage(ctor, dtor);