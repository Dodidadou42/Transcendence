/* ################### Social contact Page event ##########################  */

import {pageStatus} from './Website.js';
import {GetStatus, UpdateStatus} from './Website.js';
import {getCSRFToken, showNotificationError} from './Website.js';
import {me_user_id, socket} from "./Website.js"

import {set_selected_mode, get_selected_mode, set_custom, get_custom,
	set_custom_selected_mode, get_custom_selected_mode, 
	set_custom_power_active, get_custom_power_active,
	set_inviteForGroupPos, get_inviteForGroupPos,
	set_J1, get_J1, set_J2, get_J2, set_J3, get_J3, set_J4, get_J4, Modes} from '/Dashboard.js';

import {see_profil} from './Website.js';

import {sendAddFriend} from '/Dashboard.js';

import {sendBlockContact, sendUnBlockContact, sendCreateTable} from './DSocial.js';

import {openChat} from './DSocial.js';

var page = "";

let social_filter_status = 'online';

export async function LoadPage() {
	const child = document.getElementById('content');
	if (!child) {return ;}
	if (page != "") {
		child.innerHTML = page;
		Page();
	} else {
		var cssLink = document.createElement('link');
		cssLink.rel = 'stylesheet';
		cssLink.href = './SContacts.css';
		document.head.appendChild(cssLink);
        cssLink.onload = function() {
            fetch('SContacts.html')
            .then(response => response.text())
            .then(html => {
                page = html;
                child.innerHTML = page;
				child.classList.remove("hidden")
				Page()
            });
        }
	}
	UpdateStatus(pageStatus.DashboardSocialContacts);
    document.title = "Dashboard Social Contacts"
}

export function UnloadPage() {
	UpdateStatus("");

	let AllFilter = document.getElementById('AllFilter');
	if (AllFilter) {AllFilter.removeEventListener('click', ()=>{});};

	let FriendFilter = document.getElementById('FriendFilter');
	if (FriendFilter) {FriendFilter.removeEventListener('click', ()=>{});};

	let OnlineFilter = document.getElementById('OnlineFilter');
	if (OnlineFilter) {OnlineFilter.removeEventListener('click', ()=>{});};

	let RequestFilter = document.getElementById('RequestFilter');
	if (RequestFilter) {RequestFilter.removeEventListener('click', ()=>{});};

	let BlockedFilter = document.getElementById('BlockedFilter');
	if (BlockedFilter) {BlockedFilter.removeEventListener('click', ()=>{});};

	let searchBar = document.getElementById('searchBar');
	if (searchBar) {
		searchBar.removeEventListener('focus', ()=>{});
		searchBar.removeEventListener('blur', ()=>{});
		searchBar.removeEventListener('input', ()=>{});
	};
}

async function Page() {
	handleFilter(social_filter_status);

	let AllFilter = document.getElementById('AllFilter');
	if (AllFilter) {
		AllFilter.addEventListener('click', () => {
			handleFilter('all');
		});
	;}

	let FriendFilter = document.getElementById('FriendFilter');
	if (FriendFilter) {
		FriendFilter.addEventListener('click', () => {
			handleFilter('friend');
		});
	};


	let OnlineFilter = document.getElementById('OnlineFilter');
	if (OnlineFilter) {
		OnlineFilter.addEventListener('click', () => {
			handleFilter('online');
		});
	};

	let RequestFilter = document.getElementById('RequestFilter');
	if (RequestFilter) {
		RequestFilter.addEventListener('click', () => {
			handleFilter('request');
		});
	};

	let BlockedFilter = document.getElementById('BlockedFilter');
	if (BlockedFilter) {
		BlockedFilter.addEventListener('click', () => {
			handleFilter('blocked');
		});
	};

	let searchBar = document.getElementById('searchBar');
	if (searchBar) {
		searchBar.addEventListener('focus', (event) => {
			let searchBarOut = document.getElementById('searchBarOut');
			if (searchBarOut) {searchBarOut.classList.add('searchFocus');};
		});
		searchBar.addEventListener('blur', (event) => {
			let searchBarOut = document.getElementById('searchBarOut');
			if (searchBarOut) {searchBarOut.classList.remove('searchFocus');};
		});
		searchBar.addEventListener('input', (event) => {
			GetUserList(event.target.value);
		});
	};

	GetUserList('');
}

async function GetUserList(input_value) {
	let resultOut = document.getElementById('resultOut');
	if (resultOut) {resultOut.innerHTML = `<div class="load"><load-one></load-one></div>`;};
	try {

		const csrfToken = await getCSRFToken();

		if (csrfToken) {
			const {data} = await axios.post('https://' + window.location.hostname + ':' + window.location.port + '/api/social/search', {
				filter: social_filter_status,
				user_input: input_value,
			}, {
				headers: {
					'Content-Type': 'application/json',
					'X-CSRFToken': csrfToken,
				},
				withCredentials: true,
			});

			if (data && data.success) {
				let resultOut = document.getElementById('resultOut');
				if (resultOut) {resultOut.innerHTML = '';};
				for (let i = 0; i < data.List.length; i++) {
					if (social_filter_status === 'blocked'){
						create_profil_blocked(data.List[i].user_id, data.List[i].pseudo, data.List[i].picture, see_profil);
					} else if (social_filter_status === 'request'){
						create_profil_request(data.List[i].user_id, data.List[i].pseudo, data.List[i].picture, see_profil);
					}
					else {
						create_profil(data.List[i].user_id, data.List[i].pseudo, data.List[i].picture, see_profil);
					}
				}

			} else {
				if (data && data.message) {showNotificationError(data.message);};
			}
		};

	} catch (error) {
		showNotificationError("Error while searching user list");
	}
}

async function create_profil(pseudo, status, img_src, checkProfil) {
	const panel = document.getElementById('resultOut');
	if (panel) {
		try {
			const profil = document.createElement('div');
			profil.id = 'profil' + pseudo;
			profil.classList.add('profil');

			const profilInfos = document.createElement('div');
			profilInfos.id = 'profilInfos' + pseudo;
			profilInfos.classList.add('profilInfos');

			const profilImg = document.createElement('img');
			profilImg.src = img_src;
			profilImg.id = 'profilImg' + pseudo;
			profilImg.classList.add('profilImg');

			const profilInfosText = document.createElement('div');
			profilInfosText.id = 'profilInfosText' + pseudo;
			profilInfosText.classList.add('profilInfosText');

			const profilInfosPseudo = document.createElement('profilInfosPseudo');
			profilInfosPseudo.id = 'profilInfosPseudo' + pseudo;
			profilInfosPseudo.classList.add('profilInfosPseudo');
			profilInfosPseudo.innerText = pseudo;

			const profilInfosStatus = document.createElement('div');
			profilInfosStatus.id = 'profilInfosStatus' + pseudo;
			profilInfosStatus.classList.add('profilInfosStatus');
			profilInfosStatus.innerText = status;

			profilInfosText.appendChild(profilInfosPseudo);
			profilInfosText.appendChild(profilInfosStatus);

			profilInfos.appendChild(profilImg);
			profilInfos.appendChild(profilInfosText);

			const profilInteraction = document.createElement('div');
			profilInteraction.id = 'profilInteraction' + pseudo;
			profilInteraction.classList.add('profilInteraction');

			const ProfilButton = document.createElement('div');
			ProfilButton.id = 'ProfilButton' + pseudo;
			ProfilButton.classList.add('ProfilButton');

			const profilIcon = document.createElement('span');
			profilIcon.classList.add('material-symbols-outlined');
			profilIcon.classList.add('profilIcon');
			profilIcon.innerHTML = 'folder_supervised';

			const profilText = document.createElement('div');
			profilText.classList.add('profilText');
			profilText.innerText = 'Profil';

			ProfilButton.appendChild(profilIcon);
			ProfilButton.appendChild(profilText);

			ProfilButton.onclick = () => {checkProfil(pseudo);};

			profilInteraction.appendChild(ProfilButton);

			const ChatButton = document.createElement('div');
			ChatButton.id = 'ChatButton' + pseudo;
			ChatButton.classList.add('ProfilButton');

			const ChatIcon = document.createElement('span');
			ChatIcon.classList.add('material-symbols-outlined');
			ChatIcon.classList.add('profilIcon');
			ChatIcon.innerHTML = 'chat';

			const ChatText = document.createElement('div');
			ChatText.classList.add('profilText');
			ChatText.innerText = 'Chat';

			ChatButton.appendChild(ChatIcon);
			ChatButton.appendChild(ChatText);

			ChatButton.onclick = () => {openChat(pseudo, false);};

			profilInteraction.appendChild(ChatButton);

			const BattleButton = document.createElement('div');
			BattleButton.id = 'BattleButton' + pseudo;
			BattleButton.classList.add('ProfilButton');

			const BattleIcon = document.createElement('span');
			BattleIcon.classList.add('material-symbols-outlined');
			BattleIcon.classList.add('profilIcon');
			BattleIcon.innerHTML = 'swords';

			const BattleText = document.createElement('div');
			BattleText.classList.add('profilText');
			BattleText.innerText = 'Battle';

			BattleButton.appendChild(BattleIcon);
			BattleButton.appendChild(BattleText);
			profilInteraction.appendChild(BattleButton);

			const BattleContainer = document.createElement('div');
			BattleContainer.id = 'BattleContainer' + pseudo;
			BattleContainer.classList.add('battleContainer');
			BattleContainer.classList.add('hidden');

			const MiniBattleButton1 = document.createElement('div');
			MiniBattleButton1.id = 'MiniBattleButton1' + pseudo;
			MiniBattleButton1.classList.add('miniProfilButton');
		
			const MiniBattleText1 = document.createElement('div');
			MiniBattleText1.classList.add('miniProfilText');
			MiniBattleText1.innerText = 'PowerUps';

			MiniBattleButton1.appendChild(MiniBattleText1)

			const MiniBattleButton2 = document.createElement('div');
			MiniBattleButton2.id = 'MiniBattleButton2' + pseudo;
			MiniBattleButton2.classList.add('miniProfilButton');
		
			const MiniBattleText2 = document.createElement('div');
			MiniBattleText2.classList.add('miniProfilText');
			MiniBattleText2.innerText = 'Classic';

			MiniBattleButton2.appendChild(MiniBattleText2)

			BattleContainer.appendChild(MiniBattleButton2);
			BattleContainer.appendChild(MiniBattleButton1);

			MiniBattleButton1.onclick = () => {
				sendCreateTable(pseudo, Modes[2])
				BattleContainer.classList.add("hidden");
				BattleButton.classList.remove("hidden");
			};

			MiniBattleButton2.onclick = () => {
				sendCreateTable(pseudo, Modes[1])
				BattleContainer.classList.add("hidden");
				BattleButton.classList.remove("hidden");
			};

			profilInteraction.appendChild(BattleContainer);

			BattleButton.onclick = () => {
				BattleButton.classList.add("hidden");
				BattleContainer.classList.remove("hidden");
			};

			const BlockButton = document.createElement('div');
			BlockButton.id = 'BlockButton' + pseudo;
			BlockButton.classList.add('ProfilButton');
			BlockButton.classList.add('blockButton');

			const BlockIcon = document.createElement('span');
			BlockIcon.classList.add('material-symbols-outlined');
			BlockIcon.classList.add('profilIcon');
			BlockIcon.innerHTML = 'block';

			const BlockText = document.createElement('div');
			BlockText.classList.add('profilText');
			BlockText.innerText = 'Block';

			BlockButton.appendChild(BlockIcon);
			BlockButton.appendChild(BlockText);

			BlockButton.onclick = () => {
				sendBlockContact(pseudo);
			}

			profilInteraction.appendChild(BlockButton);

			profil.appendChild(profilInfos);
			profil.appendChild(profilInteraction);

			panel.appendChild(profil);
		} catch (e) {
		}
	}
}

async function create_profil_blocked(pseudo, status, img_src, checkProfil) {
	const panel = document.getElementById('resultOut');
	if (panel) {
		try {
			const profil = document.createElement('div');
			profil.id = 'profil' + pseudo;
			profil.classList.add('profil');

			const profilInfos = document.createElement('div');
			profilInfos.id = 'profilInfos' + pseudo;
			profilInfos.classList.add('profilInfos');

			const profilImg = document.createElement('img');
			profilImg.src = img_src;
			profilImg.id = 'profilImg' + pseudo;
			profilImg.classList.add('profilImg');

			const profilInfosText = document.createElement('div');
			profilInfosText.id = 'profilInfosText' + pseudo;
			profilInfosText.classList.add('profilInfosText');

			const profilInfosPseudo = document.createElement('profilInfosPseudo');
			profilInfosPseudo.id = 'profilInfosPseudo' + pseudo;
			profilInfosPseudo.classList.add('profilInfosPseudo');
			profilInfosPseudo.innerText = pseudo;

			const profilInfosStatus = document.createElement('div');
			profilInfosStatus.id = 'profilInfosStatus' + pseudo;
			profilInfosStatus.classList.add('profilInfosStatus');
			profilInfosStatus.innerText = status;

			profilInfosText.appendChild(profilInfosPseudo);
			profilInfosText.appendChild(profilInfosStatus);

			profilInfos.appendChild(profilImg);
			profilInfos.appendChild(profilInfosText);

			const profilInteraction = document.createElement('div');
			profilInteraction.id = 'profilInteraction' + pseudo;
			profilInteraction.classList.add('profilInteraction');

			const BlockButton = document.createElement('div');
			BlockButton.id = 'BlockButton' + pseudo;
			BlockButton.classList.add('UnblockButton');

			const BlockIcon = document.createElement('span');
			BlockIcon.classList.add('material-symbols-outlined');
			BlockIcon.classList.add('unblockIcon');
			BlockIcon.innerHTML = 'block';

			const BlockText = document.createElement('div');
			BlockText.classList.add('unblockText');
			BlockText.innerText = 'Unblock';

			BlockButton.appendChild(BlockIcon);
			BlockButton.appendChild(BlockText);

			BlockButton.onclick = () => {
				sendUnBlockContact(pseudo);
			}

			profilInteraction.appendChild(BlockButton);

			profil.appendChild(profilInfos);
			profil.appendChild(profilInteraction);

			panel.appendChild(profil);
		} catch (e) {
		}
	}
}

async function create_profil_request(pseudo, status, img_src, checkProfil) {
	const panel = document.getElementById('resultOut');
	if (panel) {
		try {
			const profil = document.createElement('div');
			profil.id = 'profil' + pseudo;
			profil.classList.add('profil');

			const profilInfos = document.createElement('div');
			profilInfos.id = 'profilInfos' + pseudo;
			profilInfos.classList.add('profilInfos');

			const profilImg = document.createElement('img');
			profilImg.src = img_src;
			profilImg.id = 'profilImg' + pseudo;
			profilImg.classList.add('profilImg');

			const profilInfosText = document.createElement('div');
			profilInfosText.id = 'profilInfosText' + pseudo;
			profilInfosText.classList.add('profilInfosText');

			const profilInfosPseudo = document.createElement('profilInfosPseudo');
			profilInfosPseudo.id = 'profilInfosPseudo' + pseudo;
			profilInfosPseudo.classList.add('profilInfosPseudo');
			profilInfosPseudo.innerText = pseudo;

			const profilInfosStatus = document.createElement('div');
			profilInfosStatus.id = 'profilInfosStatus' + pseudo;
			profilInfosStatus.classList.add('profilInfosStatus');
			profilInfosStatus.innerText = status;

			profilInfosText.appendChild(profilInfosPseudo);
			profilInfosText.appendChild(profilInfosStatus);

			profilInfos.appendChild(profilImg);
			profilInfos.appendChild(profilInfosText);

			const profilInteraction = document.createElement('div');
			profilInteraction.id = 'profilInteraction' + pseudo;
			profilInteraction.classList.add('profilInteraction');

			const acceptButton = document.createElement('div');
			acceptButton.id = 'acceptButton' + pseudo;
			acceptButton.classList.add('acceptButton');

			const acceptIcon = document.createElement('span');
			acceptIcon.classList.add('material-symbols-outlined');
			acceptIcon.classList.add('acceptIcon');
			acceptIcon.innerHTML = 'Check';

			const acceptText = document.createElement('div');
			acceptText.classList.add('acceptText');
			acceptText.innerText = "Accept friend's request";

			acceptButton.appendChild(acceptIcon);
			acceptButton.appendChild(acceptText);

			acceptButton.onclick = () => {
				sendAddFriend(pseudo);
			}

			profilInteraction.appendChild(acceptButton);

			profil.appendChild(profilInfos);
			profil.appendChild(profilInteraction);

			panel.appendChild(profil);
		} catch (e) {
		}
	}
}

async function handleFilter(filter) {
	const allFilter = document.getElementById('AllFilter');
	const friendFilter = document.getElementById('FriendFilter');
	const onlineFilter = document.getElementById('OnlineFilter');
	const requestFilter = document.getElementById('RequestFilter');
	const blockedFilter = document.getElementById('BlockedFilter');

	if (allFilter && friendFilter && onlineFilter && requestFilter && blockedFilter) {
		allFilter.classList.remove('filterSelected');
		friendFilter.classList.remove('filterSelected');
		onlineFilter.classList.remove('filterSelected');
		requestFilter.classList.remove('filterSelected');
		blockedFilter.classList.remove('filterSelected');

		switch(filter) {
			case 'all':
				allFilter.classList.add('filterSelected');
				social_filter_status = 'all';
				break;
			case 'friend':
				friendFilter.classList.add('filterSelected');
				social_filter_status = 'friend';
				break;
			case 'online':
				onlineFilter.classList.add('filterSelected');
				social_filter_status = 'online';
				break;
			case 'request':
				requestFilter.classList.add('filterSelected');
				social_filter_status = 'request';
				break;
			case 'blocked':
				blockedFilter.classList.add('filterSelected');
				social_filter_status = 'blocked';
				break;
		}
	}

	let searchBar = document.getElementById('searchBar');
	if (searchBar) {searchBar.value = '';};
	GetUserList('');
}