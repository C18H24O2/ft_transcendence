import './pong-game/3dpong.js'
import '../../shared.js'
import { viewSwitch } from './pong-game/3dpong.js'

var playerlist;
var next_playerlist;

function add_entry(name)
{
	if (!name || typeof(name) !== String)
		return
	playerlist.push(name);
}

function start_tournament()
{
	while (true)
	{
		var player1 = playerlist.shift();
		var player2 = playerlist.shift();
		winner = startMatch(player1, player2, 5);

		if (winner == 1)
			next_playerlist.push(player1);
		else
			next_playerlist.push(player2);
		if (playerlist.length == 1)
			next_playerlist.push(playerlist.shift());
		if (playerlist.length == 0)
		{
			if (next_playerlist.length < 2)
				return (next_playerlist.pop());
			playerlist = next_playerlist.splice(0, next_playerlist.length -1);
		}
	}
}

window.start_tournament = start_tournament;
window.add_entry = add_entry;