// **********************************************************************
// 				Matchmaking Page
// **********************************************************************

import {pageStatus} from './Website.js';
import {GetStatus, UpdateStatus} from './Website.js';
import {getCSRFToken, showNotificationError} from './Website.js';
import {me_user_id, socket} from "./Website.js";
import {showNotification} from "./Website.js";

import {handleTitle} from './Dashboard.js';

import {set_selected_mode, get_selected_mode, set_custom, get_custom,
	set_custom_selected_mode, get_custom_selected_mode, 
	set_custom_power_active, get_custom_power_active,
	set_inviteForGroupPos, get_inviteForGroupPos,
	set_J1, get_J1, set_J2, get_J2, set_J3, get_J3, set_J4, get_J4, Modes} from './Dashboard.js';

import {toggleCount, searchUserInfos, sleep} from './Dashboard.js';

var page = "";

export async function LoadPage() {
	const child = document.getElementById('child1_dashboard');
	if (!child) {return ;}
	if (page != "") {
		child.innerHTML = page;
		Page();
	} else {
		var cssLink = document.createElement('link');
		cssLink.rel = 'stylesheet';
		cssLink.href = './DMatchmaking.css';
		document.head.appendChild(cssLink);
        cssLink.onload = function() {
            fetch('DMatchmaking.html')
            .then(response => response.text())
            .then(html => {
                page = html;
                child.innerHTML = page;
				child.classList.remove("hidden")
				Page()
            });
        }
	}
	UpdateStatus(pageStatus.DashboardMatchmaking);
	handleTitle('Matchmaking');
	document.title = 'Dashboard Matchmaking';
}

export function UnloadPage() {
	UpdateStatus("");

	set_selected_mode(Modes[0]);
	set_custom(false);
	set_custom_selected_mode(Modes[0]);
	set_custom_power_active(false);
	set_inviteForGroupPos(0);
	toggleCount(false);

	let matchmakingBody = document.getElementById('matchmakingBody');
	if (matchmakingBody) {matchmakingBody.classList.add('hidden');};

	let customGameBody = document.getElementById('customGameBody');
	if (customGameBody) {customGameBody.classList.add('hidden');};

	let joinGroupBody = document.getElementById('joinGroupBody');
	if (joinGroupBody) {joinGroupBody.classList.add('hidden');};
	
	let invitePlayerPanelSearchInput = document.getElementById('invitePlayerPanelSearchInput');
	if (invitePlayerPanelSearchInput) {invitePlayerPanelSearchInput.removeEventListener('input', (event) => {});};

	set_J1('none');
	set_J2('none');
	set_J3('none');
	set_J4('none');

	let cgAddBotButton2 = document.getElementById('cgAddBotButton2');
	if (cgAddBotButton2) {
		cgAddBotButton2.classList.remove('hidden');
		cgAddBotButton2.removeEventListener('click', function(event) {});
	};

	let cgInviteButton2 = document.getElementById('cgInviteButton2');
	if (cgInviteButton2) {
		cgInviteButton2.classList.remove('hidden');
		cgInviteButton2.removeEventListener('click', function(event) {});
	};

	let cgKickButton2 = document.getElementById('cgKickButton2');
	if (cgKickButton2) {
		cgKickButton2.classList.add('hidden');
		cgKickButton2.removeEventListener('click', function(event) {});
	};

	let cgAddBotButton3 = document.getElementById('cgAddBotButton3');
	if (cgAddBotButton3) {
		cgAddBotButton3.classList.remove('hidden');
		cgAddBotButton3.removeEventListener('click', function(event) {});
	};

	let cgInviteButton3 = document.getElementById('cgInviteButton3');
	if (cgInviteButton3) {
		cgInviteButton3.classList.remove('hidden');
		cgInviteButton3.removeEventListener('click', function(event) {});
	};

	let cgKickButton3 = document.getElementById('cgKickButton3');
	if (cgKickButton3) {
		cgKickButton3.classList.add('hidden');
		cgKickButton3.removeEventListener('click', function(event) {});
	};

	let cgAddBotButton4 = document.getElementById('cgAddBotButton4');
	if (cgAddBotButton4) {
		cgAddBotButton4.classList.remove('hidden');
		cgAddBotButton4.removeEventListener('click', function(event) {});
	};

	let cgInviteButton4 = document.getElementById('cgInviteButton4');
	if (cgInviteButton4) {
		cgInviteButton4.classList.remove('hidden');
		cgInviteButton4.removeEventListener('click', function(event) {});
	};

	let cgKickButton4 = document.getElementById('cgKickButton4');
	if (cgKickButton4) {
		cgKickButton4.classList.add('hidden');
		cgKickButton4.removeEventListener('click', function(event) {});
	};

	let ComeBackToSelection = document.getElementById('ComeBackToSelection');
	if (ComeBackToSelection) {ComeBackToSelection.removeEventListener('click', function(event) {});};

	let mode1v1Custom = document.getElementById('mode1v1Custom');
	if (mode1v1Custom) {mode1v1Custom.removeEventListener('click', function(event) {});};

	let mode2v2Custom = document.getElementById('mode2v2Custom');
	if (mode2v2Custom) {mode2v2Custom.removeEventListener('click', function(event) {});};

	let powerupsWheelsBox = document.getElementById('powerupsWheelsBox');
	if (powerupsWheelsBox) {powerupsWheelsBox.removeEventListener('click', function(event) {});};

	let addBotPanelBack = document.getElementById('addBotPanelBack');
	if (addBotPanelBack) {addBotPanelBack.removeEventListener('click', function(event) {});};

	let invitePlayerPanelBack = document.getElementById('invitePlayerPanelBack');
	if (invitePlayerPanelBack) {invitePlayerPanelBack.removeEventListener('click', function(event) {});};

	let cancelMatchmakingBack = document.getElementById('cancelMatchmakingBack');
	if (cancelMatchmakingBack) {cancelMatchmakingBack.removeEventListener('click', function(event) {});};

	let addEasyBOTbutton = document.getElementById('addEasyBOTbutton');
	if (addEasyBOTbutton) {addEasyBOTbutton.removeEventListener('click', function(event) {});};

	let addNormalBOTbutton = document.getElementById('addNormalBOTbutton');
	if (addNormalBOTbutton) {addNormalBOTbutton.removeEventListener('click', function(event) {});};

	let addHardBOTbutton = document.getElementById('addHardBOTbutton');
	if (addHardBOTbutton) {addHardBOTbutton.removeEventListener('click', function(event) {});};

	let CGGroupLeaveOther = document.getElementById('CGGroupLeaveOther');
	if (CGGroupLeaveOther) {CGGroupLeaveOther.removeEventListener('click', function(event) {});};

	let StartTheCustomGame = document.getElementById('StartTheCustomGame');
	if (StartTheCustomGame) {StartTheCustomGame.removeEventListener('click', function(event) {});};
}

async function Page() {

	let ComeBackToSelection = document.getElementById('ComeBackToSelection');
	if (ComeBackToSelection) {
		ComeBackToSelection.onclick = async () => {
			GroupLeaderLeaveCustom();
		}
	};

	let mode1v1Custom = document.getElementById('mode1v1Custom');
	if (mode1v1Custom) {
		mode1v1Custom.onclick = () => {
			CG_toggleMode(true, false);
		};
	};

	let mode2v2Custom = document.getElementById('mode2v2Custom');
	if (mode2v2Custom) {
		mode2v2Custom.onclick = () => {
			CG_toggleMode(false, false);
		};
	};

	let powerupsWheelsBox = document.getElementById('powerupsWheelsBox');
	if (powerupsWheelsBox) {
		powerupsWheelsBox.onclick = () => {
			CG_togglePowerUps();
		};
	};

	let cgAddBotButton2 = document.getElementById('cgAddBotButton2');
	if (cgAddBotButton2) {
		cgAddBotButton2.onclick = () => {
			ToggleBotPanel(2, true);
		}
	};

	let cgAddBotButton3 = document.getElementById('cgAddBotButton3');
	if (cgAddBotButton3) {
		cgAddBotButton3.onclick = () => {
			ToggleBotPanel(3, true);
		}
	};

	let cgAddBotButton4 = document.getElementById('cgAddBotButton4');
	if (cgAddBotButton4) {
		cgAddBotButton4.onclick = () => {
			ToggleBotPanel(4, true);
		}
	};

	let addBotPanelBack = document.getElementById('addBotPanelBack');
	if (addBotPanelBack) {
		addBotPanelBack.onclick = () => {
			ToggleBotPanel(0, false);
		}
	};

	let cgInviteButton2 = document.getElementById('cgInviteButton2');
	if (cgInviteButton2) {
		cgInviteButton2.onclick = () => {
			TogglePlayerInvitePanel(2, true);
		}
	};

	let cgInviteButton3 = document.getElementById('cgInviteButton3');
	if (cgInviteButton3) {
		cgInviteButton3.onclick = () => {
			TogglePlayerInvitePanel(3, true);
		}
	};

	let cgInviteButton4 = document.getElementById('cgInviteButton4');
	if (cgInviteButton4) {
		cgInviteButton4.onclick = () => {
			TogglePlayerInvitePanel(4, true);
		}
	};

	let invitePlayerPanelBack = document.getElementById('invitePlayerPanelBack');
	if (invitePlayerPanelBack) {
		invitePlayerPanelBack.onclick = () => {
			TogglePlayerInvitePanel(0, false);
		}
	};

	let invitePlayerPanelSearchInput = document.getElementById('invitePlayerPanelSearchInput');
	if (invitePlayerPanelSearchInput) {
		invitePlayerPanelSearchInput.addEventListener('input', (event) => {
			searchPeopleToGroupInviteCustom(event.target.value);
		});
	};

	let cancelMatchmakingBack = document.getElementById('cancelMatchmakingBack');
	if (cancelMatchmakingBack) {
		cancelMatchmakingBack.onclick = () => {
			if (socket && socket.readyState === WebSocket.OPEN) {
				socket.send(JSON.stringify({'event_type': "leaveMatchmaking"}));
			} else {
				showNotificationError("Error with Websocket");
			}
		}
	};

	let addEasyBOTbutton = document.getElementById('addEasyBOTbutton');
	if (addEasyBOTbutton) {
		addEasyBOTbutton.onclick = () => {
			AddBotMatchGroup('$easyBot', get_inviteForGroupPos());
		}
	};

	let addNormalBOTbutton = document.getElementById('addNormalBOTbutton');
	if (addNormalBOTbutton) {
		addNormalBOTbutton.onclick = () => {
			AddBotMatchGroup('$normalBot', get_inviteForGroupPos());
		}
	};

	let addHardBOTbutton = document.getElementById('addHardBOTbutton');
	if (addHardBOTbutton) {
		addHardBOTbutton.onclick = () => {
			AddBotMatchGroup('$hardBot', get_inviteForGroupPos());
		}
	};

	let cgKickButton2 = document.getElementById('cgKickButton2');
	if (cgKickButton2) {
		cgKickButton2.onclick = () => {
			KickPlayerOrBotMatchGroup(2);
		}
	};

	let cgKickButton3 = document.getElementById('cgKickButton3');
	if (cgKickButton3) {
		cgKickButton3.onclick = () => {
			KickPlayerOrBotMatchGroup(3);
		}
	};

	let cgKickButton4 = document.getElementById('cgKickButton4');
	if (cgKickButton4) {
		cgKickButton4.onclick = () => {
			KickPlayerOrBotMatchGroup(4);
		}
	};

	let CGGroupLeaveOther = document.getElementById('CGGroupLeaveOther');
	if (CGGroupLeaveOther) {
		CGGroupLeaveOther.onclick = () => {
			CGLeaveGroupMember();
		}
	};

	let StartTheCustomGame = document.getElementById('StartTheCustomGame');
	if (StartTheCustomGame) {
		StartTheCustomGame.onclick = async () => {
			if (await checkCanStartCustomGame() == true) {
				if (socket && socket.readyState === WebSocket.OPEN) {
					socket.send(JSON.stringify({'event_type': "cg_start_game"}));
				} else {
					showNotificationError("Error with Websocket");
				}
			}
		}
	}

	toggleCount(false);

	try {
		const csrfToken = await getCSRFToken();

		if (csrfToken) {
			const {data} = await axios.post('https://' + window.location.hostname + ':' + window.location.port + '/api/features/matchmaking/isInQueue', {
				'mode': get_custom_selected_mode(),
			}, {
				headers: {
					'Content-Type': 'application/json',
					'X-CSRFToken': csrfToken,
				},
				withCredentials: true,
			});

			if (data.success && data.data && data.data.mode != 'none') {
				if (data.data.isCustom == true) {
					set_custom_selected_mode(data.data.mode);
					if (data.data.mode === Modes[2] || data.data.mode === Modes[4]) {set_custom_power_active(true);} 
					else {set_custom_power_active(false);}
					set_J1(data.data.j1);
					set_J2(data.data.j2);
					set_J3(data.data.j3);
					set_J4(data.data.j4);
					if(me_user_id == data.data.j1) {
						set_custom(true);
					}
				} else {
					set_selected_mode(data.data.mode);
					set_custom_selected_mode(Modes[0]);
					set_custom(false);
				}
			} else {}
		};

	} catch (error) {
		showNotificationError("Error while checking if in queue");
	}
	
	if (get_selected_mode() != Modes[0] || get_custom_selected_mode() != Modes[0]) {
		firstAffichageMatchmaking();
	} else {
		window.location.hash = pageStatus.DashboardLobby;
	}
}

async function CGLeaveGroupMember() {
	if (socket && socket.readyState === WebSocket.OPEN) {
		socket.send(JSON.stringify({'event_type': "cg_member_leave_group"}));
	} else {
		showNotificationError("Error with Websocket");
	}
}

async function firstAffichageMatchmaking() {
	let matchmakingBody = document.getElementById('matchmakingBody');
	let customGameBody = document.getElementById('customGameBody');
	let joinGroupBody = document.getElementById('joinGroupBody');

	if (matchmakingBody && customGameBody && joinGroupBody) {
		if (get_custom() === false && get_custom_selected_mode() != Modes[0]) {
			matchmakingBody.classList.add('hidden');
			customGameBody.classList.add('hidden');
			joinGroupBody.classList.remove('hidden');

			receiveChangedModeSocket({'newMode': get_custom_selected_mode(), }, 'none');

		} else if (get_custom() == true && get_custom_selected_mode() != Modes[0]) {

			matchmakingBody.classList.add('hidden');
			customGameBody.classList.remove('hidden');
			joinGroupBody.classList.add('hidden');

			receiveChangedModeSocket({'newMode': get_custom_selected_mode()}, 'none');

		} else if (get_custom() == false && get_selected_mode() != Modes[0]) {

			matchmakingBody.classList.remove('hidden');
			customGameBody.classList.add('hidden');
			joinGroupBody.classList.add('hidden');

			if (socket && socket.readyState === WebSocket.OPEN) {
				socket.send(JSON.stringify({'event_type': "accessMatch", 'mode': get_selected_mode()}));
			} else {
				showNotificationError("Error with Websocket");
			}
		}
	}
}

async function GroupLeaderLeaveCustom() {
	if (socket && socket.readyState === WebSocket.OPEN) {
		socket.send(JSON.stringify({'event_type': "cg_owner_leave_group"}));
	} else {
		showNotificationError("Error with Websocket");
	}
}

function CG_toggleMode(b, force) {
	if ((b && get_custom_selected_mode() != Modes[1] && get_custom_selected_mode() != Modes[2]) || (b && force)) {
		let newMode;
		if (get_custom_power_active()){
			newMode = Modes[2];
		} else {
			newMode = Modes[1];
		}
		if (socket && socket.readyState === WebSocket.OPEN) {
			socket.send(JSON.stringify({'event_type': "cg_modifMode", 'newMode': newMode}));
		} else {
			showNotificationError("Error with Websocket");
		}
	} else if ((!b && get_custom_selected_mode() != Modes[3] && get_custom_selected_mode() != Modes[4]) || (!b && force)) {
		let newMode;
		if (get_custom_power_active()){
			newMode = Modes[4];
		} else{
			newMode = Modes[3];
		}
		if (socket && socket.readyState === WebSocket.OPEN) {
			socket.send(JSON.stringify({'event_type': "cg_modifMode", 'newMode': newMode}));
		} else {
			showNotificationError("Error with Websocket");
		}
		
	} else {
	}
}

async function AddBotMatchGroup(difficulty, pos) {
	if (socket && socket.readyState === WebSocket.OPEN) {
		socket.send(JSON.stringify({'event_type': "cg_addBotGroup", 'pos': pos, 'dif': difficulty}));
	} else {
		showNotificationError("Error with Websocket");
	}
}

async function KickPlayerOrBotMatchGroup(pos) {
	if (socket && socket.readyState === WebSocket.OPEN) {
		socket.send(JSON.stringify({'event_type': "cg_kickGroup", 'pos': pos}));
	} else {
		showNotificationError("Error with Websocket");
	}
}

function CG_togglePowerUps() {
	if (!get_custom_power_active()) {
		let newMode;
		if (get_custom_selected_mode() === Modes[1]){ newMode = Modes[2];}
		else if (get_custom_selected_mode() === Modes[3]){ newMode = Modes[4];}
		else {return ;}
		if (socket && socket.readyState === WebSocket.OPEN) {
			socket.send(JSON.stringify({'event_type': "cg_modifMode", 'newMode': newMode}));
		} else {
			showNotificationError("Error with Websocket");
		}
	} else {
		let newMode;
		if (get_custom_selected_mode() === Modes[2]){ newMode = Modes[1];}
		else if (get_custom_selected_mode() === Modes[4]){ newMode = Modes[3];}
		else {return ;}
		if (socket && socket.readyState === WebSocket.OPEN) {
			socket.send(JSON.stringify({'event_type': "cg_modifMode", 'newMode': newMode}));
		} else {
			showNotificationError("Error with Websocket");
		}
	}
}

export async function receiveCGStarted() {
	if (window.location.hash == pageStatus.DashboardMatchmaking) {
		toggleCount(true);
	}
	await sleep(3000);
	window.location.hash = pageStatus.Game;
}

export async function receivedMajMatchSocket() {
	if (window.location.hash != pageStatus.DashboardMatchmaking) {return ;}

	let matchmakingLoaderWait = document.getElementById('matchmakingLoaderWait');
	let MatchFoundPanel2p = document.getElementById('MatchFoundPanel2p');
	let MatchFoundPanel4p = document.getElementById('MatchFoundPanel4p');

	if (matchmakingLoaderWait && MatchFoundPanel2p && MatchFoundPanel4p) {
		const data = await getMatchInfo();
		if (data == false || data.status == 'in_queue') {
			matchmakingLoaderWait.classList.remove('hidden');
			MatchFoundPanel2p.classList.add('hidden');
			MatchFoundPanel4p.classList.add('hidden');
			toggleCount(false);
			return ;
		}

		if (data.mode == Modes[1] || data.mode == Modes[2]) {
			let matchP1_Name = document.getElementById('matchP1_Name');
			let matchP1_Pic = document.getElementById('matchP1_Pic');
			let matchP2_Name = document.getElementById('matchP2_Name');
			let matchP2_Pic = document.getElementById('matchP2_Pic');

			if (matchP1_Name && matchP1_Pic && matchP2_Name && matchP2_Pic)
			{
				matchmakingLoaderWait.classList.add('hidden');
				MatchFoundPanel2p.classList.remove('hidden');
				MatchFoundPanel4p.classList.add('hidden');
				const p1 = await searchUserInfos(data.j1);
				if (p1) {
					matchP1_Name.innerText = p1.pseudo;
					matchP1_Pic.src = p1.picture;
				};
				const p2 = await searchUserInfos(data.j2);
				if (p2) {
					matchP2_Name.innerText = p2.pseudo;
					matchP2_Pic.src = p2.picture;
				};
			}
		} else if (data.mode == Modes[3] || data.mode == Modes[4]) {
			let matchP1Name = document.getElementById('matchP1Name');
			let matchP1Pic = document.getElementById('matchP1Pic');
			let matchP2Name = document.getElementById('matchP2Name');
			let matchP2Pic = document.getElementById('matchP2Pic');
			let matchP3Name = document.getElementById('matchP3Name');
			let matchP3Pic = document.getElementById('matchP3Pic');
			let matchP4Name = document.getElementById('matchP4Name');
			let matchP4Pic = document.getElementById('matchP4Pic');

			if (matchP1Name && matchP1Pic && matchP2Name && matchP2Pic
				&& matchP3Name && matchP3Pic && matchP4Name && matchP4Pic)
			{
				matchmakingLoaderWait.classList.add('hidden');
				MatchFoundPanel2p.classList.add('hidden');
				MatchFoundPanel4p.classList.remove('hidden');
				const p1 = await searchUserInfos(data.j1);
				if (p1) {
					matchP1Name.innerText = p1.pseudo;
					matchP1Pic.src = p1.picture;
				};
				const p2 = await searchUserInfos(data.j2);
				if (p2) {
					matchP2Name.innerText = p2.pseudo;
					matchP2Pic.src = p2.picture;
				};
				const p3 = await searchUserInfos(data.j3);
				if (p3) {
					matchP3Name.innerText = p3.pseudo;
					matchP3Pic.src = p3.picture;
				};
				const p4 = await searchUserInfos(data.j4);
				if (p4) {
					matchP4Name.innerText = p4.pseudo;
					matchP4Pic.src = p4.picture;
				};
			}
		} else {
			matchmakingLoaderWait.classList.remove('hidden');
			MatchFoundPanel2p.classList.add('hidden');
			MatchFoundPanel4p.classList.add('hidden');
			toggleCount(false);
		}

		let matchStatus4p = document.getElementById('matchStatus4p');
		let matchStatus2p = document.getElementById('matchStatus2p');

		if (matchStatus2p && matchStatus4p) {
			if (data.status == 'ready') {
				matchStatus4p.innerHTML = '<span class="loader"></span>';
				matchStatus2p.innerHTML = '<span class="loader"></span>';
				toggleCount(false);
			} else if (data.status == 'game_starting') {
				matchStatus4p.innerHTML = 'VS';
				matchStatus2p.innerHTML = 'VS';
				toggleCount(true);
			} else if (data.status == 'in_game') {
				window.location.hash = pageStatus.Game;
			} else if (data.status == 'ended') {
				window.location.hash = pageStatus.DashboardLobby;
			}
		}
	}
}

export async function receivedLeaveMatchmakingSocket() {
	if (window.location.hash != pageStatus.DashboardMatchmaking) {return ;}
	window.location.hash = pageStatus.DashboardLobby;
}

export async function receiveStartingMatchSocket(data, user_id) {
	if (window.location.hash != pageStatus.DashboardMatchmaking) {return ;}
	showNotification("Starting Pong Game" + "", "", "", "");
}

export async function ConfirmBotAddedCGGroup(data, meUser) {
	if (window.location.hash === pageStatus.DashboardMatchmaking && get_custom_selected_mode() != Modes[0]) {
		let BotPos = data.pos;
		let BotDifficulty = data.dif;
		if (BotPos === 2) {
			set_J2(BotDifficulty);
		} else if (BotPos === 3) {
			set_J3(BotDifficulty);
		} else if (BotPos === 4) {
			set_J4(BotDifficulty);
		}
		if (get_custom()) {
			ToggleBotPanel(0, false);
			MAJgroupInfosOwner(data.group_size);
		} else {
			MAJgroupInfosMember(data.group_size);
		}
	}
}

export async function ConfirmAddPlayerMatchGroupInvitation(data, userMe) {
	if (window.location.hash === pageStatus.DashboardMatchmaking && get_custom_selected_mode() != Modes[0]) {
		if (get_custom()) {
			TogglePlayerInvitePanel(0, false);
		} else {
			showNotification( "You have been invited to a custom game group by " , data.sender , "", "Join Group", sendJoinCustomGameGroup, {'senderInv' : data.sender, 'pos' : data.pos});
		}
	} else {
		showNotification( "You have been invited to a custom game group by " , data.sender , "", "Join Group", sendJoinCustomGameGroup, {'senderInv' : data.sender, 'pos' : data.pos});
	}
}

export async function ConfirmAddPlayerCustomGroup(data, meUser) {
	if (window.location.hash === pageStatus.DashboardMatchmaking && get_custom_selected_mode() != Modes[0]) {
		let PlayerPos = data.pos;
		let PlayerId = data.playerId;
		if (PlayerPos === 2) {
			set_J2(PlayerId);
		} else if (PlayerPos === 3) {
			set_J3(PlayerId);
		} else if (PlayerPos === 4) {
			set_J4(PlayerId);
		}
		if (get_custom()) {
			MAJgroupInfosOwner(data.group_size);
		} else {
			MAJgroupInfosMember(data.group_size);
		}
	}
}

export async function ConfirmSendJoinCustomGameGroup(data, user) {
	if (window.location.hash === pageStatus.DashboardMatchmaking) {
		UnloadPage();
		LoadPage();
	} else {
		window.location.hash = pageStatus.DashboardMatchmaking;
	}
}

export async function ConfirmKickedCGGroup(data, meUser) {
	if (window.location.hash === pageStatus.DashboardMatchmaking && get_custom_selected_mode() != Modes[0]) {
		let Pos = data.pos;
		let temp;
		if (Pos === 2) {
			temp = get_J2();
			set_J2('none');
		} else if (Pos === 3) {
			temp = get_J3();
			set_J3('none');
		} else if (Pos === 4) {
			temp = get_J4();
			set_J4('none');
		}
		if (get_custom()) {
			MAJgroupInfosOwner(data.group_size);
		} else {
			MAJgroupInfosMember(data.group_size);
		}
	}
}

export async function ConfirmKickedCGGroupMe(data, meUser) {
	if (window.location.hash === pageStatus.DashboardMatchmaking && get_custom_selected_mode() != Modes[0]) {
			set_J2('none');
			set_J3('none');
			set_J4('none');
			showNotification("You have been kicked from group of ", get_J1(), "", "", "");
			set_J1(me_user_id);
			window.location.hash = pageStatus.DashboardLobby;
	}
}

export async function receiveChangedModeSocket(data, meUser){
	let newMode = data.newMode;
	let g_size = 1;
	if (get_J2() != 'none')
		g_size++;
	if (get_J3() != 'none')
		g_size++;
	if (get_J4() != 'none')
		g_size++;
	if (window.location.hash === pageStatus.DashboardMatchmaking && get_custom_selected_mode() != Modes[0]) {
		if (get_custom()) {
			let mode1v1Custom = document.getElementById('mode1v1Custom');
			let mode2v2Custom = document.getElementById('mode2v2Custom');
			let powerupsWheels = document.getElementById('powerupsWheels');

			if (mode1v1Custom && mode2v2Custom && powerupsWheels) {
				if (newMode === Modes[1]) { 
					mode1v1Custom.classList.remove('selection2v2AnimationLeft');
					mode2v2Custom.classList.remove('selection2v2AnimationRight');
					mode1v1Custom.classList.add('selection1v1AnimationLeft');
					mode2v2Custom.classList.add('selection1v1AnimationRight');
					powerupsWheels.classList.remove('ApowerupsCustomOn');
					powerupsWheels.classList.add('ApowerupsCustomOff');
					set_custom_power_active(false);
				} else if (newMode === Modes [2]) {
					mode1v1Custom.classList.remove('selection2v2AnimationLeft');
					mode2v2Custom.classList.remove('selection2v2AnimationRight');
					mode1v1Custom.classList.add('selection1v1AnimationLeft');
					mode2v2Custom.classList.add('selection1v1AnimationRight');
					powerupsWheels.classList.add('ApowerupsCustomOn');
					powerupsWheels.classList.remove('ApowerupsCustomOff');
					set_custom_power_active(true);
				} else if (newMode === Modes [3]) {
					mode1v1Custom.classList.remove('selection1v1AnimationLeft');
					mode2v2Custom.classList.remove('selection1v1AnimationRight');
					mode1v1Custom.classList.add('selection2v2AnimationLeft');
					mode2v2Custom.classList.add('selection2v2AnimationRight');
					powerupsWheels.classList.remove('ApowerupsCustomOn');
					powerupsWheels.classList.add('ApowerupsCustomOff');
					set_custom_power_active(false);
				} else if (newMode === Modes [4]) {
					mode1v1Custom.classList.remove('selection1v1AnimationLeft');
					mode2v2Custom.classList.remove('selection1v1AnimationRight');
					mode1v1Custom.classList.add('selection2v2AnimationLeft');
					mode2v2Custom.classList.add('selection2v2AnimationRight');
					powerupsWheels.classList.add('ApowerupsCustomOn');
					powerupsWheels.classList.remove('ApowerupsCustomOff');
					set_custom_power_active(true);
				}
				MAJgroupInfosOwner(g_size);
			}
		} else {
			let cgModeOther = document.getElementById('cgModeOther');
			let cgPowerOther = document.getElementById('cgPowerOther');

			if (cgModeOther && cgPowerOther) {
				if (newMode === Modes[1]) {
					cgModeOther.innerText = '1v1';
					cgPowerOther.innerText = 'Off';
					set_custom_power_active(false);
				} else if (newMode === Modes [2]) {
					cgModeOther.innerText = '1v1';
					cgPowerOther.innerText = 'On';
					set_custom_power_active(true);
				} else if (newMode === Modes [3]) {
					cgModeOther.innerText = '2v2';
					cgPowerOther.innerText = 'Off';
					set_custom_power_active(false);
				} else if (newMode === Modes [4]) {
					cgModeOther.innerText = '2v2';
					cgPowerOther.innerText = 'On';
					set_custom_power_active(true);
				}
				MAJgroupInfosMember(g_size);
			}
		}
		set_custom_selected_mode(newMode);
	}
}

async function ToggleBotPanel(position, b) {
	set_inviteForGroupPos(position);

	let addBotPanel = document.getElementById('addBotPanel');
	if (addBotPanel) {
		if (b) {
			addBotPanel.classList.remove('hidden');
		} else {
			addBotPanel.classList.add('hidden');
		}
	}
}

async function TogglePlayerInvitePanel(position, b) {
	set_inviteForGroupPos(position);

	let invitePlayerPanelSearchInput = document.getElementById('invitePlayerPanelSearchInput');
	if (invitePlayerPanelSearchInput) {invitePlayerPanelSearchInput.value = "";};

	let invitePlayerPanel = document.getElementById('invitePlayerPanel');
	if (invitePlayerPanel) {
		if (b) {
			invitePlayerPanel.classList.remove('hidden');
			searchPeopleToGroupInviteCustom('');
		} else {
			invitePlayerPanel.classList.add('hidden');
		}
	}
}

async function searchPeopleToGroupInviteCustom(prompt) {
	let invitePlayerPaneldata = document.getElementById('invitePlayerPaneldata');
	if (invitePlayerPaneldata) {invitePlayerPaneldata.innerHTML = '<div class="insearchpeopleload" id="insearchpeopleload"><div class="lds-ring"><div></div><div></div><div></div><div></div></div></div>';};
	try {

		const csrfToken = await getCSRFToken(); 

		if (csrfToken) {
			const {data} = await axios.post('https://' + window.location.hostname + ':' + window.location.port + '/api/social/search', {
				filter: 'all',
				user_input: prompt,
			}, {
				headers: {
					'Content-Type': 'application/json',
					'X-CSRFToken': csrfToken,
				},
				withCredentials: true,
			});

			if (data && data.success) {
				if (invitePlayerPaneldata) {invitePlayerPaneldata.innerHTML = '';};
				for (let i = 0; i < data.List.length; i++) {
					let already_in = false;
					if (get_J1() == data.List[i].user_id || get_J2() == data.List[i].user_id || get_J3() == data.List[i].user_id || get_J4() == data.List[i].user_id) {already_in = true;}
					addOnePersonCustomGameGroupInvitePanel(data.List[i].picture, data.List[i].user_id, already_in);
				}
			} else {
				if (data && data.message) {showNotificationError(data.message);};
			};
		};

	} catch (error) {
		showNotificationError("Error while searching user list");
	}
}

function addOnePersonCustomGameGroupInvitePanel(ImgUrl, Name, already_in) {
	const profilBox = document.createElement('div');
	profilBox.classList.add('invitePlayerPaneldataProfil');

	let profilInfoBox = document.createElement('div');
	profilInfoBox.classList.add('invitePlayerPaneldataProfilInfos');

	let profilInfoImg = document.createElement('img');
	profilInfoImg.classList.add('invitePlayerPaneldataProfilImg');
	profilInfoImg.src = ImgUrl;
	profilInfoBox.appendChild(profilInfoImg);

    let profilInfoName = document.createElement('div');
	profilInfoName.classList.add('invitePlayerPaneldataProfilName');
	profilInfoName.innerText = Name;
	profilInfoBox.appendChild(profilInfoName);
	profilBox.appendChild(profilInfoBox);

	const profilButtonBox = document.createElement('div');
	profilButtonBox.classList.add('invitePlayerPaneldataProfilButton');
	profilButtonBox.onclick = () => {
		AddPlayerMatchGroup(get_inviteForGroupPos(), Name);
	}

	if (!already_in) {
		const profilButtoninvite = document.createElement('div');
		profilButtoninvite.classList.add('invitePlayerPaneldataProfilButtonInvite');
		profilButtoninvite.innerText = 'invite';
		profilButtonBox.appendChild(profilButtoninvite);
	}

	profilBox.appendChild(profilButtonBox);

	let invitePlayerPaneldata = document.getElementById('invitePlayerPaneldata');
	if (invitePlayerPaneldata) {invitePlayerPaneldata.appendChild(profilBox);}

}

async function AddPlayerMatchGroup(pos, userInvitedId) {
	if (socket && socket.readyState === WebSocket.OPEN) {
		socket.send(JSON.stringify({'event_type': "cg_InviteUserGroup", 'pos': pos, 'userInvited': userInvitedId}));
	} else {
		showNotificationError("Error with Websocket");
	}
}

async function sendJoinCustomGameGroup(infos) {
	if (socket && socket.readyState === WebSocket.OPEN) {
		socket.send(JSON.stringify({'event_type': "cg_joinUserGroup", 'pos': infos.pos, 'senderInv': infos.senderInv}));
	} else {
		showNotificationError("Error with Websocket");
	}
}

async function MAJgroupInfosMember(group_size) {
	const j1Info = await searchUserInfos(get_J1());

	if (j1Info) {
		let cgMainPlayerNameOther = document.getElementById('cgMainPlayerNameOther');
		if (cgMainPlayerNameOther) {cgMainPlayerNameOther.innerText = j1Info.pseudo;};

		let cgMainPlayerImgOther = document.getElementById('cgMainPlayerImgOther');
		if (cgMainPlayerImgOther) {cgMainPlayerImgOther.src = j1Info.picture;};
	};

	let cgPlayer2NameOther = document.getElementById('cgPlayer2NameOther');
	let cgPlayer2ImgOther = document.getElementById('cgPlayer2ImgOther');

	if (cgPlayer2NameOther && cgPlayer2ImgOther) {
		if (get_J2() != 'none') {
			if (get_J2() === '$easyBot') {
				cgPlayer2NameOther.innerText = 'easy Bot';
				cgPlayer2ImgOther.src = './EasyBot.png';
			} else if (get_J2() === '$normalBot') {
				cgPlayer2NameOther.innerText = 'normal Bot';
				cgPlayer2ImgOther.src = './MiddleBot.png';
			} else if (get_J2() === '$hardBot') {
				cgPlayer2NameOther.innerText = 'hard Bot';
				cgPlayer2ImgOther.src = './HardBot.png';
			} else {
				const j2Info = await searchUserInfos(get_J2());
				if (j2Info) {
					cgPlayer2NameOther.innerText = j2Info.pseudo;
					cgPlayer2ImgOther.src = j2Info.picture;
				};
			}
		} else {
			cgPlayer2NameOther.innerText = 'waiting for player. . .';
			cgPlayer2ImgOther.src = './noUser.png';
		}
	}

	let cgPlayer3NameOther = document.getElementById('cgPlayer3NameOther');
	let cgPlayer3ImgOther = document.getElementById('cgPlayer3ImgOther');

	if (cgPlayer3NameOther && cgPlayer3ImgOther) {
		if (get_J3() != 'none') {
			if (get_J3() === '$easyBot') {
				cgPlayer3NameOther.innerText = 'easy Bot';
				cgPlayer3ImgOther.src = './EasyBot.png';
			} else if (get_J3() === '$normalBot') {
				cgPlayer3NameOther.innerText = 'normal Bot';
				cgPlayer3ImgOther.src = './MiddleBot.png';
			} else if (get_J3() === '$hardBot') {
				cgPlayer3NameOther.innerText = 'hard Bot';
				cgPlayer3ImgOther.src = './HardBot.png';
			} else {
				const j3Info = await searchUserInfos(get_J3());
				if (j3Info) {
					cgPlayer3NameOther.innerText = j3Info.pseudo;
					cgPlayer3ImgOther.src = j3Info.picture;
				};
			}
		} else {
			cgPlayer3ImgOther.src = './noUser.png';
			cgPlayer3NameOther.innerText = 'waiting for player . . .';
		}
	}

	let cgPlayer4NameOther = document.getElementById('cgPlayer4NameOther');
	let cgPlayer4ImgOther = document.getElementById('cgPlayer4ImgOther');

	if (cgPlayer4NameOther && cgPlayer4ImgOther) {
		if (get_J4() != 'none') {
			if (get_J4() === '$easyBot') {
				cgPlayer4NameOther.innerText = 'easy Bot';
				cgPlayer4ImgOther.src = './EasyBot.png';
			} else if (get_J4() === '$normalBot') {
				cgPlayer4NameOther.innerText = 'normal Bot';
				cgPlayer4ImgOther.src = './MiddleBot.png';
			} else if (get_J4() === '$hardBot') {
				cgPlayer4NameOther.innerText = 'hard Bot';
				cgPlayer4ImgOther.src = './HardBot.png';
			} else {
				const j4Info = await searchUserInfos(get_J4());
				if (j4Info) {
					cgPlayer4NameOther.innerText = j4Info.pseudo;
					cgPlayer4ImgOther.src = j4Info.picture;
				};
			}
		} else {
			cgPlayer4ImgOther.src = './noUser.png';
			cgPlayer4NameOther.innerText = 'waiting for player . . .';
		}
	}

	let cgPlayerCountOther = document.getElementById('cgPlayerCountOther');

	if (cgPlayerCountOther) {
		if (get_custom_selected_mode() === Modes[1] || get_custom_selected_mode() === Modes[2]) {
			cgPlayerCountOther.innerText = group_size + '/2 Players';
		} else if (get_custom_selected_mode() === Modes[3] || get_custom_selected_mode() === Modes[4]) {
			cgPlayerCountOther.innerText = group_size + '/4 Players';
		}
	}
}

async function MAJgroupInfosOwner(group_size) {
	const j1Info = await searchUserInfos(get_J1());

	if (j1Info) {
		let cgMainPlayerName = document.getElementById('cgMainPlayerName');
		if (cgMainPlayerName) {cgMainPlayerName.innerText = j1Info.pseudo;};

		let cgMainPlayerImg = document.getElementById('cgMainPlayerImg');
		if (cgMainPlayerImg) {cgMainPlayerImg.src = j1Info.picture;};
	};

	let cgPlayer2Name = document.getElementById('cgPlayer2Name');
	let cgPlayer2Img = document.getElementById('cgPlayer2Img');
	let cgAddBotButton2 = document.getElementById('cgAddBotButton2');
	let cgInviteButton2 = document.getElementById('cgInviteButton2');
	let cgKickButton2 = document.getElementById('cgKickButton2');

	if (cgPlayer2Name && cgPlayer2Img && cgAddBotButton2 && cgInviteButton2 && cgKickButton2) {
		if (get_J2() != 'none') {
			if (get_J2() === '$easyBot') {
				cgPlayer2Name.innerText = 'easy Bot';
				cgPlayer2Img.src = './EasyBot.png';
			} else if (get_J2() === '$normalBot') {
				cgPlayer2Name.innerText = 'normal Bot';
				cgPlayer2Img.src = './MiddleBot.png';
			} else if (get_J2() === '$hardBot') {
				cgPlayer2Name.innerText = 'hard Bot';
				cgPlayer2Img.src = './HardBot.png';
			} else {
				const j2Info = await searchUserInfos(get_J2());
				if (j2Info) {
					cgPlayer2Name.innerText = j2Info.pseudo;
					cgPlayer2Img.src = j2Info.picture;
				};
			}
			cgAddBotButton2.classList.add('hidden');
			cgInviteButton2.classList.add('hidden');
			cgKickButton2.classList.remove('hidden');
		}else {
			cgPlayer2Name.innerText = 'waiting for player. . .';
			cgPlayer2Img.src = './noUser.png';
			cgAddBotButton2.classList.remove('hidden');
			cgInviteButton2.classList.remove('hidden');
			cgKickButton2.classList.add('hidden');
		}
	}

	let cgPlayer3Name = document.getElementById('cgPlayer3Name');
	let cgPlayer3Img = document.getElementById('cgPlayer3Img');
	let cgAddBotButton3 = document.getElementById('cgAddBotButton3');
	let cgInviteButton3 = document.getElementById('cgInviteButton3');
	let cgKickButton3 = document.getElementById('cgKickButton3');

	if (cgPlayer3Name && cgPlayer3Img && cgAddBotButton3 && cgInviteButton3 && cgKickButton3) {
		if (get_J3() != 'none') {
			if (get_J3() === '$easyBot') {
				cgPlayer3Name.innerText = 'easy Bot';
				cgPlayer3Img.src = './EasyBot.png';
			} else if (get_J3() === '$normalBot') {
				cgPlayer3Name.innerText = 'normal Bot';
				cgPlayer3Img.src = './MiddleBot.png';
			} else if (get_J3() === '$hardBot') {
				cgPlayer3Name.innerText = 'hard Bot';
				cgPlayer3Img.src = './HardBot.png';
			} else {
				const j3Info = await searchUserInfos(get_J3());
				if (j3Info) {
					cgPlayer3Name.innerText = j3Info.pseudo;
					cgPlayer3Img.src = j3Info.picture;
				};
			}
			cgAddBotButton3.classList.add('hidden');
			cgInviteButton3.classList.add('hidden');
			cgKickButton3.classList.remove('hidden');
		} else {
			cgAddBotButton3.classList.remove('hidden');
			cgInviteButton3.classList.remove('hidden');
			cgKickButton3.classList.add('hidden');

			let cgPlayer3 = document.getElementById('cgPlayer3');

			if (cgPlayer3) {
				if (get_custom_selected_mode() === Modes[1] || get_custom_selected_mode() === Modes[2]) {
					cgPlayer3.classList.add('placeUnable');
					cgPlayer3Img.src = './cross.png';
					cgPlayer3Name.innerText = 'place unable . . .';
				} else if (get_custom_selected_mode() === Modes[3] || get_custom_selected_mode() === Modes[4]) {
					if (group_size < 3 || get_J3() == 'none') {
						cgPlayer3.classList.remove('placeUnable');
						cgPlayer3Img.src = './noUser.png';
						cgPlayer3Name.innerText = 'waiting for player . . .';
					}
				}
			}
		}
	}

	let cgPlayer4Name = document.getElementById('cgPlayer4Name');
	let cgPlayer4Img = document.getElementById('cgPlayer4Img');
	let cgAddBotButton4 = document.getElementById('cgAddBotButton4');
	let cgInviteButton4 = document.getElementById('cgInviteButton4');
	let cgKickButton4 = document.getElementById('cgKickButton4');

	if (cgPlayer4Name && cgPlayer4Img && cgAddBotButton4 && cgInviteButton4 && cgKickButton4) {
		if (get_J4() != 'none') {
			if (get_J4() === '$easyBot') {
				cgPlayer4Name.innerText = 'easy Bot';
				cgPlayer4Img.src = './EasyBot.png';
			} else if (get_J4() === '$normalBot') {
				cgPlayer4Name.innerText = 'normal Bot';
				cgPlayer4Img.src = './MiddleBot.png';
			} else if (get_J4() === '$hardBot') {
				cgPlayer4Name.innerText = 'hard Bot';
				cgPlayer4Img.src = './HardBot.png';
			} else {
				const j4Info = await searchUserInfos(get_J4());
				if (j4Info) {
					cgPlayer4Name.innerText = j4Info.pseudo;
					cgPlayer4Img.src = j4Info.picture;
				};
			}
			cgAddBotButton4.classList.add('hidden');
			cgInviteButton4.classList.add('hidden');
			cgKickButton4.classList.remove('hidden');
		} else {
			cgAddBotButton4.classList.remove('hidden');
			cgInviteButton4.classList.remove('hidden');
			cgKickButton4.classList.add('hidden');

			let cgPlayer4 = document.getElementById('cgPlayer4');

			if (cgPlayer4) {
				if (get_custom_selected_mode() === Modes[1] || get_custom_selected_mode() === Modes[2]) {
					cgPlayer4.classList.add('placeUnable');
					cgPlayer4Img.src = './cross.png';
					cgPlayer4Name.innerText = 'place unable . . .';
					
				} else if (get_custom_selected_mode() === Modes[3] || get_custom_selected_mode() === Modes[4]) {
					if (group_size < 4 || get_J4() == 'none') {
						cgPlayer4.classList.remove('placeUnable');
						cgPlayer4Img.src = './noUser.png';
						cgPlayer4Name.innerText = 'waiting for player . . .';
					}
				}
			}
		}
	}

	let cgPlayerCount = document.getElementById('cgPlayerCount');
	
	if (cgPlayerCount) {
		if (get_custom_selected_mode() === Modes[1] || get_custom_selected_mode() === Modes[2]) {
			cgPlayerCount.innerText = group_size + '/2 Players';
		} else if (get_custom_selected_mode() === Modes[3] || get_custom_selected_mode() === Modes[4]) {
			cgPlayerCount.innerText = group_size + '/4 Players';
		}
	}
	checkCanStartCustomGame();
}

async function checkCanStartCustomGame() {

	const data = await getCMatchInfo();
	const startButtron = document.getElementById('StartTheCustomGame');

	if (startButtron) {
		try {
			if (!data)
				throw new Error('error occured')
			if (data.mode == Modes[1]){
				if (data.nbPlayer != 2)
					throw new Error('Number a of players incorrect');
			} else if (data.mode == Modes[2]){
				if (data.nbPlayer != 2)
					throw new Error('Number a of players incorrect');
			} else if (data.mode == Modes[3]){
				if (data.nbPlayer != 4)
					throw new Error('Number a of players incorrect');
			} else if (data.mode == Modes[4]){
				if (data.nbPlayer != 4)
					throw new Error('Number a of players incorrect');
			} else
				throw new Error('Mode incorrect')
			startButtron.classList.remove('StartTheCustomGameOFF');
			startButtron.classList.add('StartTheCustomGameON');
			return true
		} catch (e) {
			startButtron.classList.remove('StartTheCustomGameON');
			startButtron.classList.add('StartTheCustomGameOFF');
			return false;
		}
	}
}

async function getMatchInfo() {
	try {
		const {data} = await axios.get('https://' + window.location.hostname + ':' + window.location.port + '/api/features/getMatchInfo', {
			headers: {
				'Content-Type': 'application/json',
			},
			withCredentials: true,
		});

		if (data && data.success) {
			return data.data;
		} else {
			if (data && data.message) {showNotificationError(data.message);};
			return false;
		}
	} catch (error) {
		showNotificationError("Error while recovering match info");
		return false;
	}
}

async function getCMatchInfo() {
	try {
		const {data} = await axios.get('https://' + window.location.hostname + ':' + window.location.port + '/api/features/getCMatchInfo', {
			headers: {
				'Content-Type': 'application/json',
			},
			withCredentials: true,
		});

		if (data && data.success) {
			return data.data;
		} else {
			if (data && data.message) {showNotificationError(data.message);};
			return false;
		}
	} catch (error) {
		showNotificationError("Error while recovering custom match info");
		return false;
	}
}