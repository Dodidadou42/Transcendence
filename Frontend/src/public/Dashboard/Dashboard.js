// **********************************************************************
// 				VAR
// **********************************************************************

const BurgerState = {
	'Open' : 'open_',
	'Close' : 'close_',
};

let Bstate = BurgerState.Close;

const PanelOptionsState = {
	0 : 'close_',
	1 : 'casePanel1_dashboard',
	2 : 'casePanel2_dashboard',
	3 : 'casePanel3_dashboard',
	4 : 'casePanel4_dashboard',
	5 : 'casePanel5_dashboard',
	6 : 'casePanel6_dashboard',
};

let navState = PanelOptionsState[0];

class ErrorCode extends Error {
	constructor(code, message) {
	    super(message);
	    this.name = 'CustomError';
	    this.code = code;
	}
  }

export default ErrorCode;

// **********************************************************************
// 				MODES
// **********************************************************************

export const Modes = {
	0 : 'none',
	1 : '1v1',
	2 : '1v1P',
	3 : '2v2',
	4 : '2v2P',
	6 : 'join',
};

let selected_mode = Modes[0];
let custom = false;

let custom_selected_mode = Modes[0];
let custom_power_active = false;
let inviteForGroupPos = 0;

let J1 = 'none';
let J2 = 'none';
let J3 = 'none';
let J4 = 'none';

export function set_selected_mode(mode) { selected_mode = mode; };
export function get_selected_mode() { return selected_mode; };

export function set_custom(is_custom) { custom = is_custom; };
export function get_custom() { return custom; };

export function set_custom_selected_mode(mode) { custom_selected_mode = mode; };
export function get_custom_selected_mode() { return custom_selected_mode; };

export function set_custom_power_active(is_custom_power_activee) { custom_power_active = is_custom_power_activee; };
export function get_custom_power_active() { return custom_power_active; };

export function set_inviteForGroupPos(pos) { inviteForGroupPos = pos; };
export function get_inviteForGroupPos() { return inviteForGroupPos; };

export function set_J1(name) { J1 = name; };
export function get_J1() { return(J1); };

export function set_J2(name) { J2 = name; };
export function get_J2() { return(J2); };

export function set_J3(name) { J3 = name; };
export function get_J3() { return(J3); };

export function set_J4(name) { J4 = name; };
export function get_J4() { return(J4); };

// **********************************************************************

import {pageStatus} from './Website.js';
import {GetStatus, UpdateStatus} from './Website.js';
import {getCSRFToken, showNotificationError} from './Website.js';
import {me_user_id, socket} from "./Website.js"

let module_home = null;
let module_lobby = null;
let module_matchmaking = null;
let module_profil = null;
let module_social = null;
let module_tournament = null;

export function get_module_home() { return module_home; };
export function get_module_lobby() { return module_lobby; };
export function get_module_matchmaking() { return module_matchmaking; };
export function get_module_profil() { return module_profil; };
export function get_module_social() { return module_social; };
export function get_module_tournament() { return module_tournament; };

export function set_module_home(module) { module_home = module; };
export function set_module_lobby(module) { module_lobby = module; };
export function set_module_matchmaking(module) { module_matchmaking = module; };
export function set_module_profil(module) { module_profil = module; };
export function set_module_social(module) { module_social = module; };
export function set_module_tournament(module) { module_tournament = module; };

var page = "";

let skip_load = false;

export function LoadPage() {
	if (skip_load == false) {
		const child = document.getElementById('website');
		if (!child) {return ;}
		if (page != "") {
			let body = document.body;
			if (body) {body.classList.add("body_add_by_dashboard");}

			child.innerHTML = page;
			Page(window.location.hash);
		} else {
			var cssLink = document.createElement('link');
			cssLink.rel = 'stylesheet';
			cssLink.href = './Dashboard.css';
			document.head.appendChild(cssLink);

			let body = document.body;
			if (body) {body.classList.add("body_add_by_dashboard");};
			
			cssLink.onload = function() {
				fetch('Dashboard.html')
				.then(response => response.text())
				.then(html => {
					page = html;
					child.innerHTML = page;
					child.classList.remove("hidden")
					Page(window.location.hash)
				});
			}
		}
	} else {
		Page(window.location.hash);
	};
}

function Page(page) {
	let page_split = page.split("_");
	let page_root = "";

	if (page_split.length > 1)
		page_root = page_split[0] + "_" + page_split[1];

	if (page == pageStatus.Dashboard || page == pageStatus.DashboardHome) {
		if (!module_home) {
			import('./DHome.js').then((module) => {
				module_home = module;
				module_home.LoadPage();
			});
		} else {
			module_home.LoadPage();
		}
	}
	else if (page == pageStatus.DashboardLobby) {
		if (!module_lobby) {
			import('./DLobby.js').then((module) => {
				module_lobby = module;
				module_lobby.LoadPage();
			});
		} else {
			module_lobby.LoadPage();
		}
	}
	else if (page == pageStatus.DashboardMatchmaking) {
		if (!module_matchmaking) {
			import('./DMatchmaking.js').then((module) => {
				module_matchmaking = module;
				module_matchmaking.LoadPage();
			});
		} else {
			module_matchmaking.LoadPage();
		}
	}
	else if (page == pageStatus.DashboardProfil) {
		if (!module_profil) {
			import('./DProfil.js').then((module) => {
				module_profil = module;
				module_profil.LoadPage();
			});
		} else {
			module_profil.LoadPage();
		}
	}
	else if (page == pageStatus.DashboardTournament) {
		if (!module_tournament) {
			import('./DTournament.js').then((module) => {
				module_tournament = module;
				module_tournament.LoadPage();
			});
		} else {
			module_tournament.LoadPage();
		}
	}
	else if (page_root == pageStatus.DashboardSocial) {
		if (!module_social) {
			import('./DSocial.js').then((module) => {
				module_social = module;
				module_social.LoadPage();
			});
		} else {
			module_social.LoadPage();
		}
	}
	else {
		window.location.hash = pageStatus.DashboardHome;
	}

	if (skip_load == false) {
		toggleBurger(Bstate);
		togglePanelOption(navState);

		let PlayButtonIntoLobby = document.getElementById('PlayButtonIntoLobby_dashboard');
		if (PlayButtonIntoLobby) {
			PlayButtonIntoLobby.onclick = () => {
				if (window.location.hash != pageStatus.DashboardMatchmaking && window.location.hash != pageStatus.DashboardTournament)
					window.location.hash = pageStatus.DashboardLobby;
			};
		}

		let MainPlayButtonIntoLobby = document.getElementById('MainPlayButtonIntoLobby_dashboard');
		if (MainPlayButtonIntoLobby) {
			MainPlayButtonIntoLobby.onclick = () => {
				if (window.location.hash != pageStatus.DashboardMatchmaking && window.location.hash != pageStatus.DashboardTournament)
					window.location.hash = pageStatus.DashboardLobby;
			};
		}

		let out_dashboard = document.getElementById('out_dashboard');
		if (out_dashboard) {
			out_dashboard.onclick = async () => {
				Disconect();
			}
		}
		
		let out2_dashboard = document.getElementById('out2_dashboard');
		if (out2_dashboard) {
			out2_dashboard.onclick = async () => {
				Disconect();
			}
		}
		
		let burgerMenu = document.getElementById('burgerMenu_dashboard');
		if (burgerMenu) {
			burgerMenu.onclick = async () => {
				toggleBurger();
			}
		}

		let crossbP = document.getElementById('crossbP_dashboard');
		if (crossbP) {
			crossbP.onclick = async () => {
				toggleBurger();
			}
		}

		let tbHome = document.getElementById('tbHome_dashboard');
		if (tbHome) {
			tbHome.addEventListener('mouseenter', (event) => {
				togglePanelOption(1);
			});
			tbHome.addEventListener('click', (event) => {
				window.location.hash = pageStatus.DashboardHome;
			});
		}
		
		let tbplay = document.getElementById('tbplay_dashboard');
		if (tbplay) {
			tbplay.addEventListener('mouseenter', (event) => {
				togglePanelOption(2);
			});
			tbplay.addEventListener('click', (event) => {
				if (window.location.hash != pageStatus.DashboardMatchmaking && window.location.hash != pageStatus.DashboardTournament)
					window.location.hash = pageStatus.DashboardLobby;
			});
		}
		
		let tbContact = document.getElementById('tbContact_dashboard');
		if (tbContact) {
			tbContact.addEventListener('mouseenter', (event) => {
				togglePanelOption(3);
			});
			tbContact.addEventListener('click', (event) => {
				window.location.hash = pageStatus.DashboardSocial;
			});
		}
		
		let tbParameter = document.getElementById('tbParameter_dashboard');
		if (tbParameter) {
			tbParameter.addEventListener('mouseenter', (event) => {
				togglePanelOption(4);
			});
		}

		let tbProfil = document.getElementById('tbProfil_dashboard');
		if (tbProfil) {
			tbProfil.addEventListener('click', (event) => {
				window.location.hash = pageStatus.DashboardProfil;
			});
		}
		
		let TopBar = document.getElementById('TopBar_dashboard');
		if (TopBar) {
			TopBar.addEventListener('mouseleave', (event) => {
				togglePanelOption(0);
			});
		}
	};
}

export function UnloadPage() {
	switch(GetStatus()) {
		case pageStatus.DashboardHome:
			if (module_home) {module_home.UnloadPage();}
			break;
		case pageStatus.DashboardLobby:
			if (module_lobby) {module_lobby.UnloadPage();};
			break;
		case pageStatus.DashboardMatchmaking:
			if (module_matchmaking) {module_matchmaking.UnloadPage();}
			break;
		case pageStatus.DashboardProfil:
			if (module_profil) {module_profil.UnloadPage();}
			break;
		case pageStatus.DashboardSocial:
			if (module_social) {module_social.UnloadPage();};
			break;
		case pageStatus.DashboardSocialProfil:
			if (module_social) {module_social.UnloadPage();};
			break;
		case pageStatus.DashboardSocialGameDetails:
			if (module_social) {module_social.UnloadPage();};
			break;
		case pageStatus.DashboardSocialMessages:
			if (module_social) {module_social.UnloadPage();};
			break;
		case pageStatus.DashboardSocialContacts:
			if (module_social) {module_social.UnloadPage();};
			break;
		case pageStatus.DashboardTournament:
			if (module_tournament) {module_tournament.UnloadPage();};
			break;
	};

	const hashParts = window.location.hash.split('&');

	let page_split = window.location.hash.split("_");
	let page_root = "";
	let page_root_game_details = ""

	let hash_split = hashParts[0].split("_")
	if (page_split.length > 2)
		page_root = hash_split[0] + "_" + hash_split[1] + "_" + hash_split[2];
	if (page_split.length > 3)
		page_root_game_details = hash_split[0] + "_" + hash_split[1] + "_" + hash_split[2] + "_" + hash_split[3];

	if (window.location.hash == pageStatus.Dashboard
		|| window.location.hash == pageStatus.DashboardHome
		|| window.location.hash == pageStatus.DashboardProfil
		|| window.location.hash == pageStatus.DashboardMatchmaking
		|| window.location.hash == pageStatus.DashboardLobby
		|| window.location.hash == pageStatus.DashboardTournament
		|| window.location.hash == pageStatus.DashboardSocial
		|| page_root == pageStatus.DashboardSocialProfil
		|| page_root_game_details == pageStatus.DashboardSocialGameDetails
		|| window.location.hash == pageStatus.DashboardSocialMessages
		|| window.location.hash == pageStatus.DashboardSocialContacts) {
		skip_load = true;
	} else {
		skip_load = false;
		let PlayButtonIntoLobby = document.getElementById('PlayButtonIntoLobby_dashboard');
		if (PlayButtonIntoLobby) {PlayButtonIntoLobby.removeEventListener('click', function(event) {});};

		let MainPlayButtonIntoLobby = document.getElementById('MainPlayButtonIntoLobby_dashboard');
		if (MainPlayButtonIntoLobby) {MainPlayButtonIntoLobby.removeEventListener('click', function(event) {});};

		let out_dashboard = document.getElementById('out_dashboard');
		if (out_dashboard) {out_dashboard.removeEventListener('click', function(event) {});};

		let out2_dashboard = document.getElementById('out2_dashboard');
		if (out2_dashboard) {out2_dashboard.removeEventListener('click', function(event) {});};
		
		let burgerMenu = document.getElementById('burgerMenu_dashboard');
		if (burgerMenu) {burgerMenu.removeEventListener('click', function(event) {});};

		let crossbP = document.getElementById('crossbP_dashboard');
		if (crossbP) {crossbP.removeEventListener('click', function(event) {});};
		
		let tbHome = document.getElementById('tbHome_dashboard');
		if (tbHome) {
			tbHome.removeEventListener('mouseenter', function(event) {});
			tbHome.removeEventListener('click', function(event) {});
		};

		let tbplay = document.getElementById('tbplay_dashboard');
		if (tbplay) {
			tbplay.removeEventListener('mouseenter', function(event) {});
			tbplay.removeEventListener('click', function(event) {});
		};

		let tbContact = document.getElementById('tbContact_dashboard');
		if (tbContact) {
			tbContact.removeEventListener('mouseenter', function(event) {});
			tbContact.removeEventListener('click', function(event) {});
		};

		let tbParameter = document.getElementById('tbParameter_dashboard');
		if (tbParameter) {tbParameter.removeEventListener('mouseenter', function(event) {});};

		let tbProfil = document.getElementById('tbProfil_dashboard');
		if (tbProfil) {tbProfil.removeEventListener('click', function(event) {});};

		let TopBar = document.getElementById('TopBar_dashboard');
		if (TopBar) {TopBar.removeEventListener('mouseleave', function(event) {});};

		let body = document.body;
		if (body) {body.classList.remove("body_add_by_dashboard");};
	};
}

function toggleBurger(state) {
	const button = document.getElementById('burgerPanelOut_dashboard');
	if (button) {
		if (state != undefined) {
			if (state === BurgerState.Open) {
				Bstate = BurgerState.Open;
				button.classList.remove('burgerClosed_dashboard');
			} else if (state === BurgerState.Close) {
				button.classList.add('burgerClosed_dashboard');
				Bstate = BurgerState.Close;
			}
			return ;
		}
		if (Bstate === BurgerState.Open) {
			button.classList.add('burgerClosed_dashboard');
			Bstate = BurgerState.Close;
		} else {
			Bstate = BurgerState.Open;
			button.classList.remove('burgerClosed_dashboard');
		}
	}
}

function togglePanelOption(choice) {

	if (navState != PanelOptionsState[0]) {
		let elem_navState = document.getElementById(navState);
		if (elem_navState) {
			elem_navState.classList.add('hidden');
			elem_navState.classList.remove('panelOpenAnimation_dashboard');
		}
	}

	switch(choice) {
		case 1:
			navState = PanelOptionsState[1];
			break;
		case 2:
			navState = PanelOptionsState[2];
			break;
		case 3:
			navState = PanelOptionsState[3];
			break;
		case 4:
			navState = PanelOptionsState[4];
			break;
		case 5:
			navState = PanelOptionsState[5];
			break;
		case 6:
			navState = PanelOptionsState[6];
			break;
		default:
			navState = PanelOptionsState[0];
			break;
	}

	if (navState != PanelOptionsState[0]) {
		let elem_navState = document.getElementById(navState);
		if (elem_navState) {
			elem_navState.classList.remove('hidden');
			elem_navState.classList.add('panelOpenAnimation_dashboard');
		}
	}
}

export async function Disconect () {
	try {
		const {data} = await axios.get('https://' + window.location.hostname + ':' + window.location.port + '/api/sign/out/', {
			headers: {
				'Content-Type': 'application/json',
			},
			withCredentials: true,
		});
		if (data && data.success) {
			socket.close();
			window.location.href = pageStatus.Home;
		} else {
			if (data && data.message) {showNotificationError(data.message);};
		};
	} catch (error) {
		showNotificationError("Error while disconnecting");
	}
}

export async function add_history_to_profil(profil, nb_history_request, i_begin_history) {
	try {
		const csrfToken = await getCSRFToken();

		if (csrfToken) {
			const {data} = await axios.post('https://' + window.location.hostname + ':' + window.location.port + '/api/social/send_user_history_list', {
				user_id_to_check: profil,
				nb_history_request: nb_history_request,
				i_begin_history: i_begin_history
			}, {
				headers: {
					'Content-Type': 'application/json',
					'X-CSRFToken': csrfToken,
				},
				withCredentials: true,
			});

			if (data && data.success) {
				for (var i = 0; i < data.table_tab.length; i++) {
					generatePongGameHistory(data.table_tab[i]["is_win"], data.table_tab[i]["game_mode"],data.table_tab[i]["date"], 
					data.table_tab[i]["j1"], data.table_tab[i]["j2"], data.table_tab[i]["j3"], data.table_tab[i]["j4"],
					data.table_tab[i]["winner_score"], data.table_tab[i]["loser_score"], profil, data.table_tab[i]["game_id"]);
				}
				if (data.is_history_list_finished == true) {
					let historyLoadMore = document.getElementById("historyLoadMore");
					if (historyLoadMore) {historyLoadMore.classList.add("hidden");};
				}
			} else {
				if (data && data.message) {showNotificationError(data.message);};
			};
		};

	} catch (error) {
		showNotificationError("Error while recovering history");
	}
}

function generateTimeAgo(date) {
	const older_date = new Date(date);
	const current_date = new Date();

	var older_seconds = Math.floor(older_date.getTime() / 1000);
	var current_seconds = Math.floor(current_date.getTime() / 1000);

	var seconds = current_seconds - older_seconds;

	var minutes = Math.floor(seconds / 60);
	if (minutes < 1) {
		return seconds + "s ago";
	}
	
	var hours = Math.floor(minutes / 60);
	if (hours < 1) {
		return minutes + "m ago";
	}

	var days = Math.floor(hours / 24);
	if (days < 1) {
		return hours + "h ago";
	}

	return days + "d ago";
}

function generatePongGameHistory(is_win, game_mode, date, j1, j2, j3, j4, winner_score, loser_score, profil, game_id) {
	let div1 = document.createElement('div');
	div1.classList.add("gameH");
	if (is_win) {
		div1.classList.add("gameW");
	} else {
		div1.classList.add("gameL");
	}

	let div2 = document.createElement('div');
	div2.classList.add("ghHeader");

	let div3 = document.createElement('div');

	let div4 = document.createElement('div');
	div4.classList.add("ghMode");
	div4.innerText = game_mode;
	
	let div5 = document.createElement('div');
	div5.classList = "ghtime";
	div5.innerText = generateTimeAgo(date)

	div3.appendChild(div4);
	div3.appendChild(div5);

	let div6 = document.createElement('div');
	div6.classList = "ghHo";
	div6.innerText = "Match Details";
	div6.onclick = () => {
		window.location.hash = pageStatus.DashboardSocialGameDetails + '&game=' + game_id;
	};

	div2.appendChild(div3);
	div2.appendChild(div6);

	let div7 = document.createElement('div');
	div7.classList = "ghBody";

	let div8 = document.createElement('div');
	div8.classList = "ghIcon";

	let span = document.createElement('span');
	span.classList = "material-symbols-outlined";
	if (is_win) {
		span.innerText = "emoji_events";
	} else {
		span.innerText = "egg_alt";
	}

	div8.appendChild(span);

	let div9 = document.createElement('div');
	div9.classList = "ghOponent";
	if (j1 == profil) {
		if (j3 != 'none') {
			div9.innerText = j1 + ", " + j2;
		} else {
			div9.innerText = j1;
		}
	} else if (j2 == profil) {
		if (j3 != 'none') {
			div9.innerText = j2 + ", " + j1;
		} else {
			div9.innerText = j2;
		}
	} else if (j3 == profil) {
		div9.innerText = j3 + ", " + j4;
	} else {
		div9.innerText = j4 + ", " + j3;
	}

	let div10 = document.createElement('div');
	div10.classList = "ghScore";
	if (is_win) {
		div10.innerText = winner_score + " : " + loser_score;
	} else {
		div10.innerText = loser_score + " : " + winner_score;
	}

	let div11 = document.createElement('div');
	div11.classList = "ghOponent";
	if (j1 == profil) {
		if (j3 != 'none') {
			div11.innerText = j3 + ", " + j4;
		} else {
			div11.innerText = j2;
		}
	} else if (j2 == profil) {
		if (j3 != 'none') {
			div11.innerText = j3 + ", " + j4;
		} else {
			div11.innerText = j1;
		}
	} else if (j3 == profil) {
		div11.innerText = j1 + ", " + j2;
	} else {
		div11.innerText = j1 + ", " + j2;
	}

	div7.appendChild(div8);
	div7.appendChild(div9);
	div7.appendChild(div10);
	div7.appendChild(div11);
	div1.appendChild(div2);
	div1.appendChild(div7);

	let history = document.getElementById("historyHeader");
	if (history) {history.appendChild(div1);};
}

export function sleep(ms) {
	return new Promise(resolve => setTimeout(resolve, ms));
}

export function handleTitle(name) {
	const title = document.getElementById('PageTitle_dashboard');
	if (title) {title.innerText = name;};
}

export async function sendAddFriend(friend_user) {
	if (socket && socket.readyState === WebSocket.OPEN) {
		socket.send(JSON.stringify({'recipient': friend_user, 'event_type': "contact_friend"}));
	} else {
		showNotificationError("Error with Websocket");
	}
}

export async function searchUserInfos(userId) {
	try {
		const csrfToken = await getCSRFToken();

		if (csrfToken) {
			const {data} = await axios.post('https://' + window.location.hostname + ':' + window.location.port + '/api/social/user_info_profil', {
				'user': userId,
			}, {
				headers: {
					'Content-Type': 'application/json',
					'X-CSRFToken': csrfToken,
				},
				withCredentials: true,
			});

			if (data && data.success) {
				return data.profil;
			} else {
				if (data && data.message) {showNotificationError(data.message);};
				return null;
			}
		} else {
			return null;
		}

	} catch (error) {
		showNotificationError("Error while searching user infos");
		return null;
	}
}

export function toggleCount(value) {
	let count = document.getElementById('count');
	if (count) {
		if (value) {
			count.classList.remove('hidden');
		} else {
			count.classList.add('hidden');
		}
	}
}

export async function searchActualtournament() {
	
	try {
		const csrfToken = await getCSRFToken();

		if (csrfToken) {
			const {data} = await axios.post('https://' + window.location.hostname + ':' + window.location.port + '/api/features/isTournament', {
			}, {
				headers: {
					'Content-Type': 'application/json',
					'X-CSRFToken': csrfToken,
				},
				withCredentials: true,
			});

			if (data && data.success) {
				return data.data;
			} else {
				if (data && data.message) {showNotificationError(data.message);};
				return false;
			}
		} else {
			return false;
		}
	} catch (error) {
		showNotificationError("Error while searching current tournament");
		return false;
	}
}