/***********************************************************************************/
/*                       Register Page event + loading page                        */
/***********************************************************************************/

import {pageStatus} from './Website.js';
import {GetStatus, UpdateStatus} from './Website.js';
import {getCSRFToken, showNotificationError} from './Website.js';

import {GetSameMail, UpdateSameMail} from './Connect.js';

var page = "";

export function LoadPage() {
	const child = document.getElementById('child_connect');
	if (!child) {return ;}
	if (page != "") {
		child.innerHTML = page;
		let footer = document.querySelector('footer');
		if (footer) {footer.classList.remove('hidden');};
		Page();
	} else {
		var cssLink = document.createElement('link');
		cssLink.rel = 'stylesheet';
		cssLink.href = './Register.css';
		document.head.appendChild(cssLink);
        cssLink.onload = function() {
            fetch('Register.html')
            .then(response => response.text())
            .then(html => {
                page = html;
                child.innerHTML = page;
				let footer = document.querySelector('footer');
				if (footer) {footer.classList.remove('hidden');};
                Page();
            });
        }
	}
	UpdateStatus(pageStatus.ConnectRegister);
	document.title = "Register";
}

export function UnloadPage() {
	UpdateStatus("");

	let email = document.getElementById('email_register');
	if (email) {email.removeEventListener('input', function(event) {});};

	let password = document.getElementById('password_register');
	if (password) {password.removeEventListener('input', function(event) {});};

	let pseudo = document.getElementById('pseudo_register');
	if (pseudo) {pseudo.removeEventListener('input', function(event) {});};

	let cpassword = document.getElementById('cpassword_register');
	if (cpassword) {cpassword.removeEventListener('input', function(event) {});};

	let submit = document.getElementById('submit_register');
	if (submit) {submit.removeEventListener('click', function(event) {});};
}

function Page() {
	let email = document.getElementById('email_register');
	if (email) {
		email.value = GetSameMail();
		checkEmail();
		email.addEventListener('input', function(event) {
			checkEmail();
		});
	}

	let password = document.getElementById('password_register')
	if (password) {
		password.addEventListener('input', function(event) {
		checkPassword();
		checkCpassword();
		ActivateSubmitRegister();
		});
	}

	let pseudo = document.getElementById('pseudo_register');
	if (pseudo) {
		pseudo.addEventListener('input', function(event) {
			checkPseudo();
		});
	}

	let cpassword = document.getElementById('cpassword_register');
	if (cpassword) {
		cpassword.addEventListener('input', function(event) {
			checkCpassword();
			checkPassword();
			ActivateSubmitRegister();
		});
	}

	let submit = document.getElementById("submit_register");
	if (submit) {
		submit.onclick = async () => {
			let pseudo = document.getElementById('pseudo_register');
			let doc_email = document.getElementById('email_register');
			let doc_password = document.getElementById('password_register');
			if (pseudo && doc_email && doc_password) {
				var user_id = pseudo.value;
				var email = doc_email.value;
				var password = doc_password.value;

				try {
					const csrfToken = await getCSRFToken();

					if (csrfToken) {
						const {data} = await axios.post('https://' + window.location.hostname + ':' + window.location.port + '/api/sign/up/', {
							user_id: user_id,
							email: email,
							password: password,
						}, {
							headers: {
								'Content-Type': 'application/json',
								'X-CSRFToken': csrfToken,
							},
							withCredentials: true,
						});

						if (data && data.success) {
							window.location.hash = pageStatus.ConnectLogin;
						} else {
							if (data && data.message) {showNotificationError(data.message);};
						};
					};

				} catch (error) {
					showNotificationError("Error while sign up");
				}
			}
		};
	}
}

function checkPseudo() {
	const target = document.getElementById('pseudo_register');
	if (target) {
		const regex = /^[\x00-\x7F]*$/;
		const special_chars = /[`!@#$%^&*()_\-+=\[\]{};':"\\|,.<>\/?~ ]/;
		if (target.value.length < 1) {
			pseudoError('none', "");
			ActivateSubmitRegister();
			return ;
		}
		if (target.value.length <= 3) {
			pseudoError('warning', 'Pseudo is too short');
		} else if (special_chars.test(target.value)) {
			pseudoError('warning', "No special characters allowed");
		} else if (!regex.test(target.value)) {
			pseudoError('warning', "No special characters allowed");
		} else {
			pseudoError('none', "");
		}
		
		ActivateSubmitRegister();
	}
}

function checkEmail() {
	const target = document.getElementById('email_register');
	if (target) {
		UpdateSameMail(target.value);
		const regex = /[\u{1D7D8}-\u{1D7FF}]/u;
		if (target.value.length < 1) {
			emailError('none', "");
			ActivateSubmitRegister();
			return ;
		}
		if (!target.value.includes("@")) {
			emailError('warning', "Not an email adress");
		} else if (!/\.([a-zA-Z])+$/i.test(target.value)) {
			emailError('warning', "Email doesn't end with the correct domain");
		} else if (target.value.length <= 10) {
			emailError('warning', 'Email is too short');
		} else if (regex.test(target.value)) {
			emailError('warning', 'Email contains wird');
		}
		else {
			emailError('none', "");
		}
		ActivateSubmitRegister();
	}
}

function checkPassword() {
	const target = document.getElementById('password_register');
	if (target) {
		if (target.value.length < 1) {
			passwordError('none', "");
			return ;
		}
		if (target.value.length <= 6) {
			passwordError('warning', 'Password is too short');
		} else if (/[A-Z]/.test(target.value) === false) {
			passwordError('warning', 'Password requires at least 1 uppercase letter');
		} else if (/[a-z]/.test(target.value) === false) {
			passwordError('warning', 'Password requires at least 1 lowercase letter');
		} else if (!hasNDigits(target.value, 2)) {
			passwordError('warning', 'Password requires at least 2 digits');
		} else {
			passwordError('none', "");
		}
	}
}

export function hasNDigits(str, n) {
	const matches = str.match(/\d/g);
	return matches !== null && matches.length >= n;
}


function checkCpassword() {
	const target = document.getElementById('password_register');
	const ctarget = document.getElementById('cpassword_register');
	if (target && ctarget) {
		if (ctarget.value.length < 1) {
			cpasswordError('none', "");
			return ;
		}
		if (target.value != ctarget.value) {
			cpasswordError('warning', 'Confirmation password does not match password');
		} else {
			cpasswordError('none', "");
		}
	}
}

function ActivateSubmitRegister() {
	const email = document.getElementById('email_register');
	const pass = document.getElementById('password_register');
	const cpass = document.getElementById('cpassword_register');
	const pseudo = document.getElementById('pseudo_register');

	if (email && pass && cpass && pseudo) {
		let submit = document.getElementById('submit_register');
		if (submit) {
			if (!email.classList.contains('inputError-register') && !email.classList.contains('inputWarning-register')
					&& !pass.classList.contains('inputError-register') && !pass.classList.contains('inputWarning-register')
					&& email.value.length > 0 && pass.value.length > 0 && !pseudo.classList.contains('inputError-register')
					&& !pseudo.classList.contains('inputWarning-register') && !cpass.classList.contains('inputError-register') 
					&& !cpass.classList.contains('inputWarning-register') && pseudo.value.length > 0 && cpass.value.length > 0) {
						submit.classList.remove('unusable-register');
			} else {submit.classList.add('unusable-register');}
		}
	}
}

function pseudoError(type, message) {
	const info = document.getElementById('pseudoInfo_register');
	const input = document.getElementById('pseudo_register');

	if (info && input) {
		if (type === 'error') {
			input.classList.add('inputError-register');
			info.innerText = message;
		} else if (type === 'warning') {
			input.classList.add('inputWarning-register');
			info.innerText = message;
		} else {
			input.classList.remove('inputError-register');
			input.classList.remove('inputWarning-register');
			info.innerText = '';
		}
	}
}

function passwordError(type, message) {
	const info = document.getElementById('passwordInfo_register');
	const input = document.getElementById('password_register');

	if (info && input) {
		if (type === 'error') {
			input.classList.add('inputError-register');
			info.innerText = message;
		} else if (type === 'warning') {
			input.classList.add('inputWarning-register');
			info.innerText = message;
		} else {
			input.classList.remove('inputError-register');
			input.classList.remove('inputWarning-register');
			info.innerText = '';
		}
	}
}

function cpasswordError(type, message) {
	const info = document.getElementById('cpasswordInfo_register');
	const input = document.getElementById('cpassword_register');

	if (info && input) {
		if (type === 'error') {
			input.classList.add('inputError-register');
			info.innerText = message;
		} else if (type === 'warning') {
			input.classList.add('inputWarning-register');
			info.innerText = message;
		} else {
			input.classList.remove('inputError-register');
			input.classList.remove('inputWarning-register');
			info.innerText = '';
		}
	}
}

function emailError(type, message) {
	const info = document.getElementById('emailInfo_register');
	const input = document.getElementById('email_register');

	if (info && input) {
		if (type === 'error') {
			input.classList.add('inputError-register');
			info.innerText = message;
		} else if (type === 'warning') {
			input.classList.add('inputWarning-register');
			info.innerText = message;
		} else {
			input.classList.remove('inputError-register');
			input.classList.remove('inputWarning-register');
			info.innerText = '';
		}
	}
}