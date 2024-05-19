// **********************************************************************
// 				Lobby Page
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

import {searchActualtournament} from './Dashboard.js';

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
		cssLink.href = './DLobby.css';
		document.head.appendChild(cssLink);
        cssLink.onload = function() {
            fetch('DLobby.html')
            .then(response => response.text())
            .then(html => {
                page = html;
                child.innerHTML = page;
				child.classList.remove("hidden")
				Page()
            });
        }
	}
	UpdateStatus(pageStatus.DashboardLobby);
	handleTitle('Lobby');
	document.title = 'Dashboard Lobby';
}

export function UnloadPage() {
	UpdateStatus("");

	let _1v1Button = document.getElementById('1v1Button_dlobby');
	if (_1v1Button) {_1v1Button.removeEventListener('click', function(event) {});};

	let _2v2Button = document.getElementById('2v2Button_dlobby');
	if (_2v2Button) {_2v2Button.removeEventListener('click', function(event) {});};

	let _1v1PButton = document.getElementById('1v1PButton_dlobby');
	if (_1v1PButton) {_1v1PButton.removeEventListener('click', function(event) {});};

	let _2v2PButton = document.getElementById('2v2PButton_dlobby');
	if (_2v2PButton) {_2v2PButton.removeEventListener('click', function(event) {});};

	let T1v1Button = document.getElementById('T1v1Button_dlobby');
	if (T1v1Button) {T1v1Button.removeEventListener('click', function(event) {});};

	let T1v1PButton = document.getElementById('T1v1PButton_dlobby');
	if (T1v1PButton) {T1v1PButton.removeEventListener('click', function(event) {});};

	let customButton = document.getElementById('customButton_dlobby');
	if (customButton) {customButton.removeEventListener('click', function(event) {});};
}

async function Page() {
	let _1v1Button = document.getElementById('1v1Button_dlobby');
	if (_1v1Button) {
		_1v1Button.onclick = (event) => { 
			set_selected_mode(Modes[1]);
			set_custom(false);
			window.location.hash = pageStatus.DashboardMatchmaking;
		};
	}

	let _2v2Button = document.getElementById('2v2Button_dlobby');
	if (_2v2Button) {	
		_2v2Button.onclick = () => { 
		set_selected_mode(Modes[3]);
		set_custom(false);
		window.location.hash = pageStatus.DashboardMatchmaking;
	};}


	let _1v1PButton = document.getElementById('1v1PButton_dlobby');
	if (_1v1PButton) {
		_1v1PButton.onclick = () => { 
			set_selected_mode(Modes[2]);
			set_custom(false);
			window.location.hash = pageStatus.DashboardMatchmaking;
		};
	}

	let _2v2PButton = document.getElementById('2v2PButton_dlobby');
	if (_2v2PButton) {
		_2v2PButton.onclick = () => { 
			set_selected_mode(Modes[4]);
			set_custom(false);
			window.location.hash = pageStatus.DashboardMatchmaking;
		};
	}

	let T1v1Button = document.getElementById('T1v1Button_dlobby');
	if (T1v1Button) {
		T1v1Button.onclick = () => { 
			set_selected_mode(Modes[1]);
			set_custom(false);
			window.location.hash = pageStatus.DashboardTournament;
		};
	}

	let T1v1PButton = document.getElementById('T1v1PButton_dlobby');
	if (T1v1PButton) {
		T1v1PButton.onclick = () => { 
			set_selected_mode(Modes[2]);
			set_custom(false);
			window.location.hash = pageStatus.DashboardTournament;
		};
	}

	let customButton = document.getElementById('customButton_dlobby');
	if (customButton) {
		customButton.onclick = async () => { 
			set_selected_mode(Modes[2]);
			set_custom(true);
			try {
				const csrfToken = await getCSRFToken();

				if (csrfToken) {
					const {data} = await axios.post('https://' + window.location.hostname + ':' + window.location.port + '/api/features/matchmaking/customGame', {
						'mode': get_custom_selected_mode(),
					}, {
						headers: {
							'Content-Type': 'application/json',
							'X-CSRFToken': csrfToken,
						},
						withCredentials: true,
					});
			
					if (data && data.success) {
						window.location.hash = pageStatus.DashboardMatchmaking;
					} else {
						if (data && data.message) {showNotificationError(data.message);};
					}
				};

			} catch (error) {
				showNotificationError("Error while creating custom game");
			}
		};
	}

	let loadingPageSearchGame = document.getElementById('loadingPageSearchGame_dlobby');
	if (loadingPageSearchGame) {
		try {
			const csrfToken = await getCSRFToken();

			if (csrfToken) {
				if (await searchActualtournament() == true) {
					window.location.hash = pageStatus.DashboardTournament;
					return ;
				}

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
					if (data.data.isCustom) {
						set_custom_selected_mode(data.data.mode);
						if (data.data.mode === Modes[2] || data.data.mode=== Modes[4]) {set_custom_power_active(true);} 
						else {set_custom_power_active(false);}
						set_J1(data.data.j1);
						set_J2(data.data.j2)
						set_J3(data.data.j3)
						set_J4(data.data.j4)
						if (me_user_id == data.data.j1) { set_custom(true); }
					} else {
						set_selected_mode(data.data.mode);
						set_custom_selected_mode(Modes[0]);
						set_custom(false);
					}
					
					window.location.hash = pageStatus.DashboardMatchmaking;
				} else {
					loadingPageSearchGame.classList.add('hidden');
				}
			};

		} catch (error) {
			showNotificationError("Error while checking if in queue");
			loadingPageSearchGame.classList.add('hidden');
		}
	}

	if (get_selected_mode() != Modes[0] || get_custom_selected_mode() != Modes[0]) {
		window.location.hash = pageStatus.DashboardMatchmaking;
	}
}