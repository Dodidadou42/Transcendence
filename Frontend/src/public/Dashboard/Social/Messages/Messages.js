/* ################### Social message Page event ##########################  */

import {pageStatus} from './Website.js';
import {GetStatus, UpdateStatus} from './Website.js';
import {getCSRFToken, showNotificationError} from './Website.js';
import {me_user_id, socket} from "./Website.js";
import {showNotification} from "./Website.js";

import {set_selected_mode, get_selected_mode, set_custom, get_custom,
	set_custom_selected_mode, get_custom_selected_mode, 
	set_custom_power_active, get_custom_power_active,
	set_inviteForGroupPos, get_inviteForGroupPos,
	set_J1, get_J1, set_J2, get_J2, set_J3, get_J3, set_J4, get_J4, Modes} from '/Dashboard.js';

import {get_recipient, set_recipient,
	get_more_recipient, set_more_recipient,
	get_isRecipientGroup, set_isRecipientGroup,
	get_last_sender, set_last_sender,
	get_last_message_date, set_last_message_date,
	get_last_message_date_record, set_last_message_date_record} from '/DSocial.js';

import {see_profil} from './Website.js';

import {formatMessageDate, MakeLeftGroup, createLeftContact, createGroupUserListOne, 
	sendCreateTable} from './DSocial.js';

var page = "";

let is_chat_window_open = false;
let is_chat_group_window_open = false;

export async function LoadPage() {
	const child = document.getElementById('content');
	if (!child) {return ;}
	if (page != "") {
		child.innerHTML = page;
		Page();
	} else {
		var cssLink = document.createElement('link');
		cssLink.rel = 'stylesheet';
		cssLink.href = './SMessages.css';
		document.head.appendChild(cssLink);
        cssLink.onload = function() {
            fetch('SMessages.html')
            .then(response => response.text())
            .then(html => {
                page = html;
                child.innerHTML = page;
				child.classList.remove("hidden")
				Page()
            });
        }
	}
	UpdateStatus(pageStatus.DashboardSocialMessages);
    document.title = "Dashboard Social Messages"
}

export function UnloadPage() {
	UpdateStatus("");
	
	set_last_sender('none');
	set_last_message_date(0);
	set_last_message_date_record(0);
	set_recipient('none');
	set_more_recipient('none');
	set_isRecipientGroup(false);

	let messSendInput = document.getElementById('messSendInput');
	if (messSendInput) {messSendInput.removeEventListener('keydown', function(event) {});};

	if (is_chat_window_open) {
		let HeadProfile = document.getElementById('HeadProfile');
		if (HeadProfile) {HeadProfile.removeEventListener('click', ()=>{});};

		let HeadBattle = document.getElementById('HeadBattle');
		if (HeadBattle) {HeadBattle.removeEventListener('click', ()=>{});};

		let battleFromChatCancel = document.getElementById('battleFromChatCancel');
		if (battleFromChatCancel) {battleFromChatCancel.removeEventListener('click', ()=>{});};

		let battleFromChatClassic = document.getElementById('battleFromChatClassic');
		if (battleFromChatClassic) {battleFromChatClassic.removeEventListener('click', ()=>{});};

		let battleFromChatPower = document.getElementById('battleFromChatPower');
		if (battleFromChatPower) {battleFromChatPower.removeEventListener('click', ()=>{});};
	}

	if (is_chat_group_window_open) {
		let HeadSettings = document.getElementById('HeadSettings');
		if (HeadSettings) {HeadSettings.removeEventListener('click', ()=>{});}

		let GSheadBack = document.getElementById('GSheadBack');
		if (GSheadBack) {GSheadBack.removeEventListener('click', ()=>{});};

		let GSHnbmiInv = document.getElementById('GSHnbmiInv');
		if (GSHnbmiInv) {GSHnbmiInv.removeEventListener('click', ()=>{});};

		let GSHnbmiInv2 = document.getElementById('GSHnbmiInv2');
		if (GSHnbmiInv2) {GSHnbmiInv2.removeEventListener('click', ()=>{});};

		let GSleave = document.getElementById('GSleave');
		if (GSleave) {GSleave.removeEventListener('click', ()=>{});};

		let InviteUserToGroupHeadSearch = document.getElementById('InviteUserToGroupHeadSearch');
		if (InviteUserToGroupHeadSearch) {InviteUserToGroupHeadSearch.removeEventListener('input', ()=>{});};

		let InviteUserToGroupFootBack = document.getElementById('InviteUserToGroupFootBack');
		if (InviteUserToGroupFootBack) {InviteUserToGroupFootBack.removeEventListener('click', ()=>{});};

		let GSHuid = document.getElementById('GSHuid');
		if (GSHuid) {GSHuid.removeEventListener('click', ()=>{});};

		let GSHuidEditConfirm = document.getElementById('GSHuidEditConfirm');
		if (GSHuidEditConfirm) {GSHuidEditConfirm.removeEventListener('click', ()=>{});}

		let GSHImgInput = document.getElementById('GSHImgInput');
		if (GSHImgInput) {GSHImgInput.removeEventListener('input', ()=>{});};
	}

	is_chat_window_open = false;
	is_chat_group_window_open = false;
}

async function Page() {
	if (get_recipient() != 'none') {} 
	else {window.location.hash = pageStatus.DashboardSocial; return ;}

	const chatWindow = document.getElementById('messPanel');
	if (chatWindow) {chatWindow.innerHTML = '';};

	let GSHImgBox = document.getElementById('GSHImgBox');
	if (GSHImgBox) {GSHImgBox.classList.remove('CanEditGroupImage');};

	let messSendInput = document.getElementById('messSendInput');
	if (messSendInput) {
		messSendInput.addEventListener('keydown', function(event) {
		if (event.key === 'Enter') {
			if (event.shiftKey) {
			} else {
				if (get_isRecipientGroup(true)) {
					sendGroupMessage();
				} else {
					sendMessage();
				}
				event.preventDefault();
			}
			}
		});
	}

	if (get_isRecipientGroup(true)) {
		try {
			const csrfToken = await getCSRFToken();
	
			if (csrfToken) {
				const {data} = await axios.post('https://' + window.location.hostname + ':' + window.location.port + '/api/social/group_chat_profil', {
					group: get_recipient(),
				}, {
					headers: {
						'Content-Type': 'application/json',
						'X-CSRFToken': csrfToken,
					},
					withCredentials: true,
				});
		
				if (data && data.success) {
					let HeadImg = document.getElementById('HeadImg');
					if (HeadImg) {HeadImg.src = data.groupImg;};

					let GSHImg = document.getElementById('GSHImg');
					if (GSHImg) {GSHImg.src = data.groupImg;};

					let HeadName = document.getElementById('HeadName');
					if (HeadName) {HeadName.innerText = data.groupName;};

					let GSHuid = document.getElementById('GSHuid');
					if (GSHuid) {GSHuid.innerText = data.groupName;};

					let GSHuidEditInput = document.getElementById('GSHuidEditInput');
					if (GSHuidEditInput) {GSHuidEditInput.value = data.groupName;};

					let GSHnbmiNB = document.getElementById('GSHnbmiNB');
					if (GSHnbmiNB) {GSHnbmiNB.innerText = data.groupMemberNumber + ' members';};

					let GSHnbmiNB2 = document.getElementById('GSHnbmiNB2');
					if (GSHnbmiNB2) {GSHnbmiNB2.innerText = data.groupMemberNumber + ' members';};

					let GSmembers = document.getElementById('GSmembers');
					if (GSmembers) {GSmembers.innerHTML = '';};

					data.members.forEach(user => {
						createGroupUserListOne(user.user_id, user.pseudo, user.picture, user.hasPower);
					});

					openGroupChatWindow(data.isAdmin);
		
				} else {
					if (data && data.message) {showNotificationError(data.message);};
				}
			};

		} catch (error) {
			showNotificationError("Error while recovering group chat profil");
		}
	} else {
		try {
			const csrfToken = await getCSRFToken();

			if (csrfToken) {
				const {data} = await axios.post('https://' + window.location.hostname + ':' + window.location.port + '/api/social/user_chat_profil', {
					user: get_recipient(),
				}, {
					headers: {
						'Content-Type': 'application/json',
						'X-CSRFToken': csrfToken,
					},
					withCredentials: true,
				});
		
				if (data && data.success) {
					let HeadImg = document.getElementById('HeadImg');
					if (HeadImg) {HeadImg.src = data.profil.picture;};

					let HeadName = document.getElementById('HeadName');
					if (HeadName) {HeadName.innerText = get_recipient();};
					openChatWindow();
		
				} else {
					if (data && data.message) {showNotificationError(data.message);};
				}
			};
		} catch (error) {
			showNotificationError("Error while recovering user chat profil");
		}
	}
}

function parseMessageBeforeSend(message) {
	try {
		if (message.length === 0) {
			throw new Error("message empty");
		}
		if (message.includes('<script>')) {
			throw new Error("script noy authorize");
		}
		return true;
	} catch (e) {
		return false;
	}
}

async function sendMessage() {
	const messageInput = document.getElementById('messSendInput');

	if (messageInput) {
		const message = messageInput.value;

		if (!parseMessageBeforeSend(message)) {
			return ;
		}

		if (message.length <= 1023) {

			if (get_recipient() != "") {
				if (socket && socket.readyState === WebSocket.OPEN) {
					socket.send(JSON.stringify({message, 'recipient': get_recipient(), 'event_type': "contact_message"}));
				} else {
					showNotificationError("Error with Websocket");
				}
			} else {
				showNotificationError("No recipient to send a message");
			}
			messageInput.value = '';
		}
		else
			showNotificationError("You can't exceed 1023 characters");
	};
}

async function sendGroupMessage() {
	const messageInput = document.getElementById('messSendInput');

	if (messageInput) {
		const message = messageInput.value;

		if (!parseMessageBeforeSend(message)) {
			return ;
		}

		if (message.length <= 1023) {

			if (get_recipient() != "") {
				if (socket && socket.readyState === WebSocket.OPEN) {
					socket.send(JSON.stringify({message, 'recipient': get_recipient(), 'event_type': "group_message"}));
				} else {
					showNotificationError("Error with Websocket");
				}
			} else {
				showNotificationError("No recipient to send a message");
			}
			messageInput.value = '';
		}
		else
			showNotificationError("You can't exceed 1023 characters");
	};
}

async function getChatMessages(contact_id) {
    try {
        const response = await axios.get('https://' + window.location.hostname + ':' + window.location.port + '/api/social/contacts/messages', {
            params: {
                contact_id: contact_id,
            },
			withCredentials: true,
        });
		if (response.data && response.data.success) {
        	return response.data;
		} else {
			if (response && response.data && response.data.message) {showNotificationError(response.data.message);};
		};
    } catch (error) {
		showNotificationError("Error while recovering user chat messages");
		return [];
    }
}

async function getGroupChatMessages(group_id) {
    try {
        const response = await axios.get('https://' + window.location.hostname + ':' + window.location.port + '/api/social/group/messages', {
            params: {
                group_id: group_id,
            },
			withCredentials: true,
        });				
		if (response.data && response.data.success) {
        	return response.data;
		} else {
			if (response && response.data && response.data.message) {showNotificationError(response.data.message);};
		};
    } catch (error) {
		showNotificationError("Error while recovering group chat messages");
		return [];
    }
}

function addMessage(chatWindow, data, img_url) {
	const messageDiv = document.createElement('div');
	messageDiv.classList.add('message-box');

	const picture = document.createElement('img');
	picture.src = img_url;
	picture.classList.add("message-picture");
	messageDiv.appendChild(picture);

	const bodyDiv = document.createElement('div');
	bodyDiv.classList.add('message-body');

	const messageHead = document.createElement('div');
	messageHead.classList.add('message-head');

	const senderName = document.createElement('span');
	senderName.textContent = data.sender;
	senderName.classList.add("message-sender");
	messageHead.appendChild(senderName);

	const dateDiv = document.createElement('span');
	dateDiv.textContent = formatMessageDate(data.created_at);
	dateDiv.classList.add("message-date");
	messageHead.appendChild(dateDiv);

	bodyDiv.appendChild(messageHead);

	const messageContent = document.createElement('div');
	messageContent.textContent = data.message;
	messageContent.classList.add("message-content");
	bodyDiv.appendChild(messageContent);

	messageDiv.appendChild(bodyDiv);

	chatWindow.appendChild(messageDiv);
}

function addMessageFollow(chatWindow, data) {
	const messageDiv = document.createElement('div');
	messageDiv.classList.add('message-box-follow');

	const messageContent = document.createElement('div');
	messageContent.textContent = data.message;
	messageContent.classList.add("message-content-follow");
	messageDiv.appendChild(messageContent);

	chatWindow.appendChild(messageDiv);
}

async function openChatWindow() {
	try {
		const {messages, owner, own_pic, oth_pic} = await getChatMessages(get_recipient());
		const chatWindow = document.getElementById('messPanel');

		if (chatWindow) {
			chatWindow.innerHTML = '';

			messages.forEach(message => {
				if (message.sender === owner){
					if (get_last_sender() === message.sender) {
						if ((formatMessageDate_for_design(message.created_at) - get_last_message_date()) >= 500 && (formatMessageDate_for_design(message.created_at) - get_last_message_date_record()) >= 100){
							addMessage(chatWindow, message, own_pic);
						}
						else {
							addMessageFollow(chatWindow, message);
						}
					}
					else {
						addMessage(chatWindow, message, own_pic);
						set_last_message_date(formatMessageDate_for_design(message.created_at));
					}
				}
				else{
					if (get_last_sender() != message.sender) {
						addMessage(chatWindow, message, oth_pic);
						set_last_message_date(formatMessageDate_for_design(message.created_at));
					}
					else {
						if ((formatMessageDate_for_design(message.created_at) - get_last_message_date()) >= 500 && (formatMessageDate_for_design(message.created_at) - get_last_message_date_record()) >= 100){
							addMessage(chatWindow, message, oth_pic);
						}
						else {
							addMessageFollow(chatWindow, message);
						}
					}
				}
				set_last_sender(message.sender);
				set_last_message_date_record(formatMessageDate_for_design(message.created_at));
			});

			let HeadSettings = document.getElementById('HeadSettings');
			if (HeadSettings) {HeadSettings.classList.add('hidden');};

			let HeadProfile = document.getElementById('HeadProfile');
			if (HeadProfile) {
				HeadProfile.classList.remove('hidden');
				HeadProfile.onclick = () => {
					see_profil(get_recipient());
				}
			};

			let HeadBattle = document.getElementById('HeadBattle');
			if (HeadBattle) {
				HeadBattle.classList.remove('hidden');
				HeadBattle.onclick = () => {
					let battleFromChatPanel = document.getElementById('battleFromChatPanel');
					if (battleFromChatPanel) {battleFromChatPanel.classList.remove('hidden');};
				};
			};

			let battleFromChatCancel = document.getElementById('battleFromChatCancel');
			if (battleFromChatCancel) {
				battleFromChatCancel.onclick = () => {
					let battleFromChatPanel = document.getElementById('battleFromChatPanel');
					if (battleFromChatPanel) {battleFromChatPanel.classList.add('hidden');};
				};
			};

			let battleFromChatClassic = document.getElementById('battleFromChatClassic');
			if (battleFromChatClassic) {
				battleFromChatClassic.onclick = () => {
					sendCreateTable(get_recipient(), Modes[1]);
					let battleFromChatPanel = document.getElementById('battleFromChatPanel');
					if (battleFromChatPanel) {battleFromChatPanel.classList.add('hidden');};
				};
			};

			let battleFromChatPower = document.getElementById('battleFromChatPower');
			if (battleFromChatPower) {
				battleFromChatPower.onclick = () => {
					sendCreateTable(get_recipient(), Modes[2]);
					let battleFromChatPanel = document.getElementById('battleFromChatPanel');
					if (battleFromChatPanel) {battleFromChatPanel.classList.add('hidden');};
				};
			};

			const sendButton = document.getElementById('messSendButton');
			if (sendButton) {sendButton.onclick = sendMessage;};

			chatWindow.scrollTop = chatWindow.scrollHeight;

			is_chat_window_open = true;
		};

    } catch (error) {
        showNotificationError("Error loading chat messages");
    }

}

async function openGroupChatWindow(isAdmin) {
	try {
		const chatWindow = document.getElementById('messPanel');

		if (chatWindow) {
			chatWindow.innerHTML = '';

			let HeadSettings = document.getElementById('HeadSettings')
			if (HeadSettings) {HeadSettings.classList.remove('hidden');};

			let HeadProfile = document.getElementById('HeadProfile');
			if (HeadProfile) {HeadProfile.classList.add('hidden');};

			let HeadBattle = document.getElementById('HeadBattle');
			if (HeadBattle) {HeadBattle.classList.add('hidden');};

			toggleGroupSettings(false);
			const {messages} = await getGroupChatMessages(get_recipient());

			messages.forEach(message => {
				if (message.sender == get_last_sender()) {
					if ((formatMessageDate_for_design(message.created_at) - get_last_message_date()) >= 500 && (formatMessageDate_for_design(message.created_at) - get_last_message_date_record()) >= 100){
						addMessage(chatWindow, message, message.messPic);
					}
					else {
						addMessageFollow(chatWindow, message);
					}
				} else {
					addMessage(chatWindow, message, message.messPic);
					set_last_message_date_record(formatMessageDate_for_design(message.created_at));
				}
				set_last_sender(message.sender);
				set_last_message_date(formatMessageDate_for_design(message.created_at));
			});

			if (HeadSettings) {
				HeadSettings.classList.remove('hidden');
				HeadSettings.onclick = () => {
					toggleGroupSettings(true);
				};
			};

			if (HeadProfile) {HeadProfile.classList.add('hidden');};

			if (HeadBattle) {HeadBattle.classList.add('hidden');};

			let GSheadBack = document.getElementById('GSheadBack');
			if (GSheadBack) {
				GSheadBack.onclick = () => {
					toggleGroupSettings(false);
				};
			};

			let GSHnbmiInv = document.getElementById('GSHnbmiInv');
			if (GSHnbmiInv) {
				GSHnbmiInv.onclick = () => {
					toggleInvUserToGroup(true);
				};
			};

			let GSHnbmiInv2 = document.getElementById('GSHnbmiInv2');
			if (GSHnbmiInv2) {
				GSHnbmiInv2.onclick = () => {
					toggleInvUserToGroup(true);
				};
			};

			let GSleave = document.getElementById('GSleave');
			if (GSleave) {
				GSleave.onclick = () => {
					if (socket && socket.readyState === WebSocket.OPEN) {
						socket.send(JSON.stringify({'recipient': get_recipient(), 'event_type': "group_leave"}));
					} else {
						showNotificationError("Error with Websocket");
					}
					window.location.hash = pageStatus.DashboardSocialContacts;
				};
			};

			let InviteUserToGroupHeadSearch = document.getElementById('InviteUserToGroupHeadSearch');
			if (InviteUserToGroupHeadSearch) {
				InviteUserToGroupHeadSearch.oninput = (event) => {
					getUserCanInviteToGroup(event.target.value);
				};
			};

			let InviteUserToGroupFootBack = document.getElementById('InviteUserToGroupFootBack');
			if (InviteUserToGroupFootBack) {
				InviteUserToGroupFootBack.onclick = () => {
					toggleInvUserToGroup(false);
				};
			};

			if (isAdmin == true) {
				let GSHuid = document.getElementById('GSHuid');
				if (GSHuid) {
					GSHuid.onclick = () => {
						let GSHuid = document.getElementById('GSHuid');
						if (GSHuid) {document.getElementById('GSHuid').classList.add('hidden');};

						let GSHuidEdit = document.getElementById('GSHuidEdit');
						if (GSHuidEdit) {GSHuidEdit.classList.remove('hidden');};
					};
				};

				let GSHuidEditConfirm = document.getElementById('GSHuidEditConfirm');
				if (GSHuidEditConfirm) {
					GSHuidEditConfirm.onclick = async () => {
						if (socket && socket.readyState === WebSocket.OPEN) {
							let GSHuidEditInput = document.getElementById('GSHuidEditInput');
							let GSHuid = document.getElementById('GSHuid');
							if (GSHuidEditInput && GSHuid && (GSHuidEditInput.value != GSHuid.innerText)) {
								socket.send(JSON.stringify({'recipient': get_recipient(), 'newName': GSHuidEditInput.value ,'event_type': "group_edit_name"}));
							}
						} else {
							showNotificationError("Error with Websocket");
						}

						let GSHuidEdit = document.getElementById('GSHuidEdit');
						if (GSHuidEdit) {GSHuidEdit.classList.add('hidden');};

						let GSHuid = document.getElementById('GSHuid');
						if (GSHuid) {document.getElementById('GSHuid').classList.remove('hidden');};
					};
				};

				let GSHImgBox = document.getElementById('GSHImgBox');
				if (GSHImgBox) {GSHImgBox.classList.add('CanEditGroupImage');};

				let GSHImgInput = document.getElementById('GSHImgInput');
				if (GSHImgInput) {
					GSHImgInput.oninput = async () => {
						try {
							let GSHImgInput = document.getElementById('GSHImgInput');
							if (GSHImgInput) {
								const value = GSHImgInput.files[0];
								const reader = new FileReader();
					
								reader.onload = async function(e) {
									if (socket && socket.readyState === WebSocket.OPEN) {
										socket.send(JSON.stringify({'recipient': get_recipient(), 'newPic': e.target.result, 'event_type': "group_edit_picture"}));
									} else {
										showNotificationError("Error with Websocket");
									}
								};
					
								reader.readAsDataURL(value);
							}
						} catch (e) {
							showNotificationError("Error while posting new picture");
						}
					};
				};
			}

			const sendButton = document.getElementById('messSendButton');
			if (sendButton) {sendButton.onclick = sendGroupMessage;};
			chatWindow.scrollTop = chatWindow.scrollHeight;

			is_chat_group_window_open = true;
		};
    } catch (error) {
		showNotificationError("Error loading group chat messages");
    }
	
}

export async function receiveMessage(data, user_id) {
	let chatBox;

	if (data.sender == user_id || data.sender == get_recipient()) {
		chatBox = document.getElementById('messPanel');
	}
	if (chatBox) {

		if (data.sender === me_user_id){
			if (get_last_sender() === me_user_id) {
				if ((OtherParseTimeForNewMessage(data.date) - get_last_message_date()) >= 500 && (OtherParseTimeForNewMessage(data.date) - get_last_message_date_record()) >= 100){
					addNewMessage(chatBox, data);
				}
				else {
					addNewMessageFollow(chatBox, data);
				}
			}
			else {
				addNewMessage(chatBox, data);
				set_last_message_date(OtherParseTimeForNewMessage(data.date));
			}
		}
		else{
			if (get_last_sender() === me_user_id) {
				addNewMessage(chatBox, data);
				set_last_message_date(OtherParseTimeForNewMessage(data.date));
			}
			else {
				if ((OtherParseTimeForNewMessage(data.date) - get_last_message_date()) >= 500 && (OtherParseTimeForNewMessage(data.date) - get_last_message_date_record()) >= 100){
					addNewMessage(chatBox, data);
				}
				else {
					addNewMessageFollow(chatBox, data);
				}
			}
		}
		set_last_sender(data.sender);
		set_last_message_date_record(OtherParseTimeForNewMessage(data.date));

		chatBox.scrollTop = chatBox.scrollHeight;
	}
	else {
		showNotification("New private message from " , data.sender, data.message, "", "", "");
	}
	if (window.location.hash == pageStatus.DashboardSocial || window.location.hash == pageStatus.DashboardSocialMessages 
		|| window.location.hash.startsWith(pageStatus.DashboardSocialProfil) || window.location.hash.startsWith(pageStatus.DashboardSocialGameDetails)) {
		if (data.sender == user_id)
			await changeLeftContact(get_recipient());
		else
			await changeLeftContact(data.sender);
	}
}

export async function receiveNewGroupMess(message, Me_User) {
	let chatBox;

	if (message.sender == Me_User || message.recipient == get_recipient()) {
		chatBox = document.getElementById('messPanel');
	}
	if (chatBox) {
		if (message.recipient == get_recipient()) {
			const chatWindow = document.getElementById('messPanel');
			if (chatWindow) {
				if (message.sender == get_last_sender()) {
					if ((OtherParseTimeForNewMessage(message.date) - get_last_message_date()) >= 500 && (OtherParseTimeForNewMessage(message.date) - get_last_message_date_record()) >= 100){
						addNewMessage(chatWindow, message, message.senderImg);
					}
					else {
						addNewMessageFollow(chatWindow, message);
					}
				} else {
					addNewMessage(chatWindow, message, message.senderImg);
					set_last_message_date_record(OtherParseTimeForNewMessage(message.date));
				}
			}
	
			set_last_sender(message.sender);
			set_last_message_date(OtherParseTimeForNewMessage(message.date));
			const chatBox = document.getElementById('messPanel');
			if (chatBox) {chatBox.scrollTop = chatBox.scrollHeight;};
		}
	}
	else {
		showNotification("New message from " + message.groupName, "", message.message, "", "", "");
	}
	if (window.location.hash == pageStatus.DashboardSocial || window.location.hash == pageStatus.DashboardSocialMessages || window.location.hash == pageStatus.DashboardSocialContacts
		|| window.location.hash.startsWith(pageStatus.DashboardSocialProfil) || window.location.hash.startsWith(pageStatus.DashboardSocialGameDetails)) {
		MakeLeftGroup();
	}
}

function OtherParseTimeForNewMessage(dateString) {
	let [timePart, datePart] = dateString.split(' ');
	let [hour, minute, second] = timePart.split(':');
	let [day, month, year] = datePart.split('/');

	return Number(`${year}${month}${day}${hour}${minute}${second}`);
}

function addNewMessage(chatWindow, data) {
	const messageDiv = document.createElement('div');
	messageDiv.classList.add('message-box');

	const picture = document.createElement('img');
	picture.src = data.sender_picture;
	picture.classList.add("message-picture");
	messageDiv.appendChild(picture);

	const bodyDiv = document.createElement('div');
	bodyDiv.classList.add('message-body');

	const messageHead = document.createElement('div');
	messageHead.classList.add('message-head');

	const senderName = document.createElement('span');
	senderName.textContent = data.sender;
	senderName.classList.add("message-sender");
	messageHead.appendChild(senderName);

	const dateDiv = document.createElement('span');
	dateDiv.textContent = data.date;
	dateDiv.classList.add("message-date");
	messageHead.appendChild(dateDiv);

	bodyDiv.appendChild(messageHead);

	const messageContent = document.createElement('div');
	messageContent.textContent = data.message;
	messageContent.classList.add("message-content");
	bodyDiv.appendChild(messageContent);

	messageDiv.appendChild(bodyDiv);

	chatWindow.appendChild(messageDiv);
}

function addNewMessageFollow(chatWindow, data) {

	const messageDiv = document.createElement('div');
	messageDiv.classList.add('message-box-follow');

	const messageContent = document.createElement('div');
	messageContent.textContent = data.message;
	messageContent.classList.add("message-content-follow");
	messageDiv.appendChild(messageContent);

	chatWindow.appendChild(messageDiv);
}

async function toggleInvUserToGroup(active) {
	const panel = document.getElementById('inviteUserToGroupPanel');
	if (panel) {
		if (active == true) {
			await getUserCanInviteToGroup('');
			panel.classList.remove('hidden');
		} else {
			panel.classList.add('hidden');

			let InviteUserToGroupBody = document.getElementById('InviteUserToGroupBody');
			if (InviteUserToGroupBody) {InviteUserToGroupBody.innerHTML = '';};
		}
	}
}

async function getUserCanInviteToGroup(prompt){
	let InviteUserToGroupBody = document.getElementById('InviteUserToGroupBody');
	if (InviteUserToGroupBody) {
		InviteUserToGroupBody.innerHTML = '<div class="insearchpeopleload" id="insearchpeopleload"><div class="lds-ring"><div></div><div></div><div></div><div></div></div></div>';
		try {
	
			const csrfToken = await getCSRFToken();
	
			if (csrfToken) {
				const {data} = await axios.post('https://' + window.location.hostname + ':' + window.location.port + '/api/social/search', {
					filter: 'allInGroup',
					groupId: get_recipient(),
					user_input: prompt,
				}, {
					headers: {
						'Content-Type': 'application/json',
						'X-CSRFToken': csrfToken,
					},
					withCredentials: true,
				});
		
				if (data && data.success) {
					InviteUserToGroupBody.innerHTML = '';
					for (let i = 0; i < data.List.length; i++) {
						addOnePersonGroupSearchList2(data.List[i].picture, data.List[i].user_id);
					}
		
				} else {
					InviteUserToGroupBody.innerHTML = '';
					if (data && data.message) {showNotificationError(data.message);};
					return ;
				}
			};

		} catch (error) {
			InviteUserToGroupBody.innerHTML = '';
			showNotificationError("Error while searching user list");
			return ;
		}
	};
}

function addOnePersonGroupSearchList2(imgUrl, name) {
	let person = document.createElement('div');
	person.classList.add('personToGroupInvite');
	person.id = 'searchPersonToGroup' + name;

	let personImg = document.createElement('img');
	personImg.src = imgUrl;

	let personName = document.createElement('span');
	personName.innerText = name;

	person.appendChild(personImg);
	person.appendChild(personName);

	let personButton = document.createElement('button');
	personButton.innerText = 'add';

	personButton.onclick = async () => {
		if (socket && socket.readyState === WebSocket.OPEN) {
			let searchPersonToGroup = document.getElementById('searchPersonToGroup' + name);
			if (searchPersonToGroup) {searchPersonToGroup.remove();};

			socket.send(JSON.stringify({'recipient': get_recipient(), 'user_added': name, 'event_type': "user_added_group"}));
		} else {
			showNotificationError("Error with Websocket");
		}
	}

	person.appendChild(personButton);

	let InviteUserToGroupBody = document.getElementById('InviteUserToGroupBody');
	if (InviteUserToGroupBody) {InviteUserToGroupBody.appendChild(person);};
}

async function toggleGroupSettings(active) {
	let body2 = document.getElementById('body2_smessages');
	let GroupSettingsPanel = document.getElementById('GroupSettingsPanel');

	if (body2 && GroupSettingsPanel) {
		if (active === true) {
			body2.classList.add('hidden');
			GroupSettingsPanel.classList.remove('hidden');
		} else {
			body2.classList.remove('hidden');
			GroupSettingsPanel.classList.add('hidden');
		}
	};
}

function formatMessageDate_for_design(created_at) {
	const date = new Date(created_at);
	const hours = date.getHours().toString().padStart(2, '0');
	const minutes = date.getMinutes().toString().padStart(2, '0');
	const seconds = date.getSeconds().toString().padStart(2, '0');
	const day = date.getDate().toString().padStart(2, '0');
	const month = (date.getMonth() + 1).toString().padStart(2, '0');
	const year = date.getFullYear();

	return Number(`${year}${month}${day}${hours}${minutes}${seconds}`);
}

async function changeLeftContact(user_id) {
	try {
		const csrfToken = await getCSRFToken();

		if (csrfToken) {
			const {data} = await axios.post('https://' + window.location.hostname + ':' + window.location.port + '/api/social/user_chat_profil', {
				user: user_id,
			}, {
				headers: {
					'Content-Type': 'application/json',
					'X-CSRFToken': csrfToken,
				},
				withCredentials: true,
			});

			if (data && data.success) {
				var noconv = document.getElementById('noconv');

				if (noconv && !noconv.classList.contains("hidden"))
					noconv.classList.add("hidden");

				var leftContactList = document.getElementById('navContact');

				if (leftContactList) {
					var children = leftContactList.children;

					var is_already_contains = -1;
					for (var i = 0; i < children.length; i++) {
						if (children[i].id == 'NPC_data_user_id_is_' + data.profil.user_id){
							is_already_contains = i;
							break;
						}
					}
					if (i == 0) {
						return ;
					}
					if (is_already_contains != -1)
						leftContactList.removeChild(children[is_already_contains]);

					var leftMore = document.getElementById('navBodyContact');
					
					if (leftMore) {
						var children = leftMore.children;

						var is_already_contains = -1;
						for (var i = 0; i < children.length; i++) {
							if (children[i].classList.contains('More_user_id_is_' + data.profil.user_id)){
								is_already_contains = i;
								break;
							}
						}
						if (is_already_contains != -1)
							leftMore.removeChild(children[is_already_contains]);

						var div = createLeftContact(data.profil, user_id);
						leftContactList.prepend(div);
					};
				};

			} else {
				if (data && data.message) {showNotificationError(data.message);};
			}
		};

	} catch (error) {
		showNotificationError("Error while updating contact list");
	}
}