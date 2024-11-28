import './pong-game/3dpong.js'
import { startMatch, viewSwitch, gameObjects } from './pong-game/3dpong.js'

function pong() {
	let playerlist = [];
	let origPlayerlist = [];
	let next_playerlist = [];
	let toRemove = [];
	let intervalid = -1; //to stop the poller once there is no match left to do

	const SCORE_TO_WIN = 5;

	let form = document.getElementById("add-player-form");
	let listSection = document.getElementById("player-list-section");
	let gameField = document.getElementById('gameField');

	if (!form || !gameField || !listSection) {
		return ;
	} else {

		function removeEntry(playerRemoveButton)
		{
			if (intervalid != -1) return;
			let i = playerRemoveButton?.dataset?.playerIndex;
			if (i === null || i === undefined)
				return;
			origPlayerlist.splice(i, 1);
			renderList();
		}

		function addPlayer(name) {
			if (intervalid != -1) return;
			if (!name)
				return;
			if (name.length > 100)
				return;
			if (origPlayerlist.indexOf(name + "") != -1)
				return;
			if (origPlayerlist.length > 32)
				return;
			origPlayerlist.push(name + "");
			renderList();
		}

		form.onsubmit = e => {
			if (intervalid != -1) return;
			e.preventDefault();
			let form = e.target;
			if (form === undefined) return;

			let data = new FormData(form);
			let name = data.get("player-name");
			if (!name) return;
			//if (name == "debug-test") {
			//	for (let i = 0; i < 32; i++) {
			//		addPlayer("Tournament Player #" + (i + 1));
			//	}
			//	return;
			//}
			addPlayer(name);
			data.set("player-name", "");
		};

		function renderList()
		{
			let current_player_list = document.getElementById('player-list');
			let newInnerHTML = "";

			let i = 0;
			let gameStarted = intervalid != -1;
			for (let element of origPlayerlist)
			{
				if (toRemove.indexOf(element) != -1) {
					i++;
					continue;
				}
				let isDead = gameStarted && playerlist.indexOf(element) == -1 && next_playerlist.indexOf(element) == -1;
				let extra;
				if (i % 2 == 0)
					extra = " bg-surface1/70 hover:bg-overlay0";
				else
					extra = " bg-surface0/70 hover:bg-overlay0"
				if (isDead)
					extra += " line-through opacity-50";
				newInnerHTML += `<div class="flex flex-row justify-between align-middle items-center gap-4 p-1${extra}"> <span>${element}</span>`;
				if (!gameStarted)
					newInnerHTML += `<button onclick="removeEntry(this)" data-player-index="${i}" class="rounded-full font-semibold px-3 bg-red line-full">Remove</button>`
				newInnerHTML += "</div>"
				i++;
			}
			current_player_list.innerHTML = newInnerHTML;
		}

		window.removeEntry = removeEntry;

		let winnerTimeout = 0;

		function pollGame()
		{
			let winner;

			if (gameObjects.paddle1.score < SCORE_TO_WIN && gameObjects.paddle2.score < SCORE_TO_WIN)
				return;
			
			if (winnerTimeout < 5) {
				if (winnerTimeout == 0) {
					console.log("we got a winner boys");
					//TODO: toast

					if (gameObjects.paddle1.score >= SCORE_TO_WIN)
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

					listSection.scrollIntoView();
					if (playerlist.length == 0)
					{
						if (next_playerlist.length < 2)
						{
							console.log(next_playerlist[0] + " wins the tournament!");
							//TODO: toast
							clearInterval(intervalid);
							intervalid = -1;
							form.style.display = "";
							playerlist = [...origPlayerlist];
							toRemove = [];
							renderList();
							return;
						}
						playerlist = next_playerlist.splice(0, next_playerlist.length);
					}

					renderList();
					if (winner == 1)
						toRemove.push(player2);
					else
						toRemove.push(player1);
				}
				winnerTimeout++;
			} else {
				winnerTimeout = 0;
				gameField.scrollIntoView();
				renderList();
				startMatch(playerlist[0], playerlist[1], SCORE_TO_WIN);
			}
		}

		function startTournament()
		{
			if (intervalid != -1) return;
			playerlist = [...origPlayerlist];
			if (playerlist.length < 2)
				return ("must at least have 2 players");
				//TODO: toast
			
			winnerTimeout = 0;
			gameField.scrollIntoView();
			//start the first game, it will then refresh itself automatically
			startMatch(playerlist[0], playerlist[1], SCORE_TO_WIN);
			intervalid = setInterval(pollGame, 1000);
			toRemove = [];
			renderList();
			form.style.display = "none";
			htmx.onLoad(e => {
				clearInterval(intervalid);
			});
		}
		window.startTournament = startTournament;
	}
}

pong();
htmx.onLoad(pong);
