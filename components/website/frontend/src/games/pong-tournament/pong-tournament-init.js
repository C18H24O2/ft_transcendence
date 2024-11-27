import './pong-game/3dpong.js'
import '../../shared.js'
import { startMatch, viewSwitch } from './pong-game/3dpong.js'

let current_game_objects; //to poll the current game's objects
let playerlist = [];
let next_playerlist = [];
let intervalid; //to stop the poller once there is no match left to do

let SCORE_TO_WIN = 1;

function removeEntry(playerRemoveButton)
{
	let i = playerRemoveButton?.dataset?.playerIndex;
	if (i === null || i === undefined)
		return;
	playerlist.remove(i);
	renderList();
}

function addEntry()
{
	let name = this.value;
	if (!name || typeof(name) !== String)
		return;
	if (playerlist.length > 32)
		return;
	playerlist.push(name);
	renderList();
}

function renderList()
{
	let current_player_list = document.getElementById('player-list');
	let newInnerHTML = "";

	let i = 0;
	for (element in playerlist)
	{
		newInnerHTML += `<div> <span class="items-center justify-center">${element}</span><button onclick="removeEntry(this)" data-player-index="${i}" class="rounded-full bg-red">X</button>&#x2715;</div>`
		i++;
	}
	current_player_list.innerHTML = newInnerHTML;
}

window.addEntry = addEntry;
window.removeEntry = removeEntry;

function pollGame()
{
	let winner;

	if (current_game_objects.paddle1.score < 5 && current_game_objects.paddle1.score < 5)
		return;
	
	if (current_game_objects.paddle1.score >= 5)
		winner = 1;
	else
		winner = 2;

	let player1 = playerlist.shift();
	let player2 = playerlist.shift();

	if (winner == 1)
		next_playerlist.push(player1);
	else
		next_playerlist.push(player2);
	if (playerlist.length == 1)
		next_playerlist.push(playerlist.shift());
	if (playerlist.length == 0)
	{
		if (next_playerlist.length < 2)
		{
			console.log(next_playerlist[0] + " wins the tournament!");
			clearInterval(intervalid);
			return;
		}
		playerlist = next_playerlist.splice(0, next_playerlist.length);
	}
	console.log()
	current_game_objects = startMatch(playerlist[0], playerlist[1], SCORE_TO_WIN);
}

function start_tournament()
{
	if (playerlist.length < 2)
		return ("must at least have 2 players");
	
	//start the first game, it will then refresh itself automatically
	current_game_objects = startMatch(playerlist[0], playerlist[1], SCORE_TO_WIN);
	setInterval(pollGame, 1000);
}
window.start_tournament = start_tournament;