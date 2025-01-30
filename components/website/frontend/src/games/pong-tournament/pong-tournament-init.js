import { setupPage } from "../../shared";
import { PongGame } from "./pong-game/3dpong";
import { PlayerMovementProvider } from "./pong-game/pongNewMovement";
import butterup from 'butteruptoasts';
//import { chatSocket } from "../../chat/chat"//TODO trying websocket to send tournament info to chat

const TIMEOUT = 7;
const SCORE_TO_WIN = 5;

let pongInstance;
let player1_provider;
let player2_provider;
let playerlist;
let origPlayerlist;
let next_playerlist;
let toRemove;
let listSection;
let gameField;
let form;
let tournamentStarted;


function removeEntry(playerRemoveButton)
{
	if (pongInstance.gameStarted) return;
	let i = playerRemoveButton?.dataset?.playerIndex;
	if (i === null || i === undefined)
		return;
	origPlayerlist.splice(i, 1);
	renderList();
}

function addPlayer(name) {
	if (pongInstance.gameStarted) return;
	if (!name)
		return;
	if (name.length > 100)
		return;
	if (!origPlayerlist)
		return;
	if (origPlayerlist.indexOf(name + "") != -1)
		return;
	if (origPlayerlist.length > 32)
		return;
	origPlayerlist.push(name + "");
	renderList();
}

function renderList()
{
	let current_player_list = document.getElementById('player-list');
	if (!current_player_list)
		return;
	let newInnerHTML = "";

	let i = 0;
	for (let element of origPlayerlist)
	{
		if (toRemove.indexOf(element) != -1) {
			i++;
			continue;
		}
		let isDead = tournamentStarted && playerlist.indexOf(element) == -1 && next_playerlist.indexOf(element) == -1;
		let extra;
		if (i % 2 == 0)
			extra = " bg-surface1/70 hover:bg-overlay0";
		else
			extra = " bg-surface0/70 hover:bg-overlay0"
		if (isDead)
			extra += " line-through opacity-50";
		newInnerHTML += `<div class="flex flex-row justify-between align-middle items-center gap-4 p-1${extra}"> <span>${element}</span>`;
		if (!tournamentStarted)
			newInnerHTML += `<button onclick="removeEntry(this)" data-player-index="${i}" class="rounded-full font-semibold px-3 bg-red line-full">{{@ button.remove @}}</button>`
		newInnerHTML += "</div>"
		i++;
	}
	current_player_list.innerHTML = newInnerHTML;
}

function submitPlayer(event)
{
	// console.log("running playerlist update");
	if (pongInstance.gameStarted) return;
	event.preventDefault();
	let form = event.target;
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
}

function startMatchWrapper()
{
	if (!pongInstance)
		return;
	pongInstance.startMatch(playerlist[0], playerlist[1], SCORE_TO_WIN, [player1_provider, player2_provider]);
	renderList();
}

function startGame()
{
	gameField.scrollIntoView();
	setTimeout(startMatchWrapper, 1000);
}

function tournamentCountdownToast(seconds)
{
	if (seconds === 0)
	{
		form.style.display = "none";
		renderList();
	}
	butterup.toast({
		title: `{{@ tournament.info.tournament_countdown.title @}} ${seconds}..`,
		message: `${playerlist[0]} vs ${playerlist[1]}`,
		location: 'bottom-right',
		dismissable: true,
		icon: false,
		type: 'info',
	});
}

function matchCountdownToast(seconds)
{
	butterup.toast({
		title: `{{@ tournament.info.match_countdown.title @}} ${seconds}..`,
		message: `${playerlist[0]} vs ${playerlist[1]}`,
		location: 'bottom-right',
		dismissable: true,
		icon: false,
		type: 'info',
	});
}

let intervals;

function countdown(seconds, callback, toastFunc, ...callbackArgs)
{
	const interval = setInterval(() => {
		toastFunc(seconds);
		if (seconds <= 0)
		{
			clearInterval(interval);
			intervals.delete(interval);
			if (typeof callback === 'function')
				callback(...callbackArgs);
		}
		seconds--;
	}, 1000);
	intervals.add(interval);
}

function matchEnd()
{
	let winner;
	if (pongInstance.gameObjects.paddle1.score >= SCORE_TO_WIN)
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
	player1_provider.destroyMovement();
	player2_provider.destroyMovement();
	pongInstance.resetMatch(1);
	if (playerlist.length == 0)
	{
		if (next_playerlist.length < 2)
		{
			butterup.options.toastLife = 15000;
			butterup.toast({
				title: `${next_playerlist[0]} {{@ tournament.success.tournament_won.title @}}`,
				message: '{{@ tournament.success.tournament_won.desc @}}',
				location: 'bottom-right',
				dismissable: true,
				icon: false,
				type: 'success',
			});
			form.style.display = "";
			playerlist = [...origPlayerlist];
			next_playerlist = [];
			toRemove = [];
			tournamentStarted = false;
			renderList();
			document.removeEventListener('pong-game-end', matchEnd);
			document.removeEventListener('keydown', preventScroll);
			scroll(0, 0);
			return;
		}
		playerlist = next_playerlist.splice(0, next_playerlist.length);
	}

	renderList();
	
	if (winner == 1)
	{
		toRemove.push(player2);
		butterup.toast({
			title: `${player1} {{@ tournament.info.player_won.title @}}`,
			message: '{{@ tournament.info.player_won.desc @}}',
			location: 'bottom-right',
			dismissable: true,
			icon: false,
			type: 'info',
		});
	}
	else
	{
		toRemove.push(player1);
		butterup.toast({
			title: `${player2} {{@ tournament.info.player_won.title @}}`,
			message: '{{@ tournament.info.player_won.desc @}}',
			location: 'bottom-right',
			dismissable: true,
			icon: false,
			type: 'info',
		});
	}
	butterup.toast({
		title: '{{@ tournament.warning.next_match.title @}}',
		message: `${playerlist[0]} vs ${playerlist[1]}`,
		location: 'bottom-right',
		dismissable: true,
		icon: false,
		type: 'warning',
	});/*
	chatSocket.send(JSON.stringify({
		'type': 'chat.message',
		'message': "/mp" + ${playerlist[0]} + "your match will start soon."
	}));
	chatSocket.send(JSON.stringify({
		'type': 'chat.message',
		'message': "/mp" + ${playerlist[1]} + "your match will start soon."
	}));*/
	//TODO something like this should warn player if username match
	countdown(TIMEOUT, startGame, matchCountdownToast);
}

function preventScroll(event)
{
	if (["ArrowUp", "ArrowDown"].indexOf(event.code) > -1)
	{
		event.preventDefault();
	}
}

function startTournament()
{
	butterup.options.toastLife = 8000;
	if (tournamentStarted) return;
	if (pongInstance === null)
	{
		console.warn('your pong instance is invalid');
		return;
	}
	playerlist = [...origPlayerlist];
	if (playerlist.length < 2)
	{
		butterup.toast({
			title: `{{@ tournament.error.player_missing.title @}}`,
			location: 'bottom-right',
			dismissable: true,
			icon: false,
			type: 'error',
		});
		return;
	}
	document.addEventListener('keydown', preventScroll);
	document.addEventListener('pong-game-end', matchEnd);
	countdown(TIMEOUT, startGame, tournamentCountdownToast);
	tournamentStarted = true;
}

function ctor()
{
	scroll(0, 0);

	pongInstance = PongGame.create("gameField", "score-player1", "score-player2", "change-theme-button", "view-button");
	player1_provider = new PlayerMovementProvider({83: 0, 87: 1}, "paddle1");
	player2_provider = new PlayerMovementProvider({40: 0, 38: 1}, "paddle2");

	form = document.getElementById("add-player-form");
	listSection = document.getElementById("player-list-section");
	gameField = document.getElementById('gameField');

	playerlist = [];
	origPlayerlist = [];
	next_playerlist = [];
	toRemove = [];
	tournamentStarted = false;
	intervals = new Set();

	if (form)
		form.addEventListener('submit', submitPlayer);
	window.removeEntry = removeEntry;
	window.startTournament =startTournament;
	form.style.display = "";
	renderList();
}

function dtor()
{
	document.removeEventListener('pong-game-end', matchEnd);
	document.removeEventListener('keydown', preventScroll);
	player1_provider = null;
	player2_provider = null;
	gameField = null;
	listSection = null;
	form = null;
	
	pongInstance.cleanup();
	pongInstance = null;
	removeEventListener('submit', submitPlayer);
	window.removeEntry = null;
	window.startTournament = null;
	intervals.forEach(clearInterval);
}

setupPage(ctor, dtor);