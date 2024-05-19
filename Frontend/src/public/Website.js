/***********************************************************************************/
/*                                     Website                                     */
/***********************************************************************************/

export const pageStatus = {
    Home: "#home",

    Connect: "#connect",
	ConnectLogin: "#connect_login",
	ConnectRegister: "#connect_register",
	ConnectForgotPassword: "#connect_forgot_password",
    
    Contact: "#contact",
    
    Policy: "#policy",
    PolicyHome: "#policy_home",
    PolicyData: "#policy_data",
    PolicyCookies: "#policy_cookies",

    Fourtytwo: "#fourtytwo",
    
    Dashboard: "#dashboard",
    DashboardHome: "#dashboard_home",
    DashboardLobby: "#dashboard_lobby",
    DashboardMatchmaking: "#dashboard_matchmaking",
    DashboardProfil: "#dashboard_profil",
    DashboardTournament: "#dashboard_tournament",

    DashboardSocial: "#dashboard_social",
	DashboardSocialProfil: "#dashboard_social_profil",
	DashboardSocialGameDetails: "#dashboard_social_game_details",
	DashboardSocialMessages: "#dashboard_social_messages",
	DashboardSocialContacts: "#dashboard_social_contacts",

    Game: "#game",

	SessionExpired: "#sessionexpired"
};

export const loadStatus = {
	Loading: "_loading",
	Loaded: "_loaded"
};

export let status = null;

let module_home = null;
let module_connect = null;
let module_contact = null;
let module_policy = null;
let module_dashboard = null;
let module_game = null;
let module_session_expired = null;

let is_connected = false;

export let me_user_id;
export let socket ;

document.addEventListener('DOMContentLoaded', async (event) => {
    var cssLink = document.createElement('link');
    cssLink.rel = 'stylesheet';
    cssLink.href = './Website.css';

    document.head.appendChild(cssLink);

    cssLink.onload = async function() {
		if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
			
		}
		if (window.location.hash != pageStatus.SessionExpired) {
			try {
				const {data} = await axios.get('https://' + window.location.hostname + ':' + window.location.port + '/api/sign/is/', {});
				if (data && data.success) {
					is_connected = true;
					await setupWebSocket();
					me_user_id = await getMeUserId();
					if (!await check_in_game()) { return }
				} else {
					is_connected = false;
				}
			} catch (e) {
				is_connected = false;
			}
		};
        LoadPage(is_connected, window.location.hash)
    }
});

window.onhashchange = async function(){
	if (window.location.hash != pageStatus.SessionExpired) {
		try {
			const {data} = await axios.get('https://' + window.location.hostname + ':' + window.location.port + '/api/sign/is/', {});
			if (data && data.success) {
				if (is_connected == false) {
					is_connected = true;
					await setupWebSocket();
					me_user_id = await getMeUserId();
				}
				if (!socket) {await setupWebSocket();}
				if (!await check_in_game()) { return }
			} else {
				is_connected = false;
			}
		} catch (e) {
			is_connected = false;
		}
	};
	LoadPage(is_connected, window.location.hash);
}

export async function Reconnect() {
	window.location.hash = pageStatus.Home;
}

export async function ForceClose () {
	socket.close();
	window.location.href = pageStatus.SessionExpired;
}

function LoadPage(is_connected, page) {
	if (window.location.pathname != "/") {
		window.location.pathname = "/";
		return;
	}

    if (status != null) {UnloadPage()}
    
    let page_root = page.split("_")[0];
    if (page_root == pageStatus.Contact) {
        if (!module_contact) {
            import('./Contacts.js').then((module) => {
                module_contact = module;
                module_contact.LoadPage();
            });
        } else {
            module_contact.LoadPage();
        }
    } else if (page_root == pageStatus.Policy) {
        if (!module_policy) {
            import('./Policy.js').then((module) => {
                module_policy = module;
                module_policy.LoadPage();
            });
        } else {
            module_policy.LoadPage();
        }
    } else if (page_root == pageStatus.SessionExpired) {
        if (!module_session_expired) {
            import('./SessionExpired.js').then((module) => {
                module_session_expired = module;
                module_session_expired.LoadPage();
            });
        } else {
            module_session_expired.LoadPage();
        }
    } else if (is_connected) { 
		if (page_root == pageStatus.Dashboard) {
            if (!module_dashboard) {
                import('./Dashboard.js').then((module) => {
                    module_dashboard = module;
                    module_dashboard.LoadPage();
                });
            } else {
                module_dashboard.LoadPage();
            }
        } else if (page_root == pageStatus.Game) {
            if (!module_game) {
                import('./PongGame.js').then((module) => {
                    module_game = module;
                    module_game.LoadPage();
                });
            } else {
                module_game.LoadPage();
            }
        } else {
            window.location.hash = pageStatus.DashboardHome
        }
    } else {
        if (page_root == '' || page_root == pageStatus.Home) {
            if (!module_home) {
                import('./Home.js').then((module) => {
                    module_home = module;
                    module_home.LoadPage();
                });
            } else {
                module_home.LoadPage();
            }
        } else if (page_root == pageStatus.Connect) {
            if (!module_connect) {
                import('./Connect.js').then((module) => {
                    module_connect = module;
                    module_connect.LoadPage();
                });
            } else {
                module_connect.LoadPage();
            }
        } else {
            window.location.hash = pageStatus.Home
        }
    }
}

function UnloadPage() {
    if (status == pageStatus.Contact) {
        if (module_contact) {module_contact.UnloadPage();}
	} else if (status == pageStatus.SessionExpired) {
		if (module_session_expired) {module_session_expired.UnloadPage();}
    } else if (status == pageStatus.Policy
        || status == pageStatus.PolicyHome
        || status == pageStatus.PolicyData
        || status == pageStatus.PolicyCookies) {
        if (module_policy) {module_policy.UnloadPage();}
    } else if (status == pageStatus.Dashboard
        || status == pageStatus.DashboardHome
        || status == pageStatus.DashboardLobby
        || status == pageStatus.DashboardMatchmaking
        || status == pageStatus.DashboardProfil
        || status == pageStatus.DashboardSocial
        || status == pageStatus.DashboardSocialProfil
        || status == pageStatus.DashboardSocialGameDetails
        || status == pageStatus.DashboardSocialMessages
        || status == pageStatus.DashboardSocialContacts
        || status == pageStatus.DashboardTournament) {
		if (module_dashboard) {module_dashboard.UnloadPage();}
    } else if (status == pageStatus.Game) {
		if (module_game) {module_game.UnloadPage();}
    } else if (status == pageStatus.Home) {
        if (module_home) {module_home.UnloadPage();}
    } else if (status == pageStatus.Connect
        || status == pageStatus.ConnectLogin
        || status == pageStatus.ConnectRegister
        || status == pageStatus.ConnectForgotPassword) {
        if (module_connect) {module_connect.UnloadPage();}
    }
}

export async function getCSRFToken() {
	try {
		const response = await axios.get('https://' + window.location.hostname + ':' + window.location.port + '/api/sign/tp/', {
			withCredentials: true,
		});
		if (response.data && response.data.success) {
			return response.data.csrf_token;
		} else {
			window.location.hash = pageStatus.Home;
			showNotificationError("Can't get CSRF Token");
			return null;
		};
	} catch (error) {
		showNotificationError("Can't get CSRF Token");
		return null;
	}
}

export function GetStatus() {
	return status;
}

export function UpdateStatus(new_status) {
	status = new_status;
}

/* ################### WEBSOCKET and other ##########################  */

export async function setupWebSocket() {
	return new Promise((resolve, reject) => {
		socket = new WebSocket('wss://' + window.location.host + '/api/websocket/chat/');

		socket.onopen = (event) => {
			resolve();
		};
		
		socket.onmessage = async (event) => {
			const data = JSON.parse(event.data);
			const user_id = me_user_id
			if (data.event_type == "contact_message" || data.event_type == "group_message") {
				if (!module_dashboard) {await import('./Dashboard.js').then((module) => {module_dashboard = module;});};
				if (!module_dashboard.get_module_social()) {await import('./DSocial.js').then(async (module) => {await module_dashboard.set_module_social(module);});};
				if (!module_dashboard.get_module_social().get_module_messages()) {await import('./SMessages.js').then(async (module) => {await module_dashboard.get_module_social().set_module_messages(module);});};
				if (data.event_type == "contact_message") { await module_dashboard.get_module_social().get_module_messages().receiveMessage(data, user_id); }
				else if (data.event_type == "group_message") { await module_dashboard.get_module_social().get_module_messages().receiveNewGroupMess(data, user_id); }
			}

			else if (data.event_type == "force_disconect") { 
				if (!module_dashboard) {await import('./Dashboard.js').then((module) => {module_dashboard = module;});};
				await module_dashboard.Disconect();
			}

			else if (data.event_type == "force_close") {await ForceClose();}

			else if (data.event_type == "contact_friend_sent" || data.event_type == "contact_friend_accepted"
			|| data.event_type == "contact_friend_already_sent" || data.event_type == "contact_friend_blocked"
			|| data.event_type == "contact_unfriend_sent" || data.event_type == "contact_unfriend_cancelled"
			|| data.event_type == "contact_unfriend_impossible" || data.event_type == "contact_blocked_done"
			|| data.event_type == "contact_blocked_already_done" || data.event_type == "contact_unblocked_done"
			|| data.event_type == "contact_fully_unblocked_done" || data.event_type == "contact_unblocked_impossible"
			|| data.event_type == "create_table_success" || data.event_type == "create_table_blocked"
			|| data.event_type == "create_table_expires" || data.event_type == "create_table_already_in_game"
			|| data.event_type == "opponent_already_in_game" || data.event_type == "join_table_success"
			|| data.event_type == "join_table_blocked" || data.event_type == "join_table_not_found"
			|| data.event_type == "join_table_already_in_game" || data.event_type == "join_table_you_already_in_game") {
				if (!module_dashboard) {await import('./Dashboard.js').then((module) => {module_dashboard = module;});};
				if (!module_dashboard.get_module_social()) {await import('./DSocial.js').then(async (module) => {await module_dashboard.set_module_social(module);});};
				if (data.event_type == "contact_friend_sent") { await module_dashboard.get_module_social().receiveFriendSent(data, user_id); }
				else if (data.event_type == "contact_friend_accepted") { await module_dashboard.get_module_social().receiveFriendAccepted(data, user_id); }
				else if (data.event_type == "contact_friend_already_sent") { await module_dashboard.get_module_social().receiveFriendAlreadySent(data, user_id); }
				else if (data.event_type == "contact_friend_blocked") { await module_dashboard.get_module_social().receiveFriendBlocked(data, user_id); }
	
				else if (data.event_type == "contact_unfriend_sent") { await module_dashboard.get_module_social().receiveUnFriendSent(data, user_id); }
				else if (data.event_type == "contact_unfriend_cancelled") { await module_dashboard.get_module_social().receiveUnFriendCancelled(data, user_id); }
				else if (data.event_type == "contact_unfriend_impossible") { await module_dashboard.get_module_social().receiveUnFriendImpossible(data, user_id); }
	
				else if (data.event_type == "contact_blocked_done") { await module_dashboard.get_module_social().receiveBlockedDone(data, user_id); }
				else if (data.event_type == "contact_blocked_already_done") { await module_dashboard.get_module_social().receiveBlockedAlreadyDone(data, user_id); }
	
				else if (data.event_type == "contact_unblocked_done") { await module_dashboard.get_module_social().receiveUnBlockedDone(data, user_id); }
				else if (data.event_type == "contact_fully_unblocked_done") { await module_dashboard.get_module_social().receiveFullyUnBlockedDone(data, user_id); }
				else if (data.event_type == "contact_unblocked_impossible") { await module_dashboard.get_module_social().receiveUnBlockedImpossible(data, user_id); }

				else if (data.event_type == "create_table_success") { await module_dashboard.get_module_social().receiveCreateTableSuccess(data, user_id); }
				else if (data.event_type == "create_table_blocked") { await module_dashboard.get_module_social().receiveCreateTableBlocked(data, user_id); }
				else if (data.event_type == "create_table_expires") { await module_dashboard.get_module_social().receiveCreateTableExpires(data, user_id); }
				else if (data.event_type == "create_table_already_in_game") { await module_dashboard.get_module_social().receiveCreateTableAlreadyInGame(data, user_id); }
				else if (data.event_type == "opponent_already_in_game") { await module_dashboard.get_module_social().receiveOpponentAlreadyInGame(data, user_id); }
	
				else if (data.event_type == "join_table_success") { await module_dashboard.get_module_social().receiveJoinTableSuccess(data, user_id); }
				else if (data.event_type == "join_table_blocked") { await module_dashboard.get_module_social().receiveJoinTableBlocked(data, user_id); }
				else if (data.event_type == "join_table_not_found") { await module_dashboard.get_module_social().receiveJoinTableNotFound(data, user_id); }
				else if (data.event_type == "join_table_already_in_game") { await module_dashboard.get_module_social().receiveJoinTableAlreadyInGame(data, user_id); } 
				else if (data.event_type == "join_table_you_already_in_game") { await module_dashboard.get_module_social().receiveJoinTableYouAlreadyInGame(data, user_id); }
			}

			else if (data.event_type == "CGModeChanged" || data.event_type == "ownerCGLeaveGroup"
			|| data.event_type == "CGLeaveGroup" || data.event_type == "CGgroupModifiedBot"
			|| data.event_type == "CGgroupModified" || data.event_type == "CGgroupModifiedMe"
			|| data.event_type == "CGgroupInvitedPlayer" || data.event_type == "CGgroupModifiedPlayer"
			|| data.event_type == "CGgroupJoined" || data.event_type == "CGgroupLeft"
			|| data.event_type == "CGstarted"
			|| data.event_type == "leave_match" || data.event_type == "joined_match"
			|| data.event_type == "cancel_match" || data.event_type == "starting_match"
			|| data.event_type == "maj_match" || data.event_type == "start_match") {
				if (!module_dashboard) {await import('./Dashboard.js').then((module) => {module_dashboard = module;});};
				if (!module_dashboard.get_module_matchmaking()) {await import('./DMatchmaking.js').then(async (module) => {await module_dashboard.set_module_matchmaking(module);});};
				if (data.event_type == "CGModeChanged") { await module_dashboard.get_module_matchmaking().receiveChangedModeSocket(data, user_id); }
				else if (data.event_type == "ownerCGLeaveGroup") { window.location.hash = pageStatus.DashboardLobby; }
				else if (data.event_type == "CGLeaveGroup") { window.location.hash = pageStatus.DashboardLobby; }
				else if (data.event_type == "CGgroupModifiedBot") { await module_dashboard.get_module_matchmaking().ConfirmBotAddedCGGroup(data, user_id); }
				else if (data.event_type == "CGgroupModified") { await module_dashboard.get_module_matchmaking().ConfirmKickedCGGroup(data, user_id); }
				else if (data.event_type == "CGgroupModifiedMe") { await module_dashboard.get_module_matchmaking().ConfirmKickedCGGroupMe(data, user_id); }
				else if (data.event_type == "CGgroupInvitedPlayer") { await module_dashboard.get_module_matchmaking().ConfirmAddPlayerMatchGroupInvitation(data, user_id); }
				else if (data.event_type == "CGgroupModifiedPlayer") { await module_dashboard.get_module_matchmaking().ConfirmAddPlayerCustomGroup(data, user_id); }
				else if (data.event_type == "CGgroupJoined") { await module_dashboard.get_module_matchmaking().ConfirmSendJoinCustomGameGroup(data, user_id); }
				else if (data.event_type == "CGgroupLeft") { await module_dashboard.get_module_matchmaking().receivedLeaveMatchmakingSocket(data, user_id); }
				else if (data.event_type == "CGstarted") { await module_dashboard.get_module_matchmaking().receiveCGStarted(data, user_id); }

				else if (data.event_type == "leave_match") { await module_dashboard.get_module_matchmaking().receivedLeaveMatchmakingSocket(data, user_id); }
				else if (data.event_type == "joined_match") { await module_dashboard.get_module_matchmaking().receivedMajMatchSocket(data, user_id); }
				else if (data.event_type == "cancel_match") { await module_dashboard.get_module_matchmaking().receivedMajMatchSocket(data, user_id); }
				else if (data.event_type == "starting_match") { await module_dashboard.get_module_matchmaking().receiveStartingMatchSocket(data, user_id); }
				else if (data.event_type == "maj_match") { await module_dashboard.get_module_matchmaking().receivedMajMatchSocket(data, user_id); }
				else if (data.event_type == "start_match") { window.location.hash = pageStatus.Game; }
			}

			else if (data.event_type == "new_group_name" || data.event_type == "new_group_picture"
			|| data.event_type == "i_leave_group" || data.event_type == "member_leave_group"
			|| data.event_type == "member_added_group" || data.event_type == "need_refresh_group") {
				if (!module_dashboard) {await import('./Dashboard.js').then((module) => {module_dashboard = module;});};
				if (!module_dashboard.get_module_social()) {await import('./DSocial.js').then(async (module) => {await module_dashboard.set_module_social(module);});};
				if (data.event_type == "new_group_name") { await module_dashboard.get_module_social().receiveNewGroupNameWebsocket(data, user_id); }
				else if (data.event_type == "new_group_picture") { await module_dashboard.get_module_social().receiveNewGroupPictureWebsocket(data, user_id); }
				else if (data.event_type == "i_leave_group") { await module_dashboard.get_module_social().receiveILeaveGroupWebsocket(data, user_id); }
				else if (data.event_type == "member_leave_group") { await module_dashboard.get_module_social().receiveGroupSizeChangedWebsocket(data, user_id); }
				else if (data.event_type == "member_added_group") { await module_dashboard.get_module_social().receiveGroupSizeChangedWebsocket(data, user_id); }
				else if (data.event_type == "need_refresh_group") { await module_dashboard.get_module_social().receiveGroupSizeChangedWebsocket(data, user_id); }
			}

			else if (data.event_type == "draw") {
				if (!module_dashboard) {await import('./PongGame.js').then((module) => {module_game = module;});};
				await module_game.receiveDraw(data, user_id); 
			}


			else if (data.event_type == "end_game" || data.event_type == "end_round_tournament" 
			|| data.event_type == "game_result" || data.event_type == "minus_timer"
			|| data.event_type == "redirect_to_game" || data.event_type == "redirect_to_dash") {
				if (!module_game) {await import('./PongGame.js').then((module) => {module_game = module;});};
				if (data.event_type == "end_game") { await module_game.receiveEndGame(data, user_id); }
				else if (data.event_type == "end_round_tournament") { await module_game.receiveEndRoundTournament(data, user_id); }
				else if (data.event_type == "game_result") { await module_game.receiveGameResult(data, user_id); }
				else if (data.event_type == "minus_timer") { await module_game.receiveMinusTimer(data, user_id); }
				else if (data.event_type == "redirect_to_game") { await module_game.receiveRedirectToGame(data, user_id); }
				else if (data.event_type == "redirect_to_dash") { await module_game.receiveRedirectToDash(data, user_id); }
			}
		
			else if (data.event_type =="tournament_left" || data.event_type == "maj_tournament_group") {
				if (!module_dashboard) {await import('./Dashboard.js').then((module) => {module_dashboard = module;});};
				if (!module_dashboard.get_module_tournament()) {await import('./DTournament.js').then(async (module) => {await module_dashboard.set_module_tournament(module);});};
				if (data.event_type == "tournament_left") { await module_dashboard.get_module_tournament().receiveTournamentLeftSocket(data, user_id); }
				else if (data.event_type == "maj_tournament_group") { await module_dashboard.get_module_tournament().receiveTournamentMajPageSocket(data, user_id); }
			}
		};

		socket.onerror = (error) => {
			showNotificationError("Websocket Error")
			reject();
		};

		socket.onclose = (event) => {
			socket = null;
		};
	});
}

async function getMeUserId() {
    try {
        const response = await axios.get('https://' + window.location.hostname + ':' + window.location.port + '/api/social/me/user_id', {
			withCredentials: true,
		});

		if (response.data && response.data.success) {
			return response.data.user_id;
		} else {
			showNotificationError("Error while recovering userId");
			return 'unknown';
		}
		
    } catch (error) {
		showNotificationError("Error while recovering userId");
		return 'unknown';
    }
}

export async function check_in_game() {
	try {
		const csrfToken = await getCSRFToken();

		if (!csrfToken) {return false}
		const {data} = await axios.get('https://' + window.location.hostname + ':' + window.location.port + '/api/sign/is_in_game/', {
			headers: {
				'Content-Type': 'application/json',
				'X-CSRFToken': csrfToken,
			},
			withCredentials: true,
		});
		if (data && data.success) {
			if (window.location.hash != pageStatus.Game) {
				window.location.hash = pageStatus.Game;
                return false;
			} else {
				return true;
			}
		} else {
			if (window.location.hash != pageStatus.Game) {
				return true;
			} else {
				window.location.hash = pageStatus.DashboardHome;
                return false;
			}
		}

	} catch (e) {
		return true
	}
}

/***********************************************************************************/
/*                                  Notifications                                  */
/***********************************************************************************/

export function showNotification(Intitulate, name, message, button_text, redir_function, user) {
	var notificationContainer = document.getElementById("NotificationsContainer");

	if (notificationContainer) {
		var notificationBox = document.createElement('div');
		notificationBox.classList.add("notification-box");

		var notificationBoxintitulate = document.createElement('h3');
		notificationBoxintitulate.classList.add("notification-box-intitulate");
		notificationBoxintitulate.textContent = Intitulate;

		notificationBox.appendChild(notificationBoxintitulate);

		var notificationBoxName = document.createElement('h3');
		notificationBoxName.classList.add("notification-box-name");
		notificationBoxName.textContent = name;
		notificationBoxName.onclick = () => {
			see_profil(name);
		}

		notificationBox.appendChild(notificationBoxName);

		var closeNotificationBox = document.createElement('span');
		closeNotificationBox.classList.add("material-symbols-outlined");
		closeNotificationBox.classList.add("close-notification-box");
		closeNotificationBox.innerHTML = 'close';
		closeNotificationBox.addEventListener('click', (event) => {
			closeNotificationBox.removeEventListener('click', (event) => {});
			if (button_text != "") { notificationBoxButton.removeEventListener('click', (event) => {}); }
			notificationContainer.removeChild(notificationBox);
		});

		notificationBox.appendChild(closeNotificationBox);

		if (message != "") {
			var notificationBoxContent = document.createElement('p');
			notificationBoxContent.classList.add("notification-box-content");
			notificationBoxContent.textContent = message;

			notificationBox.appendChild(notificationBoxContent);
		}

		if (button_text != "") {
			var notificationBoxButton = document.createElement('button');
			notificationBoxButton.classList.add("notification-box-button");
			notificationBoxButton.innerText = button_text;
			notificationBoxButton.addEventListener('click', (event) => {
				redir_function(user);
			});

			notificationBox.appendChild(notificationBoxButton);
		}

		notificationContainer.appendChild(notificationBox);

		setTimeout(function() {
			closeNotificationBox.removeEventListener('click', (event) => {});
			if (button_text != "") { notificationBoxButton.removeEventListener('click', (event) => {}); }
			if (notificationContainer.contains(notificationBox)) {
				notificationContainer.removeChild(notificationBox);
			}
		}, 14000);
	}
}

export function showNotificationError(Intitulate) {
	var notificationContainer = document.getElementById("NotificationsContainer");

	if (notificationContainer) {
		var notificationBox = document.createElement('div');
		notificationBox.classList.add("notification-box-error");

		var notificationBoxintitulate = document.createElement('h3');
		notificationBoxintitulate.classList.add("notification-box-intitulate");
		notificationBoxintitulate.textContent = Intitulate;

		notificationBox.appendChild(notificationBoxintitulate);


		var closeNotificationBox = document.createElement('span');
		closeNotificationBox.classList.add("material-symbols-outlined");
		closeNotificationBox.classList.add("close-notification-box");
		closeNotificationBox.innerHTML = 'close';
		closeNotificationBox.addEventListener('click', (event) => {
			closeNotificationBox.removeEventListener('click', (event) => {});
			notificationContainer.removeChild(notificationBox);
		});

		notificationBox.appendChild(closeNotificationBox);

		notificationContainer.appendChild(notificationBox);

		setTimeout(function() {
			closeNotificationBox.removeEventListener('click', (event) => {});
			if (notificationContainer.contains(notificationBox)) {
				notificationContainer.removeChild(notificationBox);
			}
		}, 14000);
	}
}

export async function see_profil(user_id) {
	window.location.hash = pageStatus.DashboardSocialProfil + '&user=' + user_id;
}

// **********************************************************************
// 				Charts
// **********************************************************************

let chartPointTime = null;
let chartBonus = null;

window.addEventListener('resize', function() {
    if (chartPointTime) {
		chartPointTime.resize();
	}
	if (chartBonus) {
		chartBonus.resize();
	}
});

export function set_chartPointTime(chart) { chartPointTime = chart };
export function get_chartPointTime() { return chartPointTime };

export function set_chartBonus(chart) { chartBonus = chart };
export function get_chartBonus() { return chartBonus };
