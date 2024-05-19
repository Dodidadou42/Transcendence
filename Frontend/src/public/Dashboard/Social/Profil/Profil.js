/* ################### Social profil Page event ##########################  */

import {pageStatus} from './Website.js';
import {GetStatus, UpdateStatus} from './Website.js';
import {getCSRFToken, showNotificationError} from './Website.js';
import {me_user_id, socket} from "./Website.js"

import {set_selected_mode, get_selected_mode, set_custom, get_custom,
	set_custom_selected_mode, get_custom_selected_mode, 
	set_custom_power_active, get_custom_power_active,
	set_inviteForGroupPos, get_inviteForGroupPos,
	set_J1, get_J1, set_J2, get_J2, set_J3, get_J3, set_J4, get_J4, Modes} from './Dashboard.js';

import {get_profil_to_check, set_profil_to_check} from './DSocial.js';

import {add_history_to_profil} from '/Dashboard.js';
import {sendAddFriend} from './Dashboard.js';

import {sendCreateTable, sendUnBlockContact, sendBlockContact} from './DSocial.js';

var page = "";

let current_history = 0;

export async function LoadPage() {
	const child = document.getElementById('content');
	if (!child) {return ;}
	if (page != "") {
		child.innerHTML = page;
		Page();
	} else {
		var cssLink = document.createElement('link');
		cssLink.rel = 'stylesheet';
		cssLink.href = './SProfil.css';
		document.head.appendChild(cssLink);
        cssLink.onload = function() {
            fetch('SProfil.html')
            .then(response => response.text())
            .then(html => {
                page = html;
                child.innerHTML = page;
				child.classList.remove("hidden")
				Page()
            });
        }
	}
	UpdateStatus(pageStatus.DashboardSocialProfil);
    document.title = "Dashboard Social Profil"
}

export function UnloadPage() {
	UpdateStatus("");
	
	let historyLoadMore = document.getElementById("historyLoadMore");
	if (historyLoadMore) {historyLoadMore.removeEventListener('click', ()=>{});};

	let Afriend = document.getElementById('Afriend');
	if (Afriend) {Afriend.removeEventListener('click', ()=>{});};

	let Acceptfriend = document.getElementById('Acceptfriend');
	if (Acceptfriend) {Acceptfriend.removeEventListener('click', ()=>{});};

	let Rfriend = document.getElementById('Rfriend');
	if (Rfriend) {Rfriend.removeEventListener('click', ()=>{});};

	let Sentfriend = document.getElementById('Sentfriend');
	if (Sentfriend) {Sentfriend.removeEventListener('click', ()=>{});};

	let BlockB = document.getElementById('BlockB');
	if (BlockB) {BlockB.removeEventListener('click', ()=>{});};

	let UnblockB = document.getElementById('UnblockB');
	if (UnblockB) {UnblockB.removeEventListener('click', ()=>{});};

	let BattleB = document.getElementById('BattleB');
	if (BattleB) {BattleB.removeEventListener('click', ()=>{});};

	let BattleBBack = document.getElementById('BattleBBack');
	if (BattleBBack) {BattleBBack.removeEventListener('click', ()=>{});};

	let BattleBClassic = document.getElementById('BattleBClassic');
	if (BattleBClassic) {BattleBClassic.removeEventListener('click', ()=>{});};

	let BattleBPower = document.getElementById('BattleBPower');
	if (BattleBPower) {BattleBPower.removeEventListener('click', ()=>{});};
}

async function Page() {
	current_history = 0;

	const hashParts = window.location.hash.split('&');
	
	if (hashParts.length == 2) {
		const param_name = hashParts[1].split('=');
		const id = decodeURIComponent(param_name[1]);

		set_profil_to_check(id);

		if (id == me_user_id) {
			window.location.hash = pageStatus.DashboardSocialContacts;
		}

		try {

			const csrfToken = await getCSRFToken();

			if (csrfToken) {
				const {data} = await axios.post('https://' + window.location.hostname + ':' + window.location.port + '/api/social/user_info_profil', {
					user: id,
				}, {
					headers: {
						'Content-Type': 'application/json',
						'X-CSRFToken': csrfToken,
					},
					withCredentials: true,
				});

				if (data && data.success) {

					let userImg = document.getElementById('userImg');
					if (userImg) {userImg.src = data.profil.picture;};

					let userId = document.getElementById('userId');
					if (userId) {userId.innerText = data.profil.user_id;};

					let userPseudo = document.getElementById('userPseudo');
					if (userPseudo) {userPseudo.innerText = data.profil.pseudo;};

					let userStatusValue = document.getElementById('userStatusValue');
					const pastille = document.getElementById('statusPastille');

					if (userStatusValue && pastille) {
						if (data.profil.online){
							if (data.profil.inGame == false)
							{
								userStatusValue.innerText = 'Online';
								pastille.classList.add('online');
								pastille.classList.remove('offline');
								pastille.classList.remove('ingame');
							} else {
								userStatusValue.innerText = 'In Game';
								pastille.classList.add('ingame');
								pastille.classList.remove('online');
								pastille.classList.remove('offline');
							}
						} else {
							userStatusValue.innerText = 'Offline';
							pastille.classList.remove('online');
							pastille.classList.add('offline');
							pastille.classList.remove('ingame');
						}
					}

					let descValue = document.getElementById('descValue');
					if (descValue) {descValue.innerText = data.profil.desc;};

					let vicvalue = document.getElementById('vicvalue');
					if (vicvalue) {vicvalue.innerText = data.profil.victory;};

					if (data.profil.gamePlayed == 0) {
						var ratio_kd = 1
					} else {
						var ratio_kd = data.profil.victory / data.profil.gamePlayed
					}
					let roundedNumber = Math.round(ratio_kd * 1000) / 1000;
					let formattedNumber = roundedNumber.toFixed(3);

					let ratioValue = document.getElementById('ratioValue');
					if (ratioValue) {ratioValue.innerText = formattedNumber;};
					
					let gpValue = document.getElementById('gpValue');
					if (gpValue) {gpValue.innerText = data.profil.gamePlayed;};

					let mmrValue = document.getElementById('mmrValue');
					if (mmrValue) {mmrValue.innerText = data.profil.mmr1;};

					const userLevel = data.profil.level;
					
					let lvltext = document.getElementById('lvltext');
					if (lvltext) {lvltext.innerText = 'Level : ' + ((userLevel - (userLevel % 100)) / 100);};

					let lvl = document.getElementById('lvl');
					if (lvl) {lvl.style.width = `${(userLevel % 100)}%`;};

					let Afriend = document.getElementById('Afriend');

					if (Afriend) {
						if (data.profil.isBlocked) {
							Afriend.classList.add('hidden');

							let BattleB = document.getElementById('BattleB');
							if (BattleB) {BattleB.classList.add('hidden');};

							if (data.profil.sentBlocked) {
								let BlockB = document.getElementById('BlockB');
								if (BlockB) {BlockB.classList.add('hidden');};

								let UnblockB = document.getElementById('UnblockB');
								if (UnblockB) {UnblockB.classList.remove('hidden');};
							}
							if (data.profil.ReceiveBlocked)
							{
								let BlockedBy = document.getElementById('BlockedBy')
								if (BlockedBy) {BlockedBy.classList.remove('hidden');};
							}

						} else {
							if (data.profil.isFriend) {
								Afriend.classList.add('hidden');

								let Rfriend = document.getElementById('Rfriend');
								if (Rfriend) {Rfriend.classList.remove('hidden');};
							}
							if (data.profil.sentFriend) {
								Afriend.classList.add('hidden');

								let Sentfriend = document.getElementById('Sentfriend');
								if (Sentfriend) {Sentfriend.classList.remove('hidden');};
							}
							if (data.profil.ReceiveFriend) {
								Afriend.classList.add('hidden');

								let Acceptfriend = document.getElementById('Acceptfriend');
								if (Acceptfriend) {Acceptfriend.classList.remove('hidden');};
							}
						}
					}
				} else {
					if (data && data.message) {showNotificationError(data.message);};
					window.location.hash = pageStatus.DashboardSocialContacts;
					return ;
				}
			};

		} catch (error) {
			showNotificationError("Error while searching user infos");
			window.location.hash = pageStatus.DashboardSocialContacts;
			return ;
		}

		await add_history_to_profil(get_profil_to_check(), 3, current_history);
		current_history += 3;

		let historyLoadMore = document.getElementById("historyLoadMore");
		if (historyLoadMore) {
			historyLoadMore.onclick = async () => {
				await add_history_to_profil(get_profil_to_check(), 3, current_history);
				current_history += 3;
			};
		};
	};

	let Afriend = document.getElementById('Afriend');
	if (Afriend) {
		Afriend.onclick = async () => {
			sendAddFriend(get_profil_to_check())
		};
	};

	let Acceptfriend = document.getElementById('Acceptfriend');
	if (Acceptfriend) {
		Acceptfriend.onclick = async () => {
			sendAddFriend(get_profil_to_check())
		};
	};

	let Rfriend = document.getElementById('Rfriend');
	if (Rfriend) {
		Rfriend.onclick = async () => {
			sendRemoveFriend(get_profil_to_check())
		};
	};

	let Sentfriend = document.getElementById('Sentfriend');
	if (Sentfriend) {
		Sentfriend.onclick = async () => {
			sendRemoveFriend(get_profil_to_check())
		};
	};

	let BlockB = document.getElementById('BlockB');
	if (BlockB) {
		BlockB.onclick = async () => {
			sendBlockContact(get_profil_to_check())
		};
	};

	let UnblockB = document.getElementById('UnblockB');
	if (UnblockB) {
		UnblockB.onclick = async () => {
			sendUnBlockContact(get_profil_to_check());
		};
	};

	let BattleB = document.getElementById('BattleB');
	if (BattleB) {
		BattleB.onclick = async () => {
			let interaction = document.getElementById('interaction');
			if (interaction) {interaction.classList.add('hidden');};

			let selectBattleMode = document.getElementById('selectBattleMode');
			if (selectBattleMode) {selectBattleMode.classList.remove('hidden');};
		};
	};
	
	let BattleBBack = document.getElementById('BattleBBack');
	if (BattleBBack) {
		BattleBBack.onclick = async () => {
			let interaction = document.getElementById('interaction');
			if (interaction) {interaction.classList.remove('hidden');};

			let selectBattleMode = document.getElementById('selectBattleMode');
			if (selectBattleMode) {selectBattleMode.classList.add('hidden');};
		};
	};
	
	let BattleBClassic = document.getElementById('BattleBClassic');
	if (BattleBClassic) {
		BattleBClassic.onclick = async () => {
			sendCreateTable(get_profil_to_check(), Modes[1])

			let interaction = document.getElementById('interaction');
			if (interaction) {interaction.classList.remove('hidden');};

			let selectBattleMode = document.getElementById('selectBattleMode');
			if (selectBattleMode) {selectBattleMode.classList.add('hidden');};
		};
	};
	
	let BattleBPower = document.getElementById('BattleBPower');
	if (BattleBPower) {
		BattleBPower.onclick = async () => {
			sendCreateTable(get_profil_to_check(), Modes[2])

			let interaction = document.getElementById('interaction');
			if (interaction) {interaction.classList.remove('hidden');};

			let selectBattleMode = document.getElementById('selectBattleMode');
			if (selectBattleMode) {selectBattleMode.classList.add('hidden');};
		};
	};
}

async function sendRemoveFriend(friend_user) {
	if (socket && socket.readyState === WebSocket.OPEN) {
		socket.send(JSON.stringify({'recipient': friend_user, 'event_type': "contact_unfriend"}));
	} else {
		showNotificationError("Error with Websocket");
	}
}