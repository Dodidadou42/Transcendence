// **********************************************************************
// 				Profil Page
// **********************************************************************

class ErrorCode extends Error {
	constructor(code, message) {
	    super(message);
	    this.name = 'CustomError';
	    this.code = code;
	}
  }

import {pageStatus} from './Website.js';
import {GetStatus, UpdateStatus} from './Website.js';
import {getCSRFToken, showNotificationError} from './Website.js';
import {me_user_id, socket} from "./Website.js"

import {handleTitle} from './Dashboard.js';

import {add_history_to_profil} from '/Dashboard.js';

import {sleep} from './Dashboard.js';

let page = "";

let current_profil_history = 0;

export async function LoadPage() {
	const child = document.getElementById('child1_dashboard');
	if (!child) {return ;}
	if (page != "") {
		child.innerHTML = page;
		Page();
	} else {
		var cssLink = document.createElement('link');
		cssLink.rel = 'stylesheet';
		cssLink.href = './DProfil.css';
		document.head.appendChild(cssLink);
        cssLink.onload = function() {
            fetch('DProfil.html')
            .then(response => response.text())
            .then(html => {
                page = html;
                child.innerHTML = page;
				child.classList.remove("hidden")
				Page()
            });
        }
	}
	UpdateStatus(pageStatus.DashboardProfil);
	handleTitle('Profil');
	document.title = 'Dashboard Profil';
}

export function UnloadPage() {
	UpdateStatus("");

	let modif = document.getElementById('modif_dprofil');
	if (modif) {modif.removeEventListener('click', function(event) {});};

	let editBack = document.getElementById('editBack_dprofil');
	if (editBack) {editBack.removeEventListener('click', function(event) {});};

	let editPseudoInput = document.getElementById('editPseudoInput_dprofil');
	if (editPseudoInput) {editPseudoInput.removeEventListener('input', function(event) {});};

	let editDesc = document.getElementById('editDesc_dprofil');
	if (editDesc) {editDesc.removeEventListener('input', function(event) {});};

	let editDeleteAccountButton = document.getElementById('editDeleteAccountButton_dprofil');
	if (editDeleteAccountButton) {editDeleteAccountButton.removeEventListener('click', function(event) {});};

	let cancelDeleteAccount = document.getElementById('cancelDeleteAccount_dprofil');
	if (cancelDeleteAccount) {cancelDeleteAccount.removeEventListener('click', function(event) {});};

	let confirmDeleteAccount = document.getElementById('confirmDeleteAccount_dprofil');
	if (confirmDeleteAccount) {confirmDeleteAccount.removeEventListener('click', function(event) {});};

	let editSubmit = document.getElementById('editSubmit_dprofil');
	if (editSubmit) {editSubmit.removeEventListener('click', function(event) {});};

	let editImgButtonC = document.getElementById('editImgButtonC_dprofil');
	if (editImgButtonC) {editImgButtonC.removeEventListener('change', function(event) {});};

	let activateChangePassword = document.getElementById('activateChangePassword_dprofil');
	if (activateChangePassword) {activateChangePassword.removeEventListener('click', function(event) {});};

	let editPasswordPanelCross = document.getElementById('editPasswordPanelCross_dprofil');
	if (editPasswordPanelCross) {editPasswordPanelCross.removeEventListener('click', function(event) {});};

	let editPasswordSend = document.getElementById('editPasswordSend_dprofil');
	if (editPasswordSend) {editPasswordSend.removeEventListener('click', function(event) {});};

	let historyLoadMore = document.getElementById("historyLoadMore");
	if (historyLoadMore) {historyLoadMore.removeEventListener('click', function(event) {});};

	let activateA2FButton = document.getElementById('activateA2FButton_dprofil');
	if (activateA2FButton) {activateA2FButton.removeEventListener('click', function(event) {});};

	let desactivateA2FButton = document.getElementById('desactivateA2FButton_dprofil');
	if (desactivateA2FButton) {desactivateA2FButton.removeEventListener('click', function(event) {});};

	let activation_code = document.getElementById("activation-code_dprofil");
	if (activation_code) {activation_code.removeEventListener('input', function(event) {});};

	let activate_button = document.getElementById('activate-button_dprofil');
	if (activate_button) {activate_button.removeEventListener('click', function(event) {});};

	let desactivation_code = document.getElementById("desactivation-code_dprofil");
	if (desactivation_code) {desactivation_code.removeEventListener('input', function(event) {});};

	let desactivate_button = document.getElementById('desactivate-button_dprofil');
	if (desactivate_button) {desactivate_button.removeEventListener('click', function(event) {});};
}

let nbupdateAnimToPlay = 0;

async function Page() {
	let actualDesc = "";
	let actualpseudo = "";

	let desc = document.getElementById('desc_dprofil');
	if (desc) {actualDesc = desc.innerText;};

	let uid = document.getElementById('Uid_dprofil')
	if (uid) {actualpseudo.innerText;}

	getInfo();

	let modif = document.getElementById('modif_dprofil');
	if (modif) {
		modif.onclick = () => {
			let body_profil = document.getElementById('body_profil');
			let EditBody = document.getElementById('EditBody_dprofil');
			if (body_profil && EditBody) {
				body_profil.classList.add('hidden');
				EditBody.classList.remove('hidden');
			}
		}
	}

	document.getElementById('editBack_dprofil').onclick = () => {
		let body_profil = document.getElementById('body_profil');
		let EditBody = document.getElementById('EditBody_dprofil');
		
		if (body_profil && EditBody) {
			body_profil.classList.remove('hidden');
			EditBody.classList.add('hidden');

			let editDesc = document.getElementById('editDesc_dprofil');
			if (editDesc) {
				editDesc.value = actualDesc;
				let editDescInputCount = document.getElementById('editDescInputCount_dprofil');
				if (editDescInputCount) {editDescInputCount.innerText = `${editDesc.value.length}/200`;};
			}

			let editPseudoInput = document.getElementById('editPseudoInput_dprofil');
			if (editPseudoInput) {
				editPseudoInput.value = actualpseudo;
				let editPseudoInputCount = document.getElementById('editPseudoInputCount_dprofil');
				if (editPseudoInputCount) {editPseudoInputCount.innerText = `${editPseudoInput.value.length}/15`}
			}

			let activationA2F = document.getElementById('activationA2F_dprofil');
			if (activationA2F) {
				if (!activationA2F.classList.contains("hidden")) {

					let step_key = document.getElementById('step-key_dprofil');
					if (step_key) {step_key.innerText = "";};

					let qr_code = document.getElementById('qr-code_dprofil');
					if (qr_code) {qr_code.src = "";};

					let activation_code = document.getElementById('activation-code_dprofil');
					if (activation_code) {activation_code.value = "";};

					activationA2F.classList.add("hidden");

					let activateA2F = document.getElementById('activateA2F_dprofil');
					if (activateA2F) {activateA2F.classList.remove("hidden");};

					let activate_button = document.getElementById('activate-button_dprofil');
					if (activate_button) {
						activate_button.classList.add("activate-button-not-ok_dprofil");
						activate_button.classList.remove("activate-button-ok_dprofil");
					};
				}
			}

			let desactivationA2F = document.getElementById('desactivationA2F_dprofil');
			if (desactivationA2F) {
				if (!desactivationA2F.classList.contains("hidden")) {

					let desactivation_code = document.getElementById('desactivation-code_dprofil');
					if (desactivation_code) {desactivation_code.value = "";};

					desactivationA2F.classList.add("hidden");

					let desactivateA2F = document.getElementById('desactivateA2F_dprofil');
					if (desactivateA2F) {desactivateA2F.classList.remove("hidden");};

					let desactivate_button = document.getElementById('desactivate-button_dprofil');
					if (desactivate_button) {
						desactivate_button.classList.add("desactivate-button-not-ok_dprofil");
						desactivate_button.classList.remove("desactivate-button-ok_dprofil");
					};
				}
			}

			toggleActivatePassword(false);
		}
	}

	let editPseudoInput = document.getElementById('editPseudoInput_dprofil');
	if (editPseudoInput) {
		editPseudoInput.addEventListener('input', async (event) => {
			let editPseudoInputCount = document.getElementById('editPseudoInputCount_dprofil');
			let editPseudoInput = document.getElementById('editPseudoInput_dprofil');
			if (editPseudoInputCount && editPseudoInput) {editPseudoInputCount.innerText = `${editPseudoInput.value.length}/15`}
			CheckIfSubmitOkay()
		});
	}

	let editDesc = document.getElementById('editDesc_dprofil');
	if (editDesc) {
		editDesc.addEventListener('input', async (event) => {
			let editDescInputCount = document.getElementById('editDescInputCount_dprofil');
			let editDesc = document.getElementById('editDesc_dprofil');
			if (editDescInputCount && editDesc) {editDescInputCount.innerText = `${editDesc.value.length}/200`;};
			CheckIfSubmitOkay()
		});
	}

	let editDeleteAccountButton = document.getElementById('editDeleteAccountButton_dprofil');
	if (editDeleteAccountButton) {
		editDeleteAccountButton.addEventListener('click', (event) => {
			let deleteAccountPanel = document.getElementById('deleteAccountPanel_dprofil');
			if (deleteAccountPanel) {deleteAccountPanel.classList.remove('hidden');};
		});
	}

	let cancelDeleteAccount = document.getElementById('cancelDeleteAccount_dprofil');
	if (cancelDeleteAccount) {
		cancelDeleteAccount.addEventListener('click', (event) => {
			let deleteAccountPanel = document.getElementById('deleteAccountPanel_dprofil');
			if (deleteAccountPanel) {deleteAccountPanel.classList.add('hidden');};
		});
	}

	let confirmDeleteAccount = document.getElementById('confirmDeleteAccount_dprofil');
	if (confirmDeleteAccount) {
		confirmDeleteAccount.addEventListener('click', async (event) => {
			try {
				const {data} = await axios.get('https://' + window.location.hostname + ':' + window.location.port + '/api/sign/del/', {
					headers: {
						'Content-Type': 'application/json',
					},
					withCredentials: true,
				});
		
				if (data && data.success) {
					socket.close()
					window.location.hash = pageStatus.Home;
				}
				else {
					if (data && data.message) {showNotificationError(data.message);};
					let deleteAccountPanel = document.getElementById('deleteAccountPanel_dprofil');
					if (deleteAccountPanel) {deleteAccountPanel.classList.add('hidden');};
				}
			} catch (error) {
				showNotificationError("Error while deleting account");
			}
		});
	}

	async function CheckIfSubmitOkay() {
		let editSubmit = document.getElementById('editSubmit_dprofil');
		let editPseudoInput = document.getElementById('editPseudoInput_dprofil');
		let editDesc = document.getElementById('editDesc_dprofil');
		if (editDesc && editPseudoInput && editSubmit) {
			const pseudoI = editPseudoInput.value;
			const descI = editDesc.value;

			try {
				if (pseudoI.length < 4) {
					throw new Error('Pseudo length too short');
				}
				if (pseudoI.includes(' ')) {throw new Error('Space not autorize');}
				if (pseudoI.includes('@')) {throw new Error('char not autorize');}
				if (pseudoI.includes('#')) {throw new Error('char not autorize');}
				if (pseudoI.includes('*')) {throw new Error('char not autorize');}
				if (pseudoI.includes('>')) {throw new Error('char not autorize');}
				if (pseudoI.includes('<')) {throw new Error('char not autorize');}
				if (pseudoI.includes('`')) {throw new Error('char not autorize');}
				if (pseudoI.includes('&')) {throw new Error('char not autorize');}
				if (pseudoI.includes(',')) {throw new Error('char not autorize');}
				if (pseudoI.includes('+')) {throw new Error('char not autorize');}
				if (pseudoI == actualpseudo && descI == actualDesc) {
					throw new Error('No change');
				}

				editSubmit.classList.remove('editSubmitUnactive_dprofil');
			} catch (e) {
				editSubmit.classList.add('editSubmitUnactive_dprofil');
			}
		}
	}

	let editSubmit = document.getElementById('editSubmit_dprofil');
	if (editSubmit) {
		editSubmit.onclick = async () => {
			let editSubmit = document.getElementById('editSubmit_dprofil');
			let editPseudoInput = document.getElementById('editPseudoInput_dprofil');
			let editDesc = document.getElementById('editDesc_dprofil');
			if (editSubmit && editDesc && editPseudoInput) {
				try {
					editSubmit.classList.add('editSubmitUnactive_dprofil');
					const csrfToken = await getCSRFToken();

					if (csrfToken) {
						const newpseudo = editPseudoInput.value;
						const newdesc = editDesc.value;
						const {data} = await axios.post('https://' + window.location.hostname + ':' + window.location.port + '/api/social/postInfo', {
								'newPseudo': newpseudo,
								'newDesc': newdesc,
							},
							{
							headers: {
								'Content-Type': 'application/json',
								'X-CSRFToken': csrfToken,
							},
							withCredentials: true,
						});

						if (data && data.success) {
							getInfo();
							PlayUpdateNotifAnim();
							actualDesc = newdesc;
							actualpseudo = newpseudo;
						} else {
							if (data && data.message) {showNotificationError(data.message);};
							editSubmit.classList.remove('editSubmitUnactive_dprofil');
						}
					};
				
				} catch (e) {
					showNotificationError("Error while posting new user infos");
					editSubmit.classList.remove('editSubmitUnactive_dprofil');
				}
			}
		}
	}

	let editImgButtonC = document.getElementById('editImgButtonC_dprofil');
	if (editImgButtonC) {
		editImgButtonC.addEventListener('change', async (event) => {
			let editImgButtonC = document.getElementById('editImgButtonC_dprofil');
			let imgLoading = document.getElementById('imgLoading_dprofil');
			let editImg = document.getElementById('editImg_dprofil');
			if (editImgButtonC && imgLoading && editImg) {
				try {
					const csrfToken = await getCSRFToken();

					if (csrfToken) {
						const value = editImgButtonC.files[0];
						const reader = new FileReader();

						reader.onload = async function(e) {
							let editImgButtonC = document.getElementById('editImgButtonC_dprofil');
							let imgLoading = document.getElementById('imgLoading_dprofil');
							let editImg = document.getElementById('editImg_dprofil');
							if (editImgButtonC && imgLoading && editImg) {
			
								editSubmit.classList.add('editSubmitUnactive_dprofil');
								imgLoading.classList.remove('hidden');
								editImg.classList.add('hidden');
								try {
									const {data} = await axios.post('https://' + window.location.hostname + ':' + window.location.port + '/api/social/postPicture', {
										'newPic': e.target.result,
									},
									{
										headers: {
											'Content-Type': 'application/json',
											'X-CSRFToken': csrfToken,
										},
										withCredentials: true,
									});

									if (data && data.success) {
										getInfo();
										editImg.src = e.target.result;
										PlayUpdateNotifAnim();
									} else {
										if (data && data.message) {showNotificationError(data.message);};
										editSubmit.classList.remove('editSubmitUnactive_dprofil');
									}

									imgLoading.classList.add('hidden');
									editImg.classList.remove('hidden');
								} catch (e) {
									showNotificationError("Error while posting new picture");
									imgLoading.classList.add('hidden');
									editImg.classList.remove('hidden');
									editSubmit.classList.remove('editSubmitUnactive_dprofil');
								}
							}
						};
						reader.readAsDataURL(value);
					};
				} catch (e) {
					showNotificationError("Error while posting new picture");
					imgLoading.classList.add('hidden');
					editImg.classList.remove('hidden');
					editSubmit.classList.remove('editSubmitUnactive_dprofil');
				}
			}
		})
	}

	async function getInfo() {
		try {

			const csrfToken = await getCSRFToken();

			if (csrfToken) {
				const {data} = await axios.get('https://' + window.location.hostname + ':' + window.location.port + '/api/social/user_info_profil_me', {
					headers: {
						'Content-Type': 'application/json',
						'X-CSRFToken': csrfToken,
					},
					withCredentials: true,
				});

				if (data && data.success) {

					let userImg = document.getElementById('userImg_dprofil');
					if (userImg) {userImg.src = data.profil.picture;};

					let Uid = document.getElementById('Uid_dprofil');
					if (Uid) {Uid.innerText = data.profil.user_id;};

					let pseudo = document.getElementById('pseudo_dprofil');
					if (pseudo) {pseudo.innerText = data.profil.pseudo;};
					
					let desc = document.getElementById('desc_dprofil');
					if (desc) {desc.innerText = data.profil.desc;};

					let vicvalue = document.getElementById('vicvalue_dprofil');
					if (vicvalue) {vicvalue.innerText = data.profil.victory;};

					if (data.profil.gamePlayed == 0) {
						var ratio_kd = 1
					} else {
						var ratio_kd = data.profil.victory / data.profil.gamePlayed
					}
					let roundedNumber = Math.round(ratio_kd * 1000) / 1000;
					let formattedNumber = roundedNumber.toFixed(3);

					let ratioValue = document.getElementById('ratioValue_dprofil');
					if (ratioValue) {ratioValue.innerText = formattedNumber;};

					let gpValue = document.getElementById('gpValue_dprofil');
					if (gpValue) {gpValue.innerText = data.profil.gamePlayed;};

					let mmrValue = document.getElementById('mmrValue_dprofil');
					if (mmrValue) {mmrValue.innerText = data.profil.mmr1;};

					const userLevel = data.profil.level;

					let lvltext = document.getElementById('lvltext_dprofil');
					if (lvltext) {lvltext.innerText = 'Level : ' + ((userLevel - (userLevel % 100)) / 100);};

					let lvl = document.getElementById('lvl_dprofil');
					if (lvl) {lvl.style.width = `${(userLevel % 100)}%`;};

					let editImg = document.getElementById('editImg_dprofil');
					if (editImg) {editImg.src = data.profil.picture;}

					if (editPseudoInput) {editPseudoInput.value = data.profil.pseudo;};
					if (editDesc) {editDesc.value = data.profil.desc;};

					let editPseudoInputCount = document.getElementById('editPseudoInputCount_dprofil');
					if (editPseudoInputCount) {editPseudoInputCount.innerText = `${editPseudoInput.value.length}/15`}

					let editDescInputCount = document.getElementById('editDescInputCount_dprofil');
					if (editDescInputCount) {editDescInputCount.innerText = `${editDesc.value.length}/200`;};

					actualDesc = data.profil.desc;
					actualpseudo = data.profil.pseudo;
				} else {
					if (data && data.message) {showNotificationError(data.message);};
				}
			};
			
		} catch (error) {
			showNotificationError("Error while searching user infos");
		}
	}

	let activateChangePassword = document.getElementById('activateChangePassword_dprofil');
	if (activateChangePassword) {
		activateChangePassword.onclick = () => {
			toggleActivatePassword(true);
		}
	}

	let editPasswordPanelCross = document.getElementById('editPasswordPanelCross_dprofil');
	if (editPasswordPanelCross) {
		editPasswordPanelCross.onclick = () => {
			toggleActivatePassword(false);
		}
	}
	
	function hasNDigits(str, n) {
		const matches = str.match(/\d/g);
		return matches !== null && matches.length >= n;
	}

	let editPasswordSend = document.getElementById('editPasswordSend_dprofil');
	if (editPasswordSend) {
		editPasswordSend.onclick = async () => {
			let Current = document.getElementById('editPasswordCurrent_dprofil');
			let New = document.getElementById('editPasswordNew_dprofil');
			let Confirm = document.getElementById('editPasswordNewRepeat_dprofil');

			let currentPass = document.getElementById('currentPass_dprofil');
			let newPass = document.getElementById('newPass_dprofil');
			let confirmPass = document.getElementById('confirmPass_dprofil');

			if (Current && New && Confirm && currentPass && newPass && confirmPass) {

				const vCurrent = currentPass.value;
				const vNew = newPass.value;
				const vConfirm = confirmPass.value;

				try {
					if (vCurrent.length === 0) {throw new ErrorCode(1, 'Current password empty');}
					if (vNew.length === 0) {throw new ErrorCode(2, 'New password empty');}
					if (vConfirm.length === 0) {throw new ErrorCode(3, 'Password confirm empty');}
					if (vCurrent.includes(' ')) {throw new ErrorCode(1, 'Current password can\'t contain a space');}
					if (vNew.includes(' ')) {throw new ErrorCode(2, 'New password can\'t contain a space');}
					if (vNew.length <= 6) {throw new ErrorCode(2, 'New password is too short');}
					if (/[A-Z]/.test(vNew) === false) {throw new ErrorCode(2, 'New password requires at least 1 uppercase letter');}
					if (/[a-z]/.test(vNew) === false) {throw new ErrorCode(2, 'New password requires at least 1 lowercase letter');}
					if (!hasNDigits(vNew, 2)) {throw new ErrorCode(2, 'New password requires at least 2 digits');}
					if (vConfirm != vNew) {throw new ErrorCode(3, 'Confirmation password does not match new passord');}
					if (vCurrent == vNew) {throw new ErrorCode(2, 'Cannot change for same password');}

				} catch (e) {
					if (e.code === 1) {
						Current.title = e.message;
						Current.classList.add('passwodInputBadInput_dprofil');
						const handleChange = () => {
							Current.classList.remove('passwodInputBadInput_dprofil');
							Current.removeEventListener('input', handleChange);
						}
						Current.addEventListener('input', handleChange);
					} else if (e.code === 2) {
						New.title = e.message;
						New.classList.add('passwodInputBadInput_dprofil');
						const handleChange = () => {
							New.classList.remove('passwodInputBadInput_dprofil');
							New.removeEventListener('input', handleChange);
						}
						New.addEventListener('input', handleChange);
					} else if (e.code === 3) {
						Confirm.title = e.message;
						Confirm.classList.add('passwodInputBadInput_dprofil');
						const handleChange = () => {
							Confirm.classList.remove('passwodInputBadInput_dprofil');
							Confirm.removeEventListener('input', handleChange);
						}
						Confirm.addEventListener('input', handleChange);
					} else {
						showNotificationError("Something wrong with your inputs")
					}
					return ;
				}

				try {
					const csrfToken = await getCSRFToken();

					if (csrfToken) {
						const {data} = await axios.post('https://' + window.location.hostname + ':' + window.location.port + '/api/sign/edit_password/', {
							password: vCurrent,
							new_password: vNew
						}, {
							headers: {
								'Content-Type': 'application/json',
								'X-CSRFToken': csrfToken,
							},
							withCredentials: true,
						});
				
						if (data && data.success) {
							currentPass.value = "";
							newPass.value = "";
							confirmPass.value = "";
							toggleActivatePassword(false);
							PlayUpdateNotifAnim();
						} else {
							if (data && data.message) {showNotificationError(data.message);};
						}
					};

				} catch (error) {
					showNotificationError("Error while editing password");
				}
			}
		}
	}

	current_profil_history = 0;

	await add_history_to_profil(me_user_id, 3, current_profil_history);
	current_profil_history += 3

	let historyLoadMore = document.getElementById("historyLoadMore");
	if (historyLoadMore) {
		historyLoadMore.onclick = async () => {
			await add_history_to_profil(me_user_id, 3, current_profil_history);
			current_profil_history += 3
		}
	}

	HandleA2F();
}

async function PlayUpdateNotifAnim() {
	nbupdateAnimToPlay++;
	let updateNotifBox = document.getElementById('updateNotifBox_dprofil');
	if (updateNotifBox) {
		updateNotifBox.classList.remove('updateNotifAnim_dprofil');
		updateNotifBox.classList.add('updateNotifAnim_dprofil');
		await sleep(2000);
		nbupdateAnimToPlay--;
		if (nbupdateAnimToPlay == 0) {updateNotifBox.classList.remove('updateNotifAnim_dprofil');};
	}
}

function toggleActivatePassword (activation) {
	const button = document.getElementById('activateChangePassword_dprofil');
	const panel = document.getElementById('editPasswordOut_dprofil');

	if (button && panel) {
		if (!activation){
			button.classList.remove('hidden');
			panel.classList.add('hidden');
		} else {
			button.classList.add('hidden');
			panel.classList.remove('hidden');
		}
	}
}

async function getA2FStatus() {
    try {
        const {data} = await axios.get('https://' + window.location.hostname + ':' + window.location.port + '/api/social/me/a2f_status', {
			withCredentials: true,
		});

		if (data && data.success) {
			return data.a2f_status;
		} else {
			if (data && data.message) {showNotificationError(data.message);};
			return false
		}
    } catch (error) {
		showNotificationError("Error while recovering 2FA Status");
		return 'unknown';
    }
}

async function HandleA2F() {
	const a2f_status = await getA2FStatus();

	let desactivateA2F = document.getElementById('desactivateA2F_dprofil');
	let activateA2F = document.getElementById('activateA2F_dprofil');

	if (desactivateA2F && activateA2F) {
		if (a2f_status == false) {
			desactivateA2F.classList.add("hidden");
		} else {
			activateA2F.classList.add("hidden");
		}
	}

	let activateA2FButton = document.getElementById('activateA2FButton_dprofil');
	if (activateA2FButton) {
		activateA2FButton.addEventListener('click', function() {
			ActivateButtonA2F()
		});
	}	

	let desactivateA2FButton = document.getElementById('desactivateA2FButton_dprofil');
	if (desactivateA2FButton) {
		desactivateA2FButton.addEventListener('click', function() {
			let desactivationA2F = document.getElementById('desactivationA2F_dprofil');
			if (desactivationA2F) {desactivationA2F.classList.remove("hidden");};
			let desactivateA2F = document.getElementById('desactivateA2F_dprofil');
			if (desactivateA2F) {desactivateA2F.classList.add("hidden");};
		});
	}

	let activation_code = document.getElementById("activation-code_dprofil");
	if (activation_code) {
		activation_code.addEventListener("input", function(event) {
			this.value = this.value.replace(/\D/g, '');

			let activate_button = document.getElementById('activate-button_dprofil');
			if (activate_button) {
				if (this.value.length == 6) {
					activate_button.classList.add("activate-button-ok_dprofil");
					activate_button.classList.remove("activate-button-not-ok_dprofil");
				}

				if (this.value.length < 6) {
					activate_button.classList.add("activate-button-not-ok_dprofil");
					activate_button.classList.remove("activate-button-ok_dprofil");
				}
			}

			if (this.value.length > 6) {
				this.value = this.value.slice(0, 6);
			}
		});
	}

	let activate_button = document.getElementById('activate-button_dprofil');
	if (activate_button) {
		activate_button.addEventListener('click', function() {
			let activation_code = document.getElementById("activation-code_dprofil");
			if (activation_code && activation_code.value.length == 6) {
				ActiveA2F(activation_code.value)
			}
		});
	}

	let desactivation_code = document.getElementById("desactivation-code_dprofil");
	if (desactivation_code) {
		desactivation_code.addEventListener("input", function(event) {
			this.value = this.value.replace(/\D/g, '');

			let desactivate_button = document.getElementById('desactivate-button_dprofil');
			if (desactivate_button) {
				if (this.value.length == 6) {
					desactivate_button.classList.add("desactivate-button-ok_dprofil");
					desactivate_button.classList.remove("desactivate-button-not-ok_dprofil");
				}

				if (this.value.length < 6) {
					desactivate_button.classList.add("desactivate-button-not-ok_dprofil");
					desactivate_button.classList.remove("desactivate-button-ok_dprofil");
				}
			}

			if (this.value.length > 6) {
				this.value = this.value.slice(0, 6);
			}
		});
	}

	let desactivate_button = document.getElementById('desactivate-button_dprofil');
	if (desactivate_button) {
		desactivate_button.addEventListener('click', function() {
			let desactivation_code = document.getElementById("desactivation-code_dprofil");
			if (desactivation_code && desactivation_code.value.length == 6) {
				DesactiveA2F(desactivation_code.value)
			}
		});
	}
}

async function ActivateButtonA2F() {
    try {
        const {data} = await axios.get('https://' + window.location.hostname + ':' + window.location.port + '/api/social/me/a2f_generate_key', {
			withCredentials: true,
		});

		if (data && data.success) {
			let step_key = document.getElementById('step-key_dprofil');
			if (step_key) {step_key.innerText = data.otp_secret;};

			let qr_code = document.getElementById('qr-code_dprofil');
			if (qr_code) {qr_code.src = "data:image/png;base64," + data.qr_code;};

			let activationA2F = document.getElementById('activationA2F_dprofil');
			if (activationA2F) {activationA2F.classList.remove("hidden");};

			let activateA2F = document.getElementById('activateA2F_dprofil');
			if (activateA2F) {activateA2F.classList.add("hidden");};
		} else {
			if (data && data.message) {showNotificationError(data.message);};
		}

    } catch (error) {
		showNotificationError("Error while generating 2FA key");
    }
}

async function ActiveA2F(code) {
    try {
		const csrfToken = await getCSRFToken();

		if (csrfToken) {
			const {data} = await axios.post('https://' + window.location.hostname + ':' + window.location.port + '/api/social/me/a2f_active', {
				code: code
			}, {
				headers: {
					'Content-Type': 'application/json',
					'X-CSRFToken': csrfToken,
				},
				withCredentials: true,
			});

			if (data && data.success) {
				var is_correct = data.is_correct;
				if (is_correct) {
					let step_key = document.getElementById('step-key_dprofil');
					if (step_key) {step_key.innerText = "";};

					let qr_code = document.getElementById('qr-code_dprofil');
					if (qr_code) {qr_code.src = "";};

					let activation_code = document.getElementById('activation-code_dprofil');
					if (activation_code) {activation_code.value = "";};

					let activationA2F = document.getElementById('activationA2F_dprofil');
					if (activationA2F) {activationA2F.classList.add("hidden");};

					let desactivateA2F = document.getElementById('desactivateA2F_dprofil');
					if (desactivateA2F) {desactivateA2F.classList.remove("hidden");};

					let activate_button = document.getElementById('activate-button_dprofil');
					if (activate_button) {
						activate_button.classList.add("activate-button-not-ok_dprofil");
						activate_button.classList.remove("activate-button-ok_dprofil");
					};
					PlayUpdateNotifAnim();
				}
			} else {
				if (data && data.message) {showNotificationError(data.message);};
			}
		};
		
    } catch (error) {
		showNotificationError("Error while activating 2FA");
    }
}

async function DesactiveA2F(code) {
    try {
		const csrfToken = await getCSRFToken();

		if (csrfToken) {
			const {data} = await axios.post('https://' + window.location.hostname + ':' + window.location.port + '/api/social/me/a2f_desactive', {
				code: code
			}, {
				headers: {
					'Content-Type': 'application/json',
					'X-CSRFToken': csrfToken,
				},
				withCredentials: true,
			});

			if (data && data.success) {
				var is_correct = data.is_correct;
				if (is_correct) {
					let desactivation_code = document.getElementById('desactivation-code_dprofil');
					if (desactivation_code) {desactivation_code.value = "";};

					let desactivationA2F = document.getElementById('desactivationA2F_dprofil');
					if (desactivationA2F) {desactivationA2F.classList.add("hidden");};

					let activateA2F = document.getElementById('activateA2F_dprofil');
					if (activateA2F) {activateA2F.classList.remove("hidden");};

					let desactivate_button = document.getElementById('desactivate-button_dprofil');
					if (desactivate_button) {
						desactivate_button.classList.add("desactivate-button-not-ok_dprofil");
						desactivate_button.classList.remove("desactivate-button-ok_dprofil");
					};
					PlayUpdateNotifAnim();
				}
			} else {
				if (data && data.message) {showNotificationError(data.message);};
				return false;
			}
		} else {
			return false;
		}

    } catch (error) {
		showNotificationError("Error while desactivating 2FA");
		return false;
    }
}
