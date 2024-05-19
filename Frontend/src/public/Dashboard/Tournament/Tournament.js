// **********************************************************************
// 				Tournament Page
// **********************************************************************

import {pageStatus} from './Website.js';
import {GetStatus, UpdateStatus} from './Website.js';
import {getCSRFToken, showNotificationError} from './Website.js';
import {me_user_id, socket} from "./Website.js";

import {handleTitle} from './Dashboard.js';

import {set_selected_mode, get_selected_mode, set_custom, get_custom,
	set_custom_selected_mode, get_custom_selected_mode, 
	set_custom_power_active, get_custom_power_active,
	set_inviteForGroupPos, get_inviteForGroupPos,
	set_J1, get_J1, set_J2, get_J2, set_J3, get_J3, set_J4, get_J4, Modes} from './Dashboard.js';

import {searchActualtournament, toggleCount, searchUserInfos} from './Dashboard.js';

var page = "";

let tournament_status = 'none';
let last_tournament_name = 'none';

export async function LoadPage() {
	const child = document.getElementById('child1_dashboard');
	if (!child) {return ;}
	if (page != "") {
		child.innerHTML = page;
		Page();
	} else {
		var cssLink = document.createElement('link');
		cssLink.rel = 'stylesheet';
		cssLink.href = './DTournament.css';
		document.head.appendChild(cssLink);
        cssLink.onload = function() {
            fetch('DTournament.html')
            .then(response => response.text())
            .then(html => {
                page = html;
                child.innerHTML = page;
				child.classList.remove("hidden")
				Page()
            });
        }
	}
	UpdateStatus(pageStatus.DashboardTournament);
	handleTitle('Tournament');
	document.title = 'Dashboard Tournament';
	// const editPseudoPanel = document.getElementById('ChangeTournamentPseudoPanel')
	// if (editPseudoPanel){
	// 	editPseudoPanel.classList.add('hidden');
	// }
}

export function UnloadPage() {
	UpdateStatus("");
	
	tournament_status = 'none';
	last_tournament_name = 'none';
	set_selected_mode(Modes[0]);
	set_custom(false);

	let tournamentLeaveButton = document.getElementById('tournamentLeaveButton');
	if (tournamentLeaveButton) {tournamentLeaveButton.removeEventListener('click', function(event) {});}

	let tournamentLeaveAtEndButton = document.getElementById('tournamentLeaveAtEndButton');
	if (tournamentLeaveAtEndButton) {tournamentLeaveAtEndButton.removeEventListener('click', function(event) {});};

	let confirmLeaveTournamentButtonBack = document.getElementById('confirmLeaveTournamentButtonBack');
	if (confirmLeaveTournamentButtonBack) {confirmLeaveTournamentButtonBack.removeEventListener('click', function(event) {});};

	let confirmLeaveTournamentButton = document.getElementById('confirmLeaveTournamentButton');
	if (confirmLeaveTournamentButton) {confirmLeaveTournamentButton.removeEventListener('click', function(event) {});};

	let tournamentReadyButton = document.getElementById('tournamentReadyButton');
	if (tournamentReadyButton) {tournamentReadyButton.removeEventListener('click', function(event) {});};

	let tournamentReadyButton2 = document.getElementById('tournamentReadyButton2');
	if (tournamentReadyButton2) {tournamentReadyButton2.removeEventListener('click', function(event) {});};

	let editTournamentPseudoInput = document.getElementById('editTournamentPseudoInput');
	if (editTournamentPseudoInput) {editTournamentPseudoInput.removeEventListener('input', function(event) {});};

	let editTournamentPseudo = document.getElementById('editTournamentPseudo');
	if (editTournamentPseudo) {editTournamentPseudo.removeEventListener('click', function(event) {});};

}

async function Page() {
	let tournamentLeaveButton = document.getElementById('tournamentLeaveButton');
	if (tournamentLeaveButton) {
		tournamentLeaveButton.onclick = () => {
			let confirmLeavePanel = document.getElementById('confirmLeavePanel');
			if (confirmLeavePanel) {confirmLeavePanel.classList.remove('hidden');};
		};
	};

	let tournamentLeaveAtEndButton = document.getElementById('tournamentLeaveAtEndButton');
	if (tournamentLeaveAtEndButton) {
		tournamentLeaveAtEndButton.onclick = () => {window.location.hash = pageStatus.DashboardProfil;};
	};

	let confirmLeaveTournamentButtonBack = document.getElementById('confirmLeaveTournamentButtonBack');
	if (confirmLeaveTournamentButtonBack) {
		confirmLeaveTournamentButtonBack.onclick = () => {
			let confirmLeavePanel = document.getElementById('confirmLeavePanel');
			if (confirmLeavePanel) {confirmLeavePanel.classList.add('hidden');};
		};
	};

	let confirmLeaveTournamentButton = document.getElementById('confirmLeaveTournamentButton');
	if (confirmLeaveTournamentButton) {
		confirmLeaveTournamentButton.onclick = () => {
			if (socket && socket.readyState === WebSocket.OPEN) {
				socket.send(JSON.stringify({'event_type': "leaveTournament"}));
			} else {
				showNotificationError("Error with Websocket");
			}
		};
	};

	let tournamentReadyButton = document.getElementById('tournamentReadyButton');
	if (tournamentReadyButton) {
		tournamentReadyButton.onclick = () => {
			if (socket && socket.readyState === WebSocket.OPEN) {
				socket.send(JSON.stringify({'event_type': "tp_isReady"}));
			} else {
				showNotificationError("Error with Websocket");
			}
		};
	};

	let tournamentReadyButton2 = document.getElementById('tournamentReadyButton2');
	if (tournamentReadyButton2) {
		tournamentReadyButton2.onclick = () => {
			if (socket && socket.readyState === WebSocket.OPEN) {
				socket.send(JSON.stringify({'event_type': "tp_isReady2"}));
			} else {
				showNotificationError("Error with Websocket");
			}
		};
	};

	let editTournamentPseudoInput = document.getElementById('editTournamentPseudoInput');
	if (editTournamentPseudoInput) {
		editTournamentPseudoInput.oninput = (event) => {
			parseInputToEditPseudo(event.target.value);
		};
	};

	let editTournamentPseudo = document.getElementById('editTournamentPseudo');
	if (editTournamentPseudo) {
		editTournamentPseudo.onclick = async (event) => {
			let editTournamentPseudoInput = document.getElementById('editTournamentPseudoInput');
			if (editTournamentPseudoInput) {
				const pseudo = editTournamentPseudoInput.value;
				event.target.disabled = true;
				try {
					const csrfToken = await getCSRFToken();

					if (csrfToken) {
						const {data} = await axios.post('https://' + window.location.hostname + ':' + window.location.port + '/api/features/postTournamentNewPseudo', {
							'newPseudo': pseudo,
						}, {
							headers: {
								'Content-Type': 'application/json',
								'X-CSRFToken': csrfToken,
							},
							withCredentials: true,
						});
				
						if (data && data.success) {
							if (socket && socket.readyState === WebSocket.OPEN) {
								socket.send(JSON.stringify({'event_type': "majTournamentName"}));
							} else {
								showNotificationError("Error with Websocket");
							}
						} else {
							if (data && data.message) {showNotificationError(data.message);};
							parseInputToEditPseudo(pseudo);
							return false;
						}
					} else {
						parseInputToEditPseudo(pseudo);
						return false;
					}
				} catch (error) {
					showNotificationError("Error while editing tournament pseudo");
					parseInputToEditPseudo(pseudo);
					return false;
				}
			};
		};
	};

	toggleCount(false)
	let data = await searchActualtournament();
	if (data != false) {
		await majTournamentPanel(true, true);
	} else {
		tournament_status = 'none';
		try {
			const {data} = await axios.get('https://' + window.location.hostname + ':' + window.location.port + '/api/social/user_info_profil_me', {
				headers: {
					'Content-Type': 'application/json',
				},
				withCredentials: true,
			});
	
			if (data && data.success) {
				let P1Name = document.getElementById('P1Name');
				if (P1Name) {P1Name.innerText = data.profil.pseudo;};

				let P1Pic = document.getElementById('P1Pic');
				if (P1Pic) {P1Pic.src = data.profil.picture;};
			} else {
				if (data && data.message) {showNotificationError(data.message);};
			};
		} catch (error) {
			showNotificationError("Error while recovering user infos");
		}
		if (socket && socket.readyState === WebSocket.OPEN) {
			socket.send(JSON.stringify({'event_type': "accessTournament", 'mode': get_selected_mode()}));
		} else {
			showNotificationError("Error with Websocket");
		}
	}
}

async function parseInputToEditPseudo(value) {
	const send_button = document.getElementById('editTournamentPseudo');
	if (send_button) {
		try {
			if (value == '')
				throw new Error('pseudo vide');
			if (value == 'none')
				throw new Error('value not authorize');
			if (value.length < 3)
				throw new Error('value too short');
			const special_chars = /[`!@#$%^&*()_\-+=\[\]{};':"\\|,.<>\/?~ ]/;
			if (special_chars.test(value))
				throw new Error('value contains char');
			if (value == last_tournament_name)
				throw new Error('value already on it');
			send_button.disabled = false;
		} catch (e) {
			send_button.disabled = true;
		}
	};
}

export async function receiveTournamentLeftSocket() {
	if (window.location.hash != pageStatus.DashboardTournament) {return ;}
	window.location.hash = pageStatus.DashboardLobby;
}

export async function receiveTournamentMajPageSocket(data) {
	if (window.location.hash != pageStatus.DashboardTournament) {return ;}
	majTournamentPanel(data.refreshPlayers, data.refreshMatch);
}

async function majTournamentPanel(needRefreshPlayers, needRefreshGame) {
	try {
		const csrfToken = await getCSRFToken();
		
		if (csrfToken) {
			const {data} = await axios.post('https://' + window.location.hostname + ':' + window.location.port + '/api/features/getTournamentInfo', {
			}, {
				headers: {
					'Content-Type': 'application/json',
					'X-CSRFToken': csrfToken,
				},
				withCredentials: true,
			});

			if (data && data.success) {
				majDesignTPanel(data.data, needRefreshPlayers, needRefreshGame);
				return true
			} else {
				if (data && data.message) {showNotificationError(data.message);};
				return false;
			}
		} else {
			return false;
		};

	} catch (error) {
		showNotificationError("Error while recovering tournament infos");
		return false;
	}
}

async function majDesignTPanel(data, needRefreshPlayers, needRefreshGame) {
	tournament_status = data.status;
	if (data.status == 'round1' || data.status == 'round2') {
		window.location.hash = pageStatus.Game;
		return ;
	}
	if (needRefreshPlayers == true) {
		if (data.j1 != 'none') {
			const profil = await searchUserInfos(data.j1);

			let P1Name = document.getElementById('P1Name');
			if (P1Name) {P1Name.innerText = data.j1_pseudo;};

			let P1Nameid = document.getElementById('P1Nameid');
			if (P1Nameid) {P1Nameid.innerText = data.j1;};

			if (profil) {
				let P1Pic = document.getElementById('P1Pic');
				if (P1Pic) {P1Pic.src = profil.picture;};
			}

			let P1Icon = document.getElementById('P1Icon');
			if (P1Icon) {
				if (data.j1Status == 'ready' && (data.status == 'ready' || data.status == 'prepare2')) {
					P1Icon.classList.remove('hidden');} 
				else {P1Icon.classList.add('hidden');}
			};
			if (data.j1 == me_user_id) {
				let editTournamentPseudoInput = document.getElementById('editTournamentPseudoInput');
				if (editTournamentPseudoInput) {editTournamentPseudoInput.value = data.j1_pseudo;};
				last_tournament_name = data.j1_pseudo;
			}
		} else {
			let P1Name = document.getElementById('P1Name');
			if (P1Name) {P1Name.innerText = 'waiting for players . . .';};

			let P1Nameid = document.getElementById('P1Nameid');
			if (P1Nameid) {P1Nameid.innerText = 'waiting for players . . .';};

			let P1Pic = document.getElementById('P1Pic');
			if (P1Pic) {P1Pic.src = './noUser.png';};

			let P1Icon = document.getElementById('P1Icon');
			if (P1Icon) {P1Icon.classList.add('hidden');};
		}
		if (data.j2 != 'none') {
			const profil = await searchUserInfos(data.j2);

			let P2Name = document.getElementById('P2Name');
			if (P2Name) {P2Name.innerText = data.j2_pseudo;};

			let P2Nameid = document.getElementById('P2Nameid');
			if (P2Nameid) {P2Nameid.innerText = data.j2;};

			if (profil) {
				let P2Pic = document.getElementById('P2Pic');
				if (P2Pic) {P2Pic.src = profil.picture;};
			};

			let P2Icon = document.getElementById('P2Icon');
			if (P2Icon) {
				if (data.j2Status == 'ready' && (data.status == 'ready' || data.status == 'prepare2')) {P2Icon.classList.remove('hidden');} 
				else {P2Icon.classList.add('hidden');}
			};
			if (data.j2 == me_user_id) {
				let editTournamentPseudoInput = document.getElementById('editTournamentPseudoInput');
				if (editTournamentPseudoInput) {editTournamentPseudoInput.value = data.j2_pseudo;};
				last_tournament_name = data.j2_pseudo;
			}
		} else {
			let P2Name = document.getElementById('P2Name');
			if (P2Name) {P2Name.innerText = 'waiting for players . . .';};

			let P2Nameid = document.getElementById('P2Nameid');
			if (P2Nameid) {P2Nameid.innerText = 'waiting for players . . .';};

			let P2Pic = document.getElementById('P2Pic');
			if (P2Pic) {P2Pic.src = './noUser.png';};

			let P2Icon = document.getElementById('P2Icon');
			if (P2Icon) {P2Icon.classList.add('hidden');};
		}
		if (data.j3 != 'none') {
			const profil = await searchUserInfos(data.j3);

			let P3Name = document.getElementById('P3Name');
			if (P3Name) {P3Name.innerText = data.j3_pseudo;};

			let P3Nameid = document.getElementById('P3Nameid');
			if (P3Nameid) {P3Nameid.innerText = data.j3;};

			if (profil) {
				let P3Pic = document.getElementById('P3Pic');
				if (P3Pic) {P3Pic.src = profil.picture;};
			};

			let P3Icon = document.getElementById('P3Icon');
			if (P3Icon) {
				if (data.j3Status == 'ready' && (data.status == 'ready' || data.status == 'prepare2')) {P3Icon.classList.remove('hidden');} 
				else {P3Icon.classList.add('hidden');}
			};
			if (data.j3 == me_user_id) {
				let editTournamentPseudoInput = document.getElementById('editTournamentPseudoInput');
				if (editTournamentPseudoInput) {editTournamentPseudoInput.value = data.j3_pseudo;};
				last_tournament_name = data.j3_pseudo;
			}
		} else {
			let P3Name = document.getElementById('P3Name');
			if (P3Name) {P3Name.innerText = 'waiting for players . . .';};
			
			let P3Nameid = document.getElementById('P3Nameid');
			if (P3Nameid) {P3Nameid.innerText = 'waiting for players . . .';};

			let P3Pic = document.getElementById('P3Pic');
			if (P3Pic) {P3Pic.src = './noUser.png';};

			let P3Icon = document.getElementById('P3Icon');
			if (P3Icon) {P3Icon.classList.add('hidden');};
		}
		if (data.j4 != 'none') {
			const profil = await searchUserInfos(data.j4);
			
			let P4Name = document.getElementById('P4Name');
			if (P4Name) {P4Name.innerText = data.j4_pseudo;};

			let P4Nameid = document.getElementById('P4Nameid');
			if (P4Nameid) {P4Nameid.innerText = data.j4;};

			if (profil) {
				let P4Pic = document.getElementById('P4Pic');
				if (P4Pic) {P4Pic.src = profil.picture;};
			};

			let P4Icon = document.getElementById('P4Icon');
			if (P4Icon) {
				if (data.j4Status == 'ready' && (data.status == 'ready' || data.status == 'prepare2')) {P4Icon.classList.remove('hidden');} 
				else {P4Icon.classList.add('hidden');}
			};
			if (data.j4 == me_user_id) {
				let editTournamentPseudoInput = document.getElementById('editTournamentPseudoInput');
				if (editTournamentPseudoInput) {editTournamentPseudoInput.value = data.j4_pseudo;};
				last_tournament_name = data.j4_pseudo;
			}
		} else {
			let P4Name = document.getElementById('P4Name');
			if (P4Name) {P4Name.innerText = 'waiting for players . . .';};

			let P4Nameid = document.getElementById('P4Nameid');
			if (P4Nameid) {P4Nameid.innerText = 'waiting for players . . .';};

			let P4Pic = document.getElementById('P4Pic');
			if (P4Pic) {P4Pic.src = './noUser.png';};

			let P4Icon = document.getElementById('P4Icon');
			if (P4Icon) {P4Icon.classList.add('hidden');};
		}
	}

	let tournamentReadyButton = document.getElementById('tournamentReadyButton');
	let tournamentReadyButton2 = document.getElementById('tournamentReadyButton2');
	let MatchPanelButtonsLoad = document.getElementById('MatchPanelButtonsLoad');
	let tournamentStatus = document.getElementById('tournamentStatus');
	let ChangeTournamentPseudoPanel = document.getElementById('ChangeTournamentPseudoPanel');
	let tournamentLeaveButton = document.getElementById('tournamentLeaveButton');

	if (tournamentReadyButton && tournamentReadyButton2 && MatchPanelButtonsLoad && tournamentStatus && ChangeTournamentPseudoPanel && tournamentLeaveButton) {
		if (data.status == 'none') {
			tournamentReadyButton.classList.add('hidden');
			tournamentReadyButton2.classList.add('hidden');
			MatchPanelButtonsLoad.classList.remove('hidden');
			tournamentStatus.innerText = "Waiting for players . . .";
			// ChangeTournamentPseudoPanel.classList.remove('hidden');
			ChangeTournamentPseudoPanel.classList.add('hidden');

		} else if (data.status == 'ready') {
			if (data.isReady == true) {
				tournamentReadyButton.classList.add('hidden');
				MatchPanelButtonsLoad.classList.remove('hidden');
			} else {
				tournamentReadyButton.classList.remove('hidden');
				MatchPanelButtonsLoad.classList.add('hidden');
			}
			tournamentReadyButton2.classList.add('hidden');
			tournamentStatus.innerText = "Game ready to start";
			ChangeTournamentPseudoPanel.classList.remove('hidden');


		} else if (data.status == 'prepare') {
			tournamentReadyButton.classList.add('hidden');
			tournamentReadyButton2.classList.add('hidden');
			MatchPanelButtonsLoad.classList.remove('hidden');
			tournamentStatus.innerText = "loading match details";
			ChangeTournamentPseudoPanel.classList.remove('hidden');
			tournamentLeaveButton.classList.add('hidden');

			if (needRefreshGame) {
				await majDesignMatchTournament(false);
			}

		} else if (data.status == 'round1RTS') {
			tournamentStatus.innerText = "Round 1";
			tournamentReadyButton.classList.add('hidden');
			tournamentReadyButton2.classList.add('hidden');
			MatchPanelButtonsLoad.classList.remove('hidden');
			ChangeTournamentPseudoPanel.classList.add('hidden');
			tournamentLeaveButton.classList.add('hidden');

			if (needRefreshGame) {
				await majDesignMatchTournament(false);
			}
			toggleCount(true)

		} else if (data.status == 'round1Over' || data.status == 'round1O2' || data.status == 'prepare2_') {
			tournamentStatus.innerText = "Results of the round 1";
			tournamentReadyButton.classList.add('hidden');
			tournamentReadyButton2.classList.add('hidden');
			ChangeTournamentPseudoPanel.classList.add('hidden');
			tournamentLeaveButton.classList.add('hidden');

			if (needRefreshGame) {
				await majDesignMatchTournament(false);
			}


		} else if (data.status == 'prepare2') {
			tournamentReadyButton.classList.add('hidden');
			if (data.isReady == true) {
				tournamentReadyButton2.classList.add('hidden');
				MatchPanelButtonsLoad.classList.remove('hidden');
			} else {
				tournamentReadyButton2.classList.remove('hidden');
				MatchPanelButtonsLoad.classList.add('hidden');
			}
			tournamentStatus.innerText = "ready to start round 2";
			ChangeTournamentPseudoPanel.classList.add('hidden');
			tournamentLeaveButton.classList.add('hidden')
			if (needRefreshGame) {
				await majDesignMatchTournament(true);
			}


		} else if (data.status == 'round2RTS') {
			tournamentStatus.innerText = "Round 2";
			tournamentReadyButton.classList.add('hidden');
			tournamentReadyButton2.classList.add('hidden');
			MatchPanelButtonsLoad.classList.remove('hidden');
			ChangeTournamentPseudoPanel.classList.add('hidden');
			tournamentLeaveButton.classList.add('hidden');
			
			if (needRefreshGame) {
				await majDesignMatchTournament(true);
			}

			toggleCount(true)

		} else if (data.status == 'round2Over' || data.status == 'round2O1' || data.status == 'round2O2' || data.status == 'round2O3') {
			tournamentStatus.innerText = "Finals results";
			tournamentReadyButton.classList.add('hidden');
			tournamentReadyButton2.classList.add('hidden');
			ChangeTournamentPseudoPanel.classList.add('hidden');
			tournamentLeaveButton.classList.add('hidden');

			if (needRefreshGame) {
				await majDesignMatchTournament(true);
			}
			if (data.status == 'round2Over') {
				let tournamentLeaveAtEndButton = document.getElementById('tournamentLeaveAtEndButton');
				if (tournamentLeaveAtEndButton) {tournamentLeaveAtEndButton.classList.remove('hidden');};
				MatchPanelButtonsLoad.classList.add('hidden');
			}
		} else if (data.status == 'ended') {
			tournamentStatus.innerText = "Tournament is ended .";
			ChangeTournamentPseudoPanel.classList.add('hidden');
			tournamentLeaveButton.classList.add('hidden');
			window.location.hash()
			return ;
		}
	}
}

async function majDesignMatchTournament(isRound2){
	const data = await majTournamentMatchRequest();
	if (data == false) {return ;}
	const {match1, match2, match3, match4} = data;
	if (match1 != false) {
		let m1p1Name = document.getElementById('m1p1Name');
		if (m1p1Name) {m1p1Name.innerText = match1.j1Name;};

		let m1p1Picture = document.getElementById('m1p1Picture');
		if (m1p1Picture) {m1p1Picture.src = match1.j1Picture;};

		let m1p2Name = document.getElementById('m1p2Name');
		if (m1p2Name) {m1p2Name.innerText = match1.j2Name;};

		let m1p2Picture = document.getElementById('m1p2Picture');
		if (m1p2Picture) {m1p2Picture.src = match1.j2Picture;};

		let m1p1Icon = document.getElementById('m1p1Icon');
		let m1p2Icon = document.getElementById('m1p2Icon');

		if (m1p1Icon && m1p2Icon) {
			if (match1.status == 'ended') {
				if(match1.winner == match1.j1) {
					m1p1Icon.src = './crown.gif';
					m1p2Icon.src = './tombstone.gif';
				} else {
					m1p1Icon.src = './tombstone.gif';
					m1p2Icon.src = './crown.gif';
				}
				m1p1Icon.classList.remove('hidden');
				m1p2Icon.classList.remove('hidden');
			} else {
				m1p1Icon.classList.add('hidden');
				m1p2Icon.classList.add('hidden');
			}
		};
	} else {}
	if (match2 != false) {
		let m2p1Name = document.getElementById('m2p1Name');
		if (m2p1Name) {m2p1Name.innerText = match2.j1Name;};

		let m2p1Picture = document.getElementById('m2p1Picture');
		if (m2p1Picture) {m2p1Picture.src = match2.j1Picture;};

		let m2p2Name = document.getElementById('m2p2Name');
		if (m2p2Name) {m2p2Name.innerText = match2.j2Name;};

		let m2p2Picture = document.getElementById('m2p2Picture');
		if (m2p2Picture) {m2p2Picture.src = match2.j2Picture;};

		let m2p1Icon = document.getElementById('m2p1Icon');
		let m2p2Icon = document.getElementById('m2p2Icon');

		if (m2p1Icon && m2p2Icon) {
			if (match2.status == 'ended') {
				if(match2.winner == match2.j1) {
					m2p1Icon.src = './crown.gif';
					m2p2Icon.src = './tombstone.gif';
				} else {
					m2p1Icon.src = './tombstone.gif';
					m2p2Icon.src = './crown.gif';
				}
				m2p1Icon.classList.remove('hidden');
				m2p2Icon.classList.remove('hidden');
			} else {
				m2p1Icon.classList.add('hidden');
				m2p2Icon.classList.add('hidden');
			}
		};
	} else {}
	if (isRound2 == false){return ;}
	if (match3 != false) {
		let m3p1Name = document.getElementById('m3p1Name');
		if (m3p1Name) {m3p1Name.innerText = match3.j1Name;};

		let m3p1Picture = document.getElementById('m3p1Picture');
		if (m3p1Picture) {m3p1Picture.src = match3.j1Picture;};

		let m3p2Name = document.getElementById('m3p2Name');
		if (m3p2Name) {m3p2Name.innerText = match3.j2Name;};

		let m3p2Picture = document.getElementById('m3p2Picture');
		if (m3p2Picture) {m3p2Picture.src = match3.j2Picture;};

		let m3p1Icon = document.getElementById('m3p1Icon');
		let m3p2Icon = document.getElementById('m3p2Icon');

		if (m3p1Icon && m3p2Icon) {
			if (match3.status == 'ended') {
				if(match3.winner == match3.j1) {
					m3p1Icon.src = './crown.gif';
					m3p2Icon.src = './tombstone.gif';
				} else {
					m3p1Icon.src = './tombstone.gif';
					m3p2Icon.src = './crown.gif';
				}
				m3p1Icon.classList.remove('hidden');
				m3p2Icon.classList.remove('hidden');
			} else {
				m3p1Icon.classList.add('hidden');
				m3p2Icon.classList.add('hidden');
			}
		};
	} else {}
	if (match4 != false) {
		let m4p1Name = document.getElementById('m4p1Name');
		if (m4p1Name) {m4p1Name.innerText = match4.j1Name;};

		let m4p1Picture = document.getElementById('m4p1Picture');
		if (m4p1Picture) {m4p1Picture.src = match4.j1Picture;};

		let m4p2Name = document.getElementById('m4p2Name');
		if (m4p2Name) {m4p2Name.innerText = match4.j2Name;};

		let m4p2Picture = document.getElementById('m4p2Picture');
		if (m4p2Picture) {m4p2Picture.src = match4.j2Picture;}

		let m4p1Icon = document.getElementById('m4p1Icon');
		let m4p2Icon = document.getElementById('m4p2Icon');

		if (m4p1Icon && m4p2Icon) {
			if (match4.status == 'ended') {
				if(match4.winner == match4.j1) {
					m4p1Icon.src = './crown.gif';
					m4p2Icon.src = './tombstone.gif';
				} else {
					m4p1Icon.src = './tombstone.gif';
					m4p2Icon.src = './crown.gif';
				}
				m4p1Icon.classList.remove('hidden');
				m4p2Icon.classList.remove('hidden');
			} else {
				m4p1Icon.classList.add('hidden');
				m4p2Icon.classList.add('hidden');
			}
		};
	} else {}
}

async function majTournamentMatchRequest(index) {
	try {
		const csrfToken = await getCSRFToken();

		if (csrfToken) {
			const {data} = await axios.post('https://' + window.location.hostname + ':' + window.location.port + '/api/features/getTournamentInfo/match', {
			}, {
				headers: {
					'Content-Type': 'application/json',
					'X-CSRFToken': csrfToken,
				},
				withCredentials: true,
			});

			if (data && data.success) {
				return(data.data);
			} else {
				if (data && data.message) {showNotificationError(data.message);};
				return false;
			}
		} else {
			return false;
		};

	} catch (error) {
		showNotificationError("Error while recovering tournament match infos");
		return false;
	}
}

// all state of tournament :

// -> 'in_queue' or 'none'
// -> 'ready'
// -> 'prepare'
// -> 'round1RTS' = round1ReadyToStart
// -> 'round1'
// -> 'round1Over'
// -> 'prepare'
// -> 'round2RTS'
// -> 'round2'
// -> 'round2Over'
// -> 'ended'