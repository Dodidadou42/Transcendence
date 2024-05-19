/***********************************************************************************/
/*                               Social Page event                                 */
/***********************************************************************************/

let recipient = 'none';
let more_recipient = 'none';
let isRecipientGroup = false;

let last_sender = '';
let last_message_date = 0;
let last_message_date_record = 0;

let skip_load = false;

export function get_recipient() { return recipient; };
export function set_recipient(name) { recipient = name; };

export function get_more_recipient() { return more_recipient; };
export function set_more_recipient(name) { more_recipient = name; };

export function get_isRecipientGroup() { return isRecipientGroup; };
export function set_isRecipientGroup(is_isRecipientGroup) { isRecipientGroup = is_isRecipientGroup; };

export function get_last_sender() { return last_sender; };
export function set_last_sender(name) { last_sender = name; };

export function get_last_message_date() { return last_message_date; };
export function set_last_message_date(date) { last_message_date = date; };

export function get_last_message_date_record() { return last_message_date_record; };
export function set_last_message_date_record(date) { last_message_date_record = date; };

import {pageStatus} from './Website.js';
import {GetStatus, UpdateStatus} from './Website.js';
import {getCSRFToken, showNotificationError} from './Website.js';
import {me_user_id, socket} from './Website.js';
import {showNotification} from './Website.js';

import {see_profil} from './Website.js';

import {handleTitle} from './Dashboard.js';

import {sendAddFriend, sleep} from './Dashboard.js';

let posX = 0;
let posY = 0;

let module_contacts = null;
let module_game_details = null;
let module_messages = null;
let module_profil = null;

export function get_module_contacts() { return module_contacts; };
export function get_module_game_details() { return module_game_details; };
export function get_module_messages() { return module_messages; };
export function get_module_profil() { return module_profil; };

export function set_module_contacts(module) { module_contacts = module; };
export function set_module_game_details(module) { module_game_details = module; };
export function set_module_messages(module) { module_messages = module; };
export function set_module_profil(module) { module_profil = module; };

let profil_to_check = 'none';

export function get_profil_to_check() { return profil_to_check; };
export function set_profil_to_check( name ) { profil_to_check = name; };

var page = "";

let create_group_user_list = [];

export function LoadPage() {
	if (skip_load == false) {
		const child = document.getElementById('child1_dashboard');
		if (!child) {return ;}
		if (page != "") {
			child.innerHTML = page;
			Page(window.location.hash);
		} else {
			var cssLink = document.createElement('link');
			cssLink.rel = 'stylesheet';
			cssLink.href = './DSocial.css';
			document.head.appendChild(cssLink);
			cssLink.onload = function() {
				fetch('DSocial.html')
				.then(response => response.text())
				.then(html => {
					page = html;
					child.innerHTML = page;
					child.classList.remove("hidden")
					Page(window.location.hash)
				});
			}
		}
		handleTitle('Social');
	} else {
		Page(window.location.hash);
	}
}

export function UnloadPage() {
	switch(GetStatus()) {
		case pageStatus.DashboardSocialProfil:
			if (module_profil) {module_profil.UnloadPage();};
			break;
		case pageStatus.DashboardSocialGameDetails:
			if (module_game_details) {module_game_details.UnloadPage();};
			break;
		case pageStatus.DashboardSocialMessages:
			if (module_messages) {module_messages.UnloadPage();};
			break;
		case pageStatus.DashboardSocialContacts:
			if (module_contacts) {module_contacts.UnloadPage();};
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

	if (window.location.hash == pageStatus.DashboardSocial
	|| page_root == pageStatus.DashboardSocialProfil
	|| page_root_game_details == pageStatus.DashboardSocialGameDetails
	|| window.location.hash == pageStatus.DashboardSocialMessages
	|| window.location.hash == pageStatus.DashboardSocialContacts) {
		skip_load = true;
	} else {
		skip_load = false;
		const child = document.getElementById('content');
		if (child) {child.innerHTML = '';};

		let allSocial = document.getElementById('allSocial');
		if (allSocial) {allSocial.removeEventListener('click', () => {});}
		
		let contactCat = document.getElementById('contactCat');
		if (contactCat) {contactCat.removeEventListener('click', (event) => {});};
		
		let groupCat = document.getElementById('groupCat');
		if (groupCat) {groupCat.removeEventListener('click', (event) => {});};

		let morechat = document.getElementById('moreChat');
		if (morechat) {morechat.removeEventListener('click', (event) => {});};

		let moreProfil = document.getElementById('moreProfil');
		if (moreProfil) {moreProfil.removeEventListener('click', (event) => {});};

		let AddGroupB = document.getElementById('AddGroupB');
		if (AddGroupB) {AddGroupB.removeEventListener('click', (event) => {});};

		let CGFcancel = document.getElementById('CGFcancel');
		if (CGFcancel) {CGFcancel.removeEventListener('click', (event) => {});};

		let addPeopleCgf = document.getElementById('addPeopleCgf');
		if (addPeopleCgf) {addPeopleCgf.removeEventListener('click', (event) => {});};

		let CGFInviteCancel = document.getElementById('CGFInviteCancel');
		if (CGFInviteCancel) {CGFInviteCancel.removeEventListener('click', (event) => {});};

		let CGFInviteFormHeadInput = document.getElementById('CGFInviteFormHeadInput');
		if (CGFInviteFormHeadInput) {CGFInviteFormHeadInput.removeEventListener('input', (event) => {});};

		let cgfName = document.getElementById('cgfName');
		if (cgfName) {cgfName.removeEventListener('input', (event) => {});};

		let cgfInputPicture = document.getElementById('cgfInputPicture');
		if (cgfInputPicture) {cgfInputPicture.removeEventListener('input', (event) => {});};

		let CGFcreate = document.getElementById('CGFcreate');
		if (CGFcreate) {CGFcreate.removeEventListener('click', (event) => {});};
	};
}

async function Page(page) {
	MakeLeftContact()

	const child = document.getElementById('content');
	if (child) {child.innerHTML = '';};

	const hashParts = page.split('&');

	let page_split = page.split("_");
	let page_root = "";
	let page_root_game_details = ""

	let hash_split = hashParts[0].split("_")
	if (page_split.length > 2)
		page_root = hash_split[0] + "_" + hash_split[1] + "_" + hash_split[2];
	if (page_split.length > 3)
		page_root_game_details = hash_split[0] + "_" + hash_split[1] + "_" + hash_split[2] + "_" + hash_split[3];

	if (page == pageStatus.DashboardSocial || page == pageStatus.DashboardSocialContacts) {
		if (!module_contacts) {
			import('./SContacts.js').then((module) => {
				module_contacts = module;
				module_contacts.LoadPage();
			});
		} else {
			module_contacts.LoadPage();
		}
	}
	else if (page == pageStatus.DashboardSocialMessages) {
		if (!module_messages) {
			import('./SMessages.js').then((module) => {
				module_messages = module;
				module_messages.LoadPage();
			});
		} else {
			module_messages.LoadPage();
		}
	}
	else if (page_root == pageStatus.DashboardSocialProfil) {
		if (hashParts.length == 2)
		{
			const param_name = hashParts[1].split('=');
			if (param_name.length == 2)
			{
				if (hashParts[0] === pageStatus.DashboardSocialProfil && param_name[0] == 'user')
				{
					if (!module_profil) {
						import('./SProfil.js').then((module) => {
							module_profil = module;
							module_profil.LoadPage();
						});
					} else {
						module_profil.LoadPage();
					}
				} else { window.location.hash = pageStatus.DashboardSocialContacts; }
			} else { window.location.hash = pageStatus.DashboardSocialContacts; }
		} else { window.location.hash = pageStatus.DashboardSocialContacts; }
	}
	else if (page_root_game_details == pageStatus.DashboardSocialGameDetails) {
		const hashParts = window.location.hash.split('&');
		if (hashParts.length == 2)
		{
			const param_name = hashParts[1].split('=');
			if (param_name.length == 2)
			{
				if (hashParts[0] === pageStatus.DashboardSocialGameDetails && param_name[0] == 'game' && is_number(param_name[1]))
				{
					if (!module_game_details) {
						import('./SGameDetails.js').then((module) => {
							module_game_details = module;
							module_game_details.LoadPage();
						});
					} else {
						module_game_details.LoadPage();
					}
				} else { window.location.hash = pageStatus.DashboardSocialContacts; }
			} else { window.location.hash = pageStatus.DashboardSocialContacts; }
		} else { window.location.hash = pageStatus.DashboardSocialContacts; }
	}
	else {
		window.location.hash = pageStatus.DashboardSocialContacts;
	}

	if (skip_load == false) {
		let allSocial = document.getElementById('allSocial');
		if (allSocial) {
			allSocial.addEventListener('click', (event) => {
				window.location.hash = pageStatus.DashboardSocialContacts;
			});
		};
		
		let contactCat = document.getElementById('contactCat');
		if (contactCat) {
			contactCat.addEventListener('click', (event) => {
				MakeLeftContact()
				
				let navBodyContact = document.getElementById('navBodyContact');
				if (navBodyContact) {navBodyContact.classList.remove('hidden');};

				let navBodyGroup = document.getElementById('navBodyGroup');
				if (navBodyGroup) {navBodyGroup.classList.add('hidden');};

				let navFoot = document.getElementById('navFoot');
				if (navFoot) {navFoot.classList.remove('navFootGroup');};

				let AddGroupB = document.getElementById('AddGroupB');
				if (AddGroupB) {AddGroupB.classList.add('hidden');};
			});
		};
		
		let groupCat = document.getElementById('groupCat');
		if (groupCat) {
			groupCat.addEventListener('click', (event) => {
				MakeLeftGroup()

				let navBodyContact = document.getElementById('navBodyContact');
				if (navBodyContact) {navBodyContact.classList.add('hidden');};

				let navBodyGroup = document.getElementById('navBodyGroup');
				if (navBodyGroup) {navBodyGroup.classList.remove('hidden');};

				let navFoot = document.getElementById('navFoot');
				if (navFoot) {navFoot.classList.add('navFootGroup');};

				let AddGroupB = document.getElementById('AddGroupB');
				if (AddGroupB) {AddGroupB.classList.remove('hidden');};
			});
		};

		let morechat = document.getElementById('moreChat');
		if (morechat) {
			morechat.addEventListener('click', (event) => {
				openChat(get_more_recipient(), false);
			});
		};

		let moreProfil = document.getElementById('moreProfil');
		if (moreProfil) {
			moreProfil.addEventListener('click', (event) => {
				see_profil(get_more_recipient());
			});
		};

		let AddGroupB = document.getElementById('AddGroupB');
		if (AddGroupB) {
			AddGroupB.addEventListener('click', (event) => {
				toggleCreateGroupForm(true);
			});
		};

		let CGFcancel = document.getElementById('CGFcancel');
		if (CGFcancel) {
			CGFcancel.addEventListener('click', (event) => {
				toggleCreateGroupForm(false);
			});
		};

		let addPeopleCgf = document.getElementById('addPeopleCgf');
		if (addPeopleCgf) {
			addPeopleCgf.addEventListener('click', (event) => {
				toggleCreateGroupFormInvite(true);
			});
		};

		let CGFInviteCancel = document.getElementById('CGFInviteCancel');
		if (CGFInviteCancel) {
			CGFInviteCancel.addEventListener('click', (event) => {
				toggleCreateGroupFormInvite(false);
			});
		};

		let CGFInviteFormHeadInput = document.getElementById('CGFInviteFormHeadInput');
		if (CGFInviteFormHeadInput) {
			CGFInviteFormHeadInput.addEventListener('input', (event) => {
				searchPeopleInviteGroup(event.target.value);
			});
		};

		let cgfName = document.getElementById('cgfName');
		if (cgfName) {
			cgfName.addEventListener('input', (event) => {
				verifToCreate();
			});
		};

		let cgfInputPicture = document.getElementById('cgfInputPicture');
		if (cgfInputPicture) {
			cgfInputPicture.addEventListener('input', (event) => {
				verifToCreate();
			});
		};

		let CGFcreate = document.getElementById('CGFcreate');
		if (CGFcreate) {
			CGFcreate.addEventListener('click', (event) => {
				createGroupByForm();
			});
		};
	};
}


export async function receiveNewGroupNameWebsocket(data, Me_User) {
	if (data.recipient == get_recipient() && window.location.hash == pageStatus.DashboardSocialMessages) {

		let GSHuidEditInput = document.getElementById('GSHuidEditInput');
		if (GSHuidEditInput) {GSHuidEditInput.value = data.newName;};

		let GSHuid = document.getElementById('GSHuid');
		if (GSHuid) {GSHuid.innerText = data.newName;};

		let HeadName = document.getElementById('HeadName');
		if (HeadName) {HeadName.innerText = data.newName;};

		let NGPu_id = document.getElementById('NGPu_id' + data.lastName);
		if (NGPu_id) {
			NGPu_id.innerText = data.newName;
			NGPu_id.id = 'NGPu_id' + data.newName;
		};
	}
	if (window.location.hash == pageStatus.DashboardSocial || window.location.hash == pageStatus.DashboardSocialMessages || window.location.hash == pageStatus.DashboardSocialContacts
		|| window.location.hash.startsWith(pageStatus.DashboardSocialProfil) || window.location.hash.startsWith(pageStatus.DashboardSocialGameDetails)) {
		MakeLeftGroup();
	}
}

async function MakeLeftContact() {
	try {
		const csrfToken = await getCSRFToken();

		if (csrfToken) {
			const response = await axios.get('https://' + window.location.hostname + ':' + window.location.port + '/api/social/get_left_contact', {
				headers: {
					'Content-Type': 'application/json',
					'X-CSRFToken': csrfToken,
				},
				withCredentials: true,
			});

			var data = response.data;
			if (data && data.success) {
				var leftContactList = document.getElementById('navContact');

				if (leftContactList) {
					var children = leftContactList.children
					if (children.length != 0) {
						var noconv = document.getElementById('noconv');
						if (noconv) {
							for (let i = 0; i < children.length; i++) {
								if (children[i] != noconv) {
									leftContactList.removeChild(children[i]);
									i--;
								}
							}
						}
					}

					var leftMore = document.getElementById('navBodyContact');
					if (leftMore) {
						var children = leftMore.children
						if (children.length != 0) {
							for (let i = 0; i < children.length; i++) {
								if (children[i] !== leftContactList) {
									leftMore.removeChild(children[i]);
								}
							}
						}
					}

					if (data.List.length != 0) {
						var noconv = document.getElementById('noconv');
						if (noconv) {noconv.classList.add("hidden");};
						for (let i = 0; i < data.List.length; i++) {

							var div = createLeftContact(data.List[i], data.List[i].user_id);
							leftContactList.prepend(div)
						}
					}
				}
			} else {
				if (data && data.message) {showNotificationError(data.message);};
			}
		};

	} catch (error) {
		showNotificationError("Error while recovering contacts list");
		throw error;
	}
}

async function createGroupByForm() {
	let cgfInputPicture = document.getElementById('cgfInputPicture');
	
	if (cgfInputPicture) {
		const value = cgfInputPicture.files[0];
		const reader = new FileReader();

		reader.onload = async function(e) {
			try {
				let CGFLoad = document.getElementById('CGFLoad');
				if (CGFLoad) {CGFLoad.classList.remove('hidden');};

				let createGroupForm = document.getElementById('createGroupForm');
				if (createGroupForm) {createGroupForm.classList.add('hidden');};

				let cgfName = document.getElementById('cgfName');
				if (cgfName) {
					const csrfToken = await getCSRFToken();
			
					if (csrfToken) {
						const {data} = await axios.post('https://' + window.location.hostname + ':' + window.location.port + '/api/social/group/create', {
							members: create_group_user_list,
							groupName: cgfName.value,
							picture: e.target.result,
						}, {
							headers: {
								'Content-Type': 'application/json',
								'X-CSRFToken': csrfToken,
							},
							withCredentials: true,
						});
				
						await sleep(500);
				
						if (data && data.success) {
							toggleCreateGroupForm(false);
							MakeLeftGroup();
							return true;
						} else {
							if (CGFLoad && createGroupForm)
							CGFLoad.classList.add('hidden');
							createGroupForm.classList.remove('hidden');
							if (data && data.message) {showNotificationError(data.message);};
							return false;
						}
					} else {
						return false;
					}
				};

			} catch (error) {
				showNotificationError("Error while creating group");
				return false;
			}
		};

		reader.readAsDataURL(value);	
	}
}

async function toggleCreateGroupForm (value) {
	const form = document.getElementById('createGroupBody');
	let CGFLoad = document.getElementById('CGFLoad');
	let createGroupForm = document.getElementById('createGroupForm');

	if (form && CGFLoad && CGFLoad) {
		if (value) {
			form.classList.remove('hidden');
			try {
				resetListGroup();
				verifToCreate();
				await takemyinfoforYes();
				CGFLoad.classList.add('hidden');
				createGroupForm.classList.remove('hidden');
			} catch (e) {

			}
		} else {
			form .classList.add('hidden');
			CGFLoad.classList.remove('hidden');
			createGroupForm.classList.add('hidden');
		}
	}
}

function verifToCreate() {
	const button = document.getElementById('CGFcreate');
	if (button) {
		try {
			if (create_group_user_list.length < 2)
				throw new Error('error');

			let cgfName = document.getElementById('cgfName');
			if (cgfName && cgfName.value.length < 2)
				throw new Error('error');

			let cgfInputPicture = document.getElementById('cgfInputPicture');
			if (cgfInputPicture && cgfInputPicture.value.length < 2)
				throw new Error('error');

			button.classList.remove('createDisable');
		} catch (e){
			button.classList.add('createDisable');
		}
	}
}

function resetListGroup() {
	while (create_group_user_list.length > 0) {
		create_group_user_list.pop();
	}

	let cgfName = document.getElementById('cgfName');
	if (cgfName) {cgfName.value = '';};

	let cgfInputPicture = document.getElementById('cgfInputPicture');
	if (cgfInputPicture) {cgfInputPicture.value = '';};

	let cgfMembers = document.getElementById('cgfMembers');
	if (cgfMembers) {cgfMembers.innerHTML = '';};
}

async function takemyinfoforYes() {
	try {
		const {data} = await axios.get('https://' + window.location.hostname + ':' + window.location.port + '/api/social/user_info_profil_me',
		{
			withCredentials: true,
		});

		if (data && data.success) {
			create_group_user_list.push(data.profil.user_id);

			let person = document.createElement('div');
			person.classList.add('cgfPerson');
			person.id = 'cgfPerson' + data.profil.user_id;

			let personImg = document.createElement('img');
			personImg.classList.add('cgfPersonImg');
			personImg.src = data.profil.picture;

			let personName = document.createElement('span');
			personName.classList.add('cgfPersonName');
			personName.innerText = data.profil.user_id;

			person.appendChild(personImg);
			person.appendChild(personName);

			let cgfMembers = document.getElementById('cgfMembers');
			if (cgfMembers) {cgfMembers.appendChild(person);};

			let CGFcreate = document.getElementById('CGFcreate');
			if (CGFcreate) {CGFcreate.disabled = true;};

			return true;
		} else {
			if (data && data.message) {showNotificationError(data.message);};
			return false;
		}
	} catch (error) {
		showNotificationError("Error while searching user infos");
		return false;
	}
}

function addOnePersonGroupListWait(imgUrl, name) {
	let person = document.createElement('div');
	person.classList.add('cgfPerson');
	person.id = 'cgfPerson' + name;

	let personImg = document.createElement('img');
	personImg.classList.add('cgfPersonImg');
	personImg.src = imgUrl;

	let personName = document.createElement('span');
	personName.classList.add('cgfPersonName');
	personName.innerText = name;

	let personButton = document.createElement('button');
	personButton.classList.add('cgfPersonRemove');
	personButton.innerText = 'remove';

	personButton.onclick = () => {
		let cgfPerson = document.getElementById('cgfPerson' + name);
		if (cgfPerson) {cgfPerson.remove();};
		const indexToRemove = create_group_user_list.findIndex(element => element === name);

		if (indexToRemove !== -1) {
			create_group_user_list.splice(indexToRemove, 1);
		}
		verifToCreate();
	}

	person.appendChild(personImg);
	person.appendChild(personName);
	person.appendChild(personButton);

	let cgfMembers = document.getElementById('cgfMembers');
	if (cgfMembers) {cgfMembers.appendChild(person);};

	verifToCreate();
}

async function toggleCreateGroupFormInvite (value) {
	const form = document.getElementById('createGroupInviteForm');
	let createGroupInviteLoader = document.getElementById('createGroupInviteLoader');
	let CGFInviteForm = document.getElementById('CGFInviteForm');
	if (form && createGroupInviteLoader && CGFInviteForm) {
		if (value) {
			form.classList.remove('hidden');
			try {
				await searchPeopleInviteGroup('');
				createGroupInviteLoader.classList.add('hidden');
				CGFInviteForm.classList.remove('hidden');
			} catch (e) {

			}
		} else {
			form .classList.add('hidden');
			createGroupInviteLoader.classList.remove('hidden');
			CGFInviteForm.classList.add('hidden');
		}
	}
}

async function searchPeopleInviteGroup(prompt) {
	let CGFInviteFormBody = document.getElementById('CGFInviteFormBody');
	if (CGFInviteFormBody) {CGFInviteFormBody.innerHTML = '<div class="insearchpeopleload" id="insearchpeopleload"><div class="lds-ring"><div></div><div></div><div></div><div></div></div></div>';};
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
				CGFInviteFormBody.innerHTML = '';
				for (let i = 0; i < data.List.length; i++) {
					addOnePersonGroupSearchList(data.List[i].picture, data.List[i].user_id);
				}

			} else {
				if (data && data.message) {showNotificationError(data.message);};
			}
		};

	} catch (error) {
		showNotificationError("Error while searching people to invite");
	}
}

function addOnePersonGroupSearchList(imgUrl, name) {
	let person = document.createElement('div');
	person.classList.add('personToGroupInvite');
	person.id = 'searchPersonGroup' + name;

	let personImg = document.createElement('img');
	personImg.src = imgUrl;

	let personName = document.createElement('span');
	personName.innerText = name;

	person.appendChild(personImg);
	person.appendChild(personName);

	if (create_group_user_list.find((element) => {
		return element === name;
	}) === undefined) {
		let personButton = document.createElement('button');
		personButton.innerText = 'add';

		personButton.onclick = () => {
			create_group_user_list.push(name);
			addOnePersonGroupListWait(imgUrl, name);
			toggleCreateGroupFormInvite(false);
			verifToCreate();
		}

		person.appendChild(personButton);
	}

	let CGFInviteFormBody = document.getElementById('CGFInviteFormBody');
	if (CGFInviteFormBody) {CGFInviteFormBody.appendChild(person);};
}

document.addEventListener('mousemove', function (event) {
	posX = event.clientX;
	posY = event.clientY;
});

function is_number(string) {
    return /^\d+$/.test(string);
}

export async function receiveNewGroupPictureWebsocket(data, Me_User) {
	if (data.recipient == get_recipient() && window.location.hash == pageStatus.DashboardSocialMessages) {
		let GSHImg = document.getElementById('GSHImg');
		if (GSHImg) {GSHImg.src = data.newPic;};

		let NGPimg = document.getElementById('NGPimg' + data.id);
		if (NGPimg) {NGPimg.src = data.newPic;};
	}
	if (window.location.hash == pageStatus.DashboardSocial || window.location.hash == pageStatus.DashboardSocialMessages || window.location.hash == pageStatus.DashboardSocialContacts
		|| window.location.hash.startsWith(pageStatus.DashboardSocialProfil) || window.location.hash.startsWith(pageStatus.DashboardSocialGameDetails)) {
		MakeLeftGroup();
	}
}

export async function receiveILeaveGroupWebsocket(data, Me_User) {
	if (window.location.hash == pageStatus.DashboardSocial || window.location.hash == pageStatus.DashboardSocialMessages || window.location.hash == pageStatus.DashboardSocialContacts
		|| window.location.hash.startsWith(pageStatus.DashboardSocialProfil) || window.location.hash.startsWith(pageStatus.DashboardSocialGameDetails)) {
		MakeLeftGroup();
	}
}

export async function receiveGroupSizeChangedWebsocket(data, Me_User) {
	if (data.recipient == get_recipient() && window.location.hash == pageStatus.DashboardSocialMessages) {
		refreshGroupMembers();
	}
	if (window.location.hash == pageStatus.DashboardSocial || window.location.hash == pageStatus.DashboardSocialMessages || window.location.hash == pageStatus.DashboardSocialContacts
		|| window.location.hash.startsWith(pageStatus.DashboardSocialProfil) || window.location.hash.startsWith(pageStatus.DashboardSocialGameDetails)) {
		MakeLeftGroup();
	}
}

export function formatMessageDate(created_at) {
    const date = new Date(created_at);
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();

    return `${hours}:${minutes}:${seconds} ${day}/${month}/${year}`;
}

export async function MakeLeftGroup() {
	try {
		const csrfToken = await getCSRFToken();

		if (csrfToken) {
			const response = await axios.get('https://' + window.location.hostname + ':' + window.location.port + '/api/social/get_left_group', {
				headers: {
					'Content-Type': 'application/json',
					'X-CSRFToken': csrfToken,
				},
				withCredentials: true,
			});

			var data = response.data;
			if (data && data.success) {
				var leftGroupList = document.getElementById('navGroup');

				if (leftGroupList) {
					var children = leftGroupList.children
					if (children.length != 0) {
						let noconvgroup = document.getElementById('noconvgroup');
						if (noconvgroup) {
							for (let i = 0; i < children.length; i++) {
								if (children[i] != noconvgroup) {
									leftGroupList.removeChild(children[i]);
									i--;
								}
							}
						}
					}

					let noconvgroup = document.getElementById('noconvgroup');
					if (noconvgroup) {
						if (data.List.length > 0) {
							noconvgroup.classList.add("hidden");
							for (let i = 0; i < data.List.length; i++) {

								let div = createLeftGroup(data.List[i])
								leftGroupList.prepend(div)
							}
						} else {
							noconvgroup.classList.remove("hidden");
						}
					}
				}

			} else {
				if (data && data.message) {showNotificationError(data.message);};
			}
		};

	} catch (error) {
		showNotificationError("Error while recovering group list");
		throw error;
	}
}

function createLeftGroup(data) {
	var div1 = document.createElement('div');
	div1.classList.add("NGp");

	var div2 = document.createElement('div');
	div2.classList.add("NGPInfo");

	var img = document.createElement('img');
	img.classList.add("NGPimg");
	img.id = 'NGPimg' + data.group_id;
	img.src = data.picture;

	div2.appendChild(img);

	var div3 = document.createElement('div');
	div3.classList.add("NGPu_id");
	div3.id = 'NGPu_id' + data.group_id;

	div3.innerText = data.group_name;

	div2.appendChild(div3);

	div1.appendChild(div2);

	var div4 = document.createElement('div');
	div4.classList.add("NGPmore");

	var span = document.createElement('span');
	span.classList.add("material-symbols-outlined");
	span.innerText = "send";

	div4.appendChild(span);

	div1.appendChild(div4);

	div4.addEventListener('click', (event) => {
		openChat(data.group_id, true);
	});

	return div1
}

export function createLeftContact(data) {
	var div1 = document.createElement('div');
	div1.classList.add("NCp");
	div1.id = ('NPC_data_user_id_is_' + data.user_id);

	var div2 = document.createElement('div');
	div2.classList.add("NPCInfo");

	var img = document.createElement('img');
	img.classList.add("NCPimg");
	img.src = data.picture;

	div2.appendChild(img);

	var div3 = document.createElement('div');
	div3.classList.add("NPCu_id");
	div3.innerText = data.user_id;

	div2.appendChild(div3);

	div1.appendChild(div2);

	var div4 = document.createElement('div');
	div4.classList.add("NPCmore");
	div4.id = "NPCmore"

	var span = document.createElement('span');
	span.classList.add("material-symbols-outlined");
	span.innerText = "more_vert";

	div4.appendChild(span);

	div1.appendChild(div4);

	div4.addEventListener('click', (event) => {
		apearMoreContactMenu(data.user_id);
	});

	return div1
}

async function apearMoreContactMenu(user_id) {
	const more = document.getElementById('more');
	if (!more) {return ;}

	const windowHeight = window.innerHeight;
	more.style.left = posX + 'px';
	more.style.top = Math.min(posY, windowHeight - more.clientHeight) + 'px';
	set_more_recipient(user_id);

	more.classList.remove('hidden');

	document.addEventListener('mouseup', handleClickMore2);
}

const handleClickMore = (event) => {
	const more = document.getElementById('more');
	
	if (more) {
		if (!event.target.closest('.NPCmore')) {
			more.classList.add('hidden');
			set_more_recipient('none');
			document.removeEventListener('click', handleClickMore);
		}
	}
};

const handleClickMore2 = () => {
	document.removeEventListener('mouseup', handleClickMore2);
	document.addEventListener('click', handleClickMore);
}

async function refreshGroupMembers() {
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
				let GSHnbmiNB = document.getElementById('GSHnbmiNB');
				if (GSHnbmiNB) {GSHnbmiNB.innerText = data.groupMemberNumber + ' members';};

				let GSHnbmiNB2 = document.getElementById('GSHnbmiNB2');
				if (GSHnbmiNB2) {GSHnbmiNB2.innerText = data.groupMemberNumber + ' members';};

				let GSmembers = document.getElementById('GSmembers');
				if (GSmembers) {GSmembers.innerHTML = '';};
				data.members.forEach(user => {
					createGroupUserListOne(user.user_id, user.pseudo, user.picture, user.hasPower);
				});

			} else {
				if (data && data.message) {showNotificationError(data.message);};
			}
		};

	} catch (error) {
		showNotificationError("Error while recovering group chat profil");
	}
}

export function createGroupUserListOne(userId, userPseudoText, userPicSrc, hasPower) {
	const panel = document.getElementById('GSmembers');

	if (panel) { 
		const box = document.createElement('div');
		box.classList.add('GSmembersProfil');
		box.id = 'GSmembersProfil' + userId;

		const userImg = document.createElement('img');
		userImg.classList.add('GSMPimg');
		userImg.src = userPicSrc;

		const userPseudo = document.createElement('div');
		userPseudo.classList.add('GSMPuid');
		userPseudo.innerText = userPseudoText;

		const userButton = document.createElement('div');
		userButton.classList.add('GSMPmore');

		const userButtonIcon = document.createElement('div');
		userButtonIcon.classList.add('GSMPmoreIcon');
		
		const userButtonIcon_ = document.createElement('span');
		userButtonIcon_.classList.add('material-symbols-outlined');
		userButtonIcon_.innerText = 'more_horiz';

		userButtonIcon.appendChild(userButtonIcon_);
		userButton.appendChild(userButtonIcon);
		userButton.onclick = () => {
			let GSMPmorePanelBox = document.getElementById('GSMPmorePanelBox' + userId);
			if (GSMPmorePanelBox) {GSMPmorePanelBox.classList.remove('hidden');};
		}

		const usermorepanelBox = document.createElement('div');
		usermorepanelBox.classList.add('GSMPmorePanelBox');
		usermorepanelBox.classList.add('hidden');
		usermorepanelBox.id = 'GSMPmorePanelBox' + userId;

		const usermorepanel = document.createElement('div');
		usermorepanel.classList.add('GSMPmorePanel');

		const profileButton = document.createElement('div');
		profileButton.classList.add('GSMPmoreButton');
		profileButton.classList.add('GSMPmoreProfile');
		profileButton.innerText = 'Profile';

		profileButton.onclick = () => {
			set_recipient('');
			set_isRecipientGroup(false);
			see_profil(userId);
		}

		const chatButton = document.createElement('div');
		chatButton.classList.add('GSMPmoreButton');
		chatButton.classList.add('GSMPmoreChat');
		chatButton.innerText = 'Chat';

		chatButton.onclick = () => {
			openChat(userId, false);
		}

		const kickButton = document.createElement('div');
		kickButton.classList.add('GSMPmoreButton');
		kickButton.classList.add('GSMPmoreKick');
		kickButton.innerText = 'Kick';

		kickButton.onclick = async () => {
			try {		
				const csrfToken = await getCSRFToken();
		
				if (csrfToken) {
					const {data} = await axios.post('https://' + window.location.hostname + ':' + window.location.port + '/api/social/group/removeUser', {
						groupId: get_recipient(),
						user_remove_id: userId,
					}, {
						headers: {
							'Content-Type': 'application/json',
							'X-CSRFToken': csrfToken,
						},
						withCredentials: true,
					});
			
					if (data && data.success) {
						if (socket && socket.readyState === WebSocket.OPEN) {
							socket.send(JSON.stringify({'recipient': get_recipient() ,'event_type': "refresh_user_group", 'userRemoved': userId}));
						} else {
							showNotificationError("Error with Websocket");
						}
					} else {
						if (data && data.message) {showNotificationError(data.message);};
						return ;
					}
				} else {
					return ;
				};

			} catch (error) {
				showNotificationError("Error while kicking user");
				return ;
			}
		}

		const backButton = document.createElement('div');
		backButton.classList.add('GSMPmoreButton');
		backButton.classList.add('GSMPmoreBack');
		backButton.innerText = 'back';

		backButton.onclick = () => {
			let GSMPmorePanelBox = document.getElementById('GSMPmorePanelBox' + userId);
			if (GSMPmorePanelBox) {GSMPmorePanelBox.classList.add('hidden');};
		}
		
		if (me_user_id != userId) {usermorepanel.appendChild(profileButton);} else {profileButton.remove();}
		if (me_user_id != userId) {usermorepanel.appendChild(chatButton);} else {chatButton.remove();}
		if (hasPower === true) {usermorepanel.appendChild(kickButton);} else {kickButton.remove();}
		usermorepanel.appendChild(backButton);
		usermorepanelBox.appendChild(usermorepanel);

		box.appendChild(userImg);
		box.appendChild(userPseudo);
		box.appendChild(userButton);
		box.appendChild(usermorepanelBox);
		panel.appendChild(box);
	};
}

export async function openChat(id, isGroup) {
	if (window.location.hash === pageStatus.DashboardSocialMessages) {
		if (module_messages) {
			module_messages.UnloadPage()
			set_isRecipientGroup(isGroup);
			set_recipient(id);
			module_messages.LoadPage()
		}
	}
	else {
		set_isRecipientGroup(isGroup);
		set_recipient(id);
		window.location.hash = pageStatus.DashboardSocialMessages;
	}
}

export async function receiveFriendSent(data, user_id) {
	if (data.sender == user_id) {
		showNotification("You sent a friend request to " , data.recipient, "", "", "");

		let Acceptfriend = document.getElementById('Acceptfriend');
		if (Acceptfriend) {Acceptfriend.classList.add('hidden');}
		
		let Afriend = document.getElementById('Afriend');
		if (Afriend) {Afriend.classList.add('hidden');};

		let Rfriend = document.getElementById('Rfriend');
		if (Rfriend) {Rfriend.classList.add('hidden');};

		let Sentfriend = document.getElementById('Sentfriend');
		if (Sentfriend) {Sentfriend.classList.remove('hidden');};
	}
	else {
		showNotification("New friend request from " , data.sender, "", "Accept", sendAddFriend, data.sender);
		if (data.sender == profil_to_check) {

			let Acceptfriend = document.getElementById('Acceptfriend');
			if (Acceptfriend) {Acceptfriend.classList.remove('hidden');};

			let Afriend = document.getElementById('Afriend');
			if (Afriend) {Afriend.classList.add('hidden');};

			let Rfriend = document.getElementById('Rfriend');
			if (Rfriend) {Rfriend.classList.add('hidden');};

			let Sentfriend = document.getElementById('Sentfriend');
			if (Sentfriend) {Sentfriend.classList.add('hidden');};
		}
	}
}

export async function receiveFriendAccepted(data, user_id) {
	if (data.sender == user_id) {
		showNotification("You are now friends with " , data.recipient, "", "", "");
		if (window.location.hash.startsWith(pageStatus.DashboardSocialProfil)) {

			let Acceptfriend = document.getElementById('Acceptfriend');
			if (Acceptfriend) {Acceptfriend.classList.add('hidden');};

			let Afriend = document.getElementById('Afriend');
			if (Afriend) {Afriend.classList.add('hidden');};

			let Rfriend = document.getElementById('Rfriend');
			if (Rfriend) {Rfriend.classList.remove('hidden');};

			let Sentfriend = document.getElementById('Sentfriend');
			if (Sentfriend) {Sentfriend.classList.add('hidden');};
		} else if (window.location.hash == pageStatus.DashboardSocial || window.location.hash == pageStatus.DashboardSocialContacts) {

			let profil = document.getElementById('profil' + data.recipient);
			if (profil) {profil.remove();};
		}
	}
	else {
		showNotification("Friend request accepted by ", data.sender, "", "", "", "");
		if (window.location.hash.startsWith(pageStatus.DashboardSocialProfil)) {
			if (data.sender == profil_to_check) {

				let Acceptfriend = document.getElementById('Acceptfriend');
				if (Acceptfriend) {Acceptfriend.classList.add('hidden');};

				let Afriend = document.getElementById('Afriend');
				if (Afriend) {Afriend.classList.add('hidden');};

				let Rfriend = document.getElementById('Rfriend');
				if (Rfriend) {Rfriend.classList.remove('hidden');};

				let Sentfriend = document.getElementById('Sentfriend');
				if (Sentfriend) {Sentfriend.classList.add('hidden');};
			}
		} else if (window.location.hash == pageStatus.DashboardSocial || window.location.hash == pageStatus.DashboardSocialContacts) {
			
			let profil = document.getElementById('profil' + data.recipient);
			if (profil) {profil.remove();};
		}
	}
}

export async function receiveFriendAlreadySent(data, user_id) {
	if (data.sender == user_id) {
		showNotification("You already sent a friend request to " , data.recipient, "", "", "");
	}
}

export async function receiveFriendBlocked(data, user_id) {
	if (data.sender == user_id) {
		showNotification("This contact has been blocked by you or " , data.recipient, "", "", "");
	}
}

export async function receiveUnFriendSent(data, user_id) {
	if (data.sender == user_id) {
		showNotification("You are no longer friend with " , data.recipient, "", "", "");

		let Acceptfriend = document.getElementById('Acceptfriend');
		if (Acceptfriend) {Acceptfriend.classList.add('hidden');}
		
		let Afriend = document.getElementById('Afriend');
		if (Afriend) {Afriend.classList.remove('hidden');};

		let Rfriend = document.getElementById('Rfriend');
		if (Rfriend) {Rfriend.classList.add('hidden');};

		let Sentfriend = document.getElementById('Sentfriend');
		if (Sentfriend) {Sentfriend.classList.add('hidden');};
	}
	else {
		showNotification("You are no longer friend with " , data.sender, "", "", "");
		if (data.sender == profil_to_check && window.location.hash.startsWith(pageStatus.DashboardSocialProfil)) {

			let Acceptfriend = document.getElementById('Acceptfriend');
			if (Acceptfriend) {Acceptfriend.classList.add('hidden');}
			
			let Afriend = document.getElementById('Afriend');
			if (Afriend) {Afriend.classList.remove('hidden');};
	
			let Rfriend = document.getElementById('Rfriend');
			if (Rfriend) {Rfriend.classList.add('hidden');};
	
			let Sentfriend = document.getElementById('Sentfriend');
			if (Sentfriend) {Sentfriend.classList.add('hidden');};
		}
	}
}

export async function receiveUnFriendCancelled(data, user_id) {
	if (data.sender == user_id) {
		showNotification("Your friend request has been cancelled with " , data.recipient, "", "", "");

		let Acceptfriend = document.getElementById('Acceptfriend');
		if (Acceptfriend) {Acceptfriend.classList.add('hidden');}
		
		let Afriend = document.getElementById('Afriend');
		if (Afriend) {Afriend.classList.remove('hidden');};

		let Rfriend = document.getElementById('Rfriend');
		if (Rfriend) {Rfriend.classList.add('hidden');};

		let Sentfriend = document.getElementById('Sentfriend');
		if (Sentfriend) {Sentfriend.classList.add('hidden');};
	}
	else {
		showNotification("Cancelled friend request by ", data.sender, "", "", "");
		if (data.sender == profil_to_check && window.location.hash.startsWith(pageStatus.DashboardSocialProfil)) {

			let Acceptfriend = document.getElementById('Acceptfriend');
			if (Acceptfriend) {Acceptfriend.classList.add('hidden');}
			
			let Afriend = document.getElementById('Afriend');
			if (Afriend) {Afriend.classList.remove('hidden');};
	
			let Rfriend = document.getElementById('Rfriend');
			if (Rfriend) {Rfriend.classList.add('hidden');};
	
			let Sentfriend = document.getElementById('Sentfriend');
			if (Sentfriend) {Sentfriend.classList.add('hidden');};
		}
	}
}

export async function receiveUnFriendImpossible(data, user_id) {
	if (data.sender == user_id) {
		showNotification("You are not friend with " , data.recipient, "", "", "");
	}
}

export async function receiveBlockedDone(data, user_id) {
	if (data.sender == user_id) {
		showNotification("You successfully blocked " , data.recipient, "", "", "");
		if (window.location.hash == pageStatus.DashboardSocial || window.location.hash == pageStatus.DashboardSocialContacts) {

			let profil = document.getElementById('profil' + data.recipient);
			if (profil) {profil.classList.add("hidden");};
		} else {

			let Acceptfriend = document.getElementById('Acceptfriend');
			if (Acceptfriend) {Acceptfriend.classList.add('hidden');}
			
			let Afriend = document.getElementById('Afriend');
			if (Afriend) {Afriend.classList.add('hidden');};
	
			let Rfriend = document.getElementById('Rfriend');
			if (Rfriend) {Rfriend.classList.add('hidden');};
	
			let Sentfriend = document.getElementById('Sentfriend');
			if (Sentfriend) {Sentfriend.classList.add('hidden');};

			let BattleB = document.getElementById('BattleB');
			if (BattleB) {BattleB.classList.add('hidden');};

			let BlockB = document.getElementById('BlockB');
			if (BlockB) {BlockB.classList.add('hidden');};

			let UnblockB = document.getElementById('UnblockB');
			if (UnblockB) {UnblockB.classList.remove('hidden');};
		}
	}
	else {
		showNotification( "You have been blocked by " , data.sender, "", "", "");
		if (data.sender == profil_to_check && window.location.hash.startsWith(pageStatus.DashboardSocialProfil)) {

			let Acceptfriend = document.getElementById('Acceptfriend');
			if (Acceptfriend) {Acceptfriend.classList.add('hidden');}
			
			let Afriend = document.getElementById('Afriend');
			if (Afriend) {Afriend.classList.add('hidden');};
	
			let Rfriend = document.getElementById('Rfriend');
			if (Rfriend) {Rfriend.classList.add('hidden');};
	
			let Sentfriend = document.getElementById('Sentfriend');
			if (Sentfriend) {Sentfriend.classList.add('hidden');};

			let BattleB = document.getElementById('BattleB');
			if (BattleB) {BattleB.classList.add('hidden');};

			let BlockedBy = document.getElementById('BlockedBy');
			if (BlockedBy) {BlockedBy.classList.remove('hidden');}
		}
	}
	if (window.location.hash == pageStatus.DashboardSocial || window.location.hash == pageStatus.DashboardSocialMessages || window.location.hash == pageStatus.DashboardSocialContacts
		|| window.location.hash.startsWith(pageStatus.DashboardSocialProfil) || window.location.hash.startsWith(pageStatus.DashboardSocialGameDetails)) {
		if (data.sender == user_id) {
			const toDelete = document.getElementById('NPC_data_user_id_is_' + data.recipient);
			if (toDelete) {
				toDelete.remove();
			}
		}
	}
}

export async function receiveBlockedAlreadyDone(data, user_id) {
	if (data.sender == user_id) {
		showNotification("You have already blocked " , data.recipient, "", "", "");
	}
}

export async function receiveUnBlockedDone(data, user_id) {
	if (data.sender == user_id) {
		showNotification("Your successfully unblocked " , data.recipient, "", "", "");
		if (window.location.hash == pageStatus.DashboardSocial || window.location.hash == pageStatus.DashboardSocialContacts) {

			let profil = document.getElementById('profil' + data.recipient);
			if (profil) {profil.classList.add("hidden");};
		} else {

			let BlockB = document.getElementById('BlockB');
			if (BlockB) {BlockB.classList.remove('hidden');};

			let UnblockB = document.getElementById('UnblockB');
			if (UnblockB) {UnblockB.classList.add('hidden');};
		}
	}
	else {
		showNotification( "You have been unblocked by " , data.sender, "", "", "");
		if (data.sender == profil_to_check) {

			let BlockedBy = document.getElementById('BlockedBy');
			if (BlockedBy) {BlockedBy.classList.add('hidden');}
		}
	}
}

export async function receiveFullyUnBlockedDone(data, user_id) {
	if (data.sender == user_id) {
		showNotification("Your successfully unblocked " , data.recipient, "", "", "");
		if (window.location.hash == pageStatus.DashboardSocial || window.location.hash == pageStatus.DashboardSocialContacts) {

			let profil = document.getElementById('profil' + data.recipient);
			if (profil) {profil.classList.add("hidden");};
		} else {

			let BlockB = document.getElementById('BlockB');
			if (BlockB) {BlockB.classList.remove('hidden');};

			let UnblockB = document.getElementById('UnblockB');
			if (UnblockB) {UnblockB.classList.add('hidden');};

			let Afriend = document.getElementById('Afriend');
			if (Afriend) {Afriend.classList.remove('hidden');};

			let BattleB = document.getElementById('BattleB');
			if (BattleB) {BattleB.classList.remove('hidden');};
		}
	}
	else {
		showNotification( "You have been unblocked by " , data.sender, "", "", "");
		if (data.sender == profil_to_check && window.location.hash.startsWith(pageStatus.DashboardSocialProfil)) {
			
			let BlockedBy = document.getElementById('BlockedBy');
			if (BlockedBy) {BlockedBy.classList.add('hidden');}

			let Afriend = document.getElementById('Afriend');
			if (Afriend) {Afriend.classList.remove('hidden');};

			let BattleB = document.getElementById('BattleB');
			if (BattleB) {BattleB.classList.remove('hidden');};
		}
	}
}

export async function receiveUnBlockedImpossible(data, user_id) {
	if (data.sender == user_id) {
		showNotification("Can't unblock " + data.recipient, "", "", "");
	}
}

export async function receiveCreateTableSuccess(data, user_id) {
	if (data.sender == user_id) {
		showNotification("Battle request to a pong game sent to : ", data.opponent , " Mode : " + data.mode, "", "", "");
	}
	else {
		showNotification( "You have been invited to a pong game by ", data.sender, " Mode : " + data.mode, "Join Game", sendJoinTable, data.sender);
	}
}

export async function receiveCreateTableBlocked(data, user_id) {
	if (data.sender == user_id) {
		showNotification("This contact has been blocked by you or ", data.recipient , "", "", "");
	}
}

export async function receiveCreateTableAlreadyInGame(data, user_id) {
	if (data.sender == user_id) {
		showNotification("You are already in game", "", "", "");
	}
}

export async function receiveOpponentAlreadyInGame(data, user_id) {
	if (data.sender == user_id) {
		showNotification("Opponent is already in game", "", "", "");
	}
}

export async function receiveCreateTableExpires(data, user_id) {
	if (data.sender == user_id) {
		showNotification("Expiration of your pong game invitation to ", data.recipient, "", "", "");
	}
	else {
		showNotification("Expiration of the pong game invitation by ", data.sender, "", "", "");
	}
}

export async function receiveJoinTableSuccess(data, user_id) {
	if (data.sender == user_id) {
		showNotification("Successfully join the pong game of ", data.recipient, "", "", "");
	}
	else {
		showNotification("Succesfully joined in the pong game by ", data.sender, "", "", "");
	}
	window.location.hash = pageStatus.Game;
}

export async function receiveJoinTableBlocked(data, user_id) {
	if (data.sender == user_id) {
		showNotification("This contact has been blocked by you or ", data.recipient, "", "", "");
	}
}

export async function receiveJoinTableNotFound(data, user_id) {
	if (data.sender == user_id) {
		showNotification("Can't find the pong game of " , data.recipient, "", "", "");
	}
}

export async function receiveJoinTableAlreadyInGame(data, user_id) {
	if (data.sender == user_id) {
		showNotification("Opponent already in game", "", "", "");
	}
}

export async function receiveJoinTableYouAlreadyInGame(data, user_id) {
	if (data.sender == user_id) {
		showNotification("You are already in game", "", "", "");
	}
}

export async function sendBlockContact(profil_to_check) {
	if (socket && socket.readyState === WebSocket.OPEN) {
		socket.send(JSON.stringify({'recipient': profil_to_check, 'event_type': "contact_blocked"}));
	} else {
		showNotificationError("Error with Websocket");
	}
}

export async function sendCreateTable(opponent, mode) {
	if (socket && socket.readyState === WebSocket.OPEN) {
		socket.send(JSON.stringify({'recipient': opponent, 'mode': mode ,'event_type': "create_table"}));
	} else {
		showNotificationError("Error with Websocket");
	}
}

export async function sendUnBlockContact(profil_to_check) {
	if (socket && socket.readyState === WebSocket.OPEN) {
		socket.send(JSON.stringify({'recipient': profil_to_check, 'event_type': "contact_unblocked"}));
	} else {
		showNotificationError("Error with Websocket");
	}
}

async function sendJoinTable(opponent) {
	if (socket && socket.readyState === WebSocket.OPEN) {
		socket.send(JSON.stringify({'recipient': opponent, 'event_type': "join_table"}));
	} else {
		showNotificationError("Error with Websocket");
	}
}