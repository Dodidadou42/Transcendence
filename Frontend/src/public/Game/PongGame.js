/***********************************************************************************/
/*                                  Pong Game                                      */
/***********************************************************************************/

import {pageStatus} from './Website.js';
import {GetStatus, UpdateStatus} from './Website.js';
import {getCSRFToken} from './Website.js';
import {me_user_id, socket} from "./Website.js";

let page = ""

export function LoadPage() {
	const child = document.getElementById('website');
	if (!child) {return ;}
	if (page != "") {
		child.innerHTML = page;
		Page();
	} else {
		var cssLink = document.createElement('link');
		cssLink.rel = 'stylesheet';
		cssLink.href = './PongGame.css';
		document.head.appendChild(cssLink);
        cssLink.onload = function() {
            fetch('PongGame.html')
            .then(response => response.text())
            .then(html => {
                page = html;
                child.innerHTML = page;
				child.classList.remove("hidden")
				Page()
            });
        }
	}
	document.title = "Game";
}

export function UnloadPage() {
	UpdateStatus("");
	
	document.removeEventListener('keydown', handleKeyInput);
	document.removeEventListener('keyup', handleKeyRelease);
}

function Page() {
	document.addEventListener('keydown', handleKeyInput);
	document.addEventListener('keyup', handleKeyRelease);
	UpdateStatus(pageStatus.Game);
	sendRequestDraw();
}

const KEY_ACTIONS = {
    'ArrowLeft': "LEFT",
    'ArrowUp': "UP",
    'ArrowDown': "DOWN",
    'Space': "SPACE"
};

let keyPressed = {
	'ArrowUp' : false,
	'ArrowDown' : false,
	'ArrowLeft' : false 
}

let LastPressed = {
	'ArrowUp' : new Date().getTime(),
	'ArrowDown' : new Date().getTime(),
	'ArrowLeft' : new Date().getTime()
}

async function handleKeyInput(key){
	
	if (key.key != 'ArrowLeft' && key.key != 'ArrowUp' && key.key != 'ArrowDown')
		return;
	const action_key = KEY_ACTIONS[key.key];

	const now = new Date().getTime();
	if (keyPressed[key.key] || (now - LastPressed[key.key] <= 200 && key.key != 'ArrowLeft'))
		return;
	LastPressed[key.key] = now;

	if (socket && socket.readyState === WebSocket.OPEN) {
		keyPressed[key.key] = true;
		socket.send(JSON.stringify({'event_type': "key_press", 'action': action_key}));
	} else {
		showNotificationError("Error with Websocket");
	}
}

async function handleKeyRelease(key){
	if (key.key != 'ArrowLeft' && key.key != 'ArrowUp' && key.key != 'ArrowDown')
		return;
    const action_key = KEY_ACTIONS[key.key];
	if (!keyPressed[key.key])
		return;

	if (socket && socket.readyState === WebSocket.OPEN) {
		keyPressed[key.key] = false;
		socket.send(JSON.stringify({'event_type': "key_release", 'action': action_key}));
	} else {
		showNotificationError("Error with Websocket");
	}
}


async function sendRequestDraw() {
	if (socket && socket.readyState === WebSocket.OPEN) {
		socket.send(JSON.stringify({'event_type': "request_draw"}));
	} else {
		showNotificationError("Error with Websocket");
	}
}

let lastDataReceived = null;

export function receiveDraw(data, user_id) {
	if (GetStatus() == pageStatus.Game) {
		PongGameDraw(data);
	}
}

function PongGameDraw(data) {
	lastDataReceived = data;
	attemptDraw();
}

async function attemptDraw(){
	if (lastDataReceived)
	{ 
		await PongDraw(lastDataReceived); 
		lastDataReceived = null;
	}
}

async function PongDraw(data){
	let WaitingScreen = document.getElementById("WaitingScreen_game");
	if (WaitingScreen) {WaitingScreen.classList.add("hidden");};

	let canvas = document.getElementById('canvasGame_game');
	if (canvas) {
		let context = canvas.getContext('2d');

		canvas.width = window.innerWidth;
		canvas.height = window.innerHeight;
		let ratio_width = canvas.width / 1920
		let ratio_height = canvas.height / 1080
		let G_SIZE = canvas.width + canvas.height
		let ratio_global = G_SIZE / 3000

		context.fillStyle = 'black';
		context.fillRect(0, 0, canvas.width, canvas.height);
		


		context.strokeStyle = 'white';
		context.beginPath();
		context.moveTo(canvas.width / 2, 0);
		context.lineTo(canvas.width / 2, canvas.height);
		context.stroke();

		let score_left = data["score_left"];
		let score_right = data["score_right"]

		let i = 0;

		while (1) {
			if (!(("px" + i) in data))
				break;

			let px = data["px" + i];
			let py = data["py" + i];
			let pheight = data["pheight" + i];
			let pwidth = data["pwidth" + i];
			let visible = data["visible" + i];
			let borderColor = data["borderColor" + i];
			let borderColorVisible = data["borderColorVisible" + i];
			let status_ice = data["status_ice" + i];
			let bounce_animation_status = data["bounce_animation_status" + i];
			let bounce_animation_x = data["bounce_animation_x" + i];
			let bounce_animation_y = data["bounce_animation_y" + i];
			let bounce_animation_src = data["bounce_animation_src" + i];
			let press_left_visible = data["pressLeftVisible" + i];
			let press_left_animation_status = data["pressLeftAnimationState" + i];
			let pseudo = data["pseudo" + i];

			if (visible){
				if (borderColorVisible)
					context.fillStyle = borderColor;
				else
					context.fillStyle = status_ice === true ? 'cyan' : 'white';
				context.fillRect(px * ratio_width, py * ratio_height, pwidth * ratio_width, pheight * ratio_height);
				context.fillStyle = status_ice === true ? 'cyan' : 'white';
				context.fillRect(px * ratio_width + 2, py * ratio_height + 2, pwidth * ratio_width - 4, pheight * ratio_height - 4);
			}
			if (press_left_visible){
				let imageLeft = new Image()
				imageLeft.src = press_left_animation_status == 0 ? "./pressleft0.png" : "./pressleft1.png"
				let leftx = px < 1920 / 2 ? (px + pwidth) * ratio_width : px * ratio_width - G_SIZE / 35; 
				context.drawImage(imageLeft, leftx, (py + pheight - G_SIZE / 27) * ratio_height, G_SIZE / 35, G_SIZE / 35);
			}
			let j = 0;
			while (1){
				if (!(("particlex" + i + j) in data))
					break;
				let partx = data["particlex" + i + j];
				let party = data["particley" + i + j];
				let partheight = data["particleheight" + i + j];
				let partwidth = data["particlewidth" + i + j];
				let partopacity = data["particleopacity" + i + j]
				context.globalAlpha = partopacity;
				context.fillStyle = 'cyan';
				context.fillRect(partx * ratio_width, party * ratio_height, partwidth * ratio_width, partheight * ratio_height);
				j++;
			}
			i++;
			context.fillStyle = 'white';
			context.globalAlpha = 1;

			if (bounce_animation_status === true && bounce_animation_src){
				let image = new Image();
				image.src = bounce_animation_src;
				context.drawImage(image, bounce_animation_x * ratio_width, bounce_animation_y * ratio_height, G_SIZE / 35, G_SIZE / 35);
			}

			document.fonts.load('1px "Orbitron"').then(function() {
				let fontSize = 1;
				context.font = '1px Orbitron'
				while (context.measureText(pseudo).width < (pheight - 10)* ratio_height && fontSize < pwidth * ratio_width){
					fontSize++;
					context.font = fontSize + 'px Orbitron';
				}
				let x = (px + (pwidth / 2) + 10) * ratio_width;
				let y = (py + (pheight / 2)) * ratio_height;
				context.save();
				context.translate(x, y);
				context.rotate(-Math.PI / 2);
				context.font = fontSize - 1 +'px "Orbitron"';
				context.textAlign = 'center';
				context.fillStyle = 'black';
				context.fillText(pseudo, 0, 0);
				context.restore();
			})
		}

		i = 0;
		while (1) {
			if (!(("powerupname" + i) in data))
				break;

			let image = new Image();
			let img_name = "./" + data["powerupname" + i] + ".png";

			image.src = img_name;
			context.drawImage(image, data["powerupx" + i] * ratio_width, data["powerupy" + i] * ratio_height, G_SIZE / 22.4 , G_SIZE / 22.4);
			i++
		}

		i = 0;
		while (1) {
			if (!(("ballx" + i) in data))
				break;

			let ballx = data["ballx" + i];
			let bally = data["bally" + i];
			let ballr = data["ballr" + i];
			let powerup_ice = data["powerup_ice" + i];

			context.beginPath();
			if (powerup_ice === true)
				context.fillStyle = 'cyan';
			else
				context.fillStyle = 'white';
			context.arc(ballx * ratio_width, bally * ratio_height, ballr * ratio_global, 0, Math.PI * 2, false);
			context.fill();
			i++;
		}

		let fontSize = G_SIZE / 35;
		document.fonts.load(fontSize + 'px "Press Start 2P"').then(function() {
			context.font = fontSize +'px "Press Start 2P"';
			context.textAlign = 'right';
			context.fillStyle = 'blue';
			context.fillText(score_left, (canvas.width / 2) - 10 * ratio_width, fontSize + 15 * ratio_height);
			context.fillStyle = 'red';
			context.textAlign = 'left';
			context.fillText(score_right, (canvas.width / 2) + 19 * ratio_width, fontSize + 15 * ratio_height);
		});
	};
}

export async function receiveGameResult(data, user_id) {
	if (data.winner == user_id || data.winner2 == user_id) {
		let WinnerScreen = document.getElementById('WinnerScreen_game');
		if (WinnerScreen) {WinnerScreen.classList.remove("hidden");};
	} else {
		let LoserScreen = document.getElementById('LoserScreen_game');
		if (LoserScreen) {LoserScreen.classList.remove("hidden");};
	}
}

export async function receiveEndGame(data, user_id) {
	if (window.location.hash == pageStatus.Game)
		window.location.hash = pageStatus.DashboardSocialGameDetails + "&game=" + data.game_id;
}

export async function receiveEndRoundTournament(data, user_id) {
	window.location.hash = pageStatus.DashboardTournament;
}

export async function receiveRedirectToGame(data, user_id) {
	if (window.location.hash != pageStatus.DashboardHome)
		window.location.hash = pageStatus.Game;
}

export async function receiveRedirectToDash(data, user_id) {
	if (window.location.hash == pageStatus.Game)
		window.location.hash = pageStatus.DashboardHome;
}

export async function receiveMinusTimer(data, user_id) {
	if (GetStatus() == pageStatus.Game) {
		let TimerScreenNumber = document.getElementById('TimerScreenNumber_game');
		let TimerScreen = document.getElementById('TimerScreen_game');

		if (TimerScreenNumber && TimerScreen) {
			if (data.timer == '3') {
				TimerScreenNumber.innerText = '3';
				TimerScreen.classList.remove("hidden");
			} else if (data.timer == '2') {
				TimerScreenNumber.innerText = '2';
				TimerScreen.classList.remove("hidden");
			} else if (data.timer == '1') {
				TimerScreenNumber.innerText = '1';
				TimerScreen.classList.remove("hidden");
			} else if (data.timer == '0') {
				TimerScreen.classList.add("hidden");
			};
		}
	}
}