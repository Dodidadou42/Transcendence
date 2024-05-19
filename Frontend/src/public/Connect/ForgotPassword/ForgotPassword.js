/***********************************************************************************/
/*                    Forgot Password Page event + loading page                    */
/***********************************************************************************/

import {pageStatus} from './Website.js';
import {GetStatus, UpdateStatus} from './Website.js';
import {getCSRFToken, showNotificationError} from './Website.js';
import {hasNDigits} from './Register.js'

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
		cssLink.href = './ForgotPassword.css';
		document.head.appendChild(cssLink);
        cssLink.onload = function() {
            fetch('ForgotPassword.html')
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
	UpdateStatus(pageStatus.ConnectForgotPassword);
	document.title = "Forgot Password";
}

export function UnloadPage() {
	UpdateStatus("");

	let email_recovery = document.getElementById('email_recovery');
	if (email_recovery) {email_recovery.removeEventListener('input', function(event) {});};

	let continue_recovery = document.getElementById("continue_recovery");
	if (continue_recovery) {continue_recovery.removeEventListener('click', function(event) {});};

	let password_recovery = document.getElementById('password_recovery');
	if (password_recovery) {password_recovery.removeEventListener('input', function(event) {});};

	let cpassword_recovery = document.getElementById('cpassword_recovery');
	if (cpassword_recovery) {cpassword_recovery.removeEventListener('input', function(event) {});};

	let continue_recovery_change_password = document.getElementById("continue_recovery_change_password");
	if (continue_recovery_change_password) {continue_recovery_change_password.removeEventListener('click', function(event) {});};
}

var timer_begin = new Date().getTime();
var timerInterval = null;

function Page() {
	let email_recovery = document.getElementById('email_recovery');

	if (email_recovery) {
		email_recovery.value = GetSameMail();
		CheckEmailRecovery();

		email_recovery.addEventListener('input', function(event) {
			CheckEmailRecovery();
		});
	}

	let continue_recovery = document.getElementById("continue_recovery");

	if (continue_recovery) {
		continue_recovery.onclick = async () => {
			let email_recovery = document.getElementById('email_recovery');
			if (email_recovery) {
				var email = email_recovery.value;
				try {
					const csrfToken = await getCSRFToken();

					if (csrfToken) {
						const {data} = await axios.post('https://' + window.location.hostname + ':' + window.location.port + '/api/sign/forgot_password/', {
							email: email,
						}, {
							headers: {
								'Content-Type': 'application/json',
								'X-CSRFToken': csrfToken,
							},
							withCredentials: true,
						});

						if (data && data.success) {

							timer_begin = new Date().getTime();
							
							var seconds_timer = document.getElementById('nb_seconds');
							if (seconds_timer) {seconds_timer.innerText = 300;};

							let box_recovery = document.getElementsByClassName('box-recovery');
							let box_recovery_code = document.getElementsByClassName('box-recovery-code');

							if (box_recovery && box_recovery.length > 0 && box_recovery_code && box_recovery_code.length > 0) {
								box_recovery[0].classList.add("hidden");
								box_recovery_code[0].classList.remove("hidden");
							}
							
							function updateTimer() {
								var nb_seconds = 300 + Math.floor(timer_begin / 1000) - Math.floor(new Date().getTime() / 1000);
								
								if (nb_seconds <= 0) {

									if (box_recovery && box_recovery.length > 0 && box_recovery_code && box_recovery_code.length > 0)
									{
										box_recovery_code[0].classList.add("hidden");
										box_recovery[0].classList.remove("hidden");
									}
									clearInterval(timerInterval);
								}
								if (seconds_timer) {seconds_timer.innerText = nb_seconds;};
							}

							timerInterval = setInterval(function() {
								updateTimer();
							}, 1000);
						} else {
							if (data && data.message) {showNotificationError(data.message);};
						};
					};

				} catch (error) {
					showNotificationError("Error while recovering account");
				}
			}
		};
	}

	var inputs = document.getElementsByClassName("digit-input-recovery-code");
	if (inputs) {
		for (let i = 0; i < inputs.length; i++) {
			inputs[i].addEventListener('input', function(event) {
				this.value = this.value.replace(/\D/g, '');
				focusNext(event, inputs, i);
			});
			inputs[i].addEventListener('keydown', function(event) {
				focusPrevious(event, inputs, i);
			});
		}
	}

	let password_recovery = document.getElementById('password_recovery');
	if (password_recovery) {
		password_recovery.addEventListener('input', function(event) {
			checkPassword();
			checkCpassword();
			ActivateSubmitRecoveryChangePassword();
		});
	}

	let cpassword_recovery = document.getElementById('cpassword_recovery');
	if (cpassword_recovery) {
		cpassword_recovery.addEventListener('input', function(event) {
			checkCpassword();
			checkPassword();
			ActivateSubmitRecoveryChangePassword();
		});
	}

	let continue_recovery_change_password = document.getElementById("continue_recovery_change_password");
	if (continue_recovery_change_password) {
		continue_recovery_change_password.onclick = async () => {
			let email_recovery = document.getElementById('email_recovery');
			let password_recovery = document.getElementById('password_recovery');
			if (email_recovery && password_recovery) {
				var email = email_recovery.value;
				var recovery_code = inputs[0].value + inputs[1].value + inputs[2].value + inputs[3].value + inputs[4].value + inputs[5].value;
				var password = password_recovery.value;

				try {
					const csrfToken = await getCSRFToken();

					if (csrfToken) {
						const {data} = await axios.post('https://' + window.location.hostname + ':' + window.location.port + '/api/sign/change_password/', {
							email: email,
							recovery_code: recovery_code,
							password: password,
						}, {
							headers: {
								'Content-Type': 'application/json',
								'X-CSRFToken': csrfToken,
							},
							withCredentials: true,
						});

						if (data && data.success) {
							clearInterval(timerInterval);
							window.location.hash = pageStatus.ConnectLogin;
						} else {
							if (data && data.message) {showNotificationError(data.message);};
						};
					}

				} catch (error) {
					showNotificationError("Error while changing password");
				}
			}
		};
	}
}


function CheckEmailRecovery() {
	const target = document.getElementById('email_recovery');
	if (target) {
		UpdateSameMail(target.value);
		if (target.value.length < 1) {
			EmailErrorRecovery('none', "");
			ActivateSubmitRecovery();
			return ;
		}
		if (!target.value.includes("@")) {
			EmailErrorRecovery('warning', "Not an email adress");
		} else if (!/\.([a-zA-Z])+$/i.test(target.value)) {
			EmailErrorRecovery('warning', "Email doesn't end with the correct domain");
		} else if (target.value.length <= 10) {
			EmailErrorRecovery('warning', 'Email is too short');
		} else {
			EmailErrorRecovery('none', "");
		}
		ActivateSubmitRecovery();
	}
}

function EmailErrorRecovery(type, message) {
	const info = document.getElementById('emailInfo_recovery');
	const EmailInput = document.getElementById('email_recovery');

	if (info && EmailInput) {
		if (type === 'error') {
			EmailInput.classList.add('inputError-recovery');
			info.innerText = message;
		} else if (type === 'warning') {
			EmailInput.classList.add('inputWarning-recovery');
			info.innerText = message;
		} else {
			EmailInput.classList.remove('inputError-recovery');
			EmailInput.classList.remove('inputWarning-recovery');
			info.innerText = '';
		}
	}
}

function ActivateSubmitRecovery() {
	const email = document.getElementById('email_recovery');

	if (email) {
		let continue_recovery = document.getElementById('continue_recovery');
		if (continue_recovery) {
			if (!email.classList.contains('inputError-recovery') && !email.classList.contains('inputWarning-recovery') && email.value.length > 0) {
				continue_recovery.classList.remove('unusable-recovery');
			} else {continue_recovery.classList.add('unusable-recovery');}
		}
	}
}

async function focusNext(event, inputs, i) {
	const lenght = inputs[i].value.length;

	if (lenght == 1) {
		if (i < 5) {
			const nextInput = inputs[i + 1];
			nextInput.focus();
			if (nextInput.value.length == 1) {
				setTimeout(() => {
					nextInput.setSelectionRange(nextInput.value.length, nextInput.value.length);
				}, 0);
			}
		}
		var recovery_code = inputs[0].value + inputs[1].value + inputs[2].value + inputs[3].value + inputs[4].value + inputs[5].value;
		if (recovery_code.length == 6) {
			let email_recovery = document.getElementById('email_recovery');
			if (email_recovery) {
				var email = email_recovery.value;
	
				try {
					const csrfToken = await getCSRFToken();

					if (csrfToken) {
						const {data} = await axios.post('https://' + window.location.hostname + ':' + window.location.port + '/api/sign/is_recover_code/', {
							email: email,
							recovery_code: recovery_code,
						}, {
							headers: {
								'Content-Type': 'application/json',
								'X-CSRFToken': csrfToken,
							},
							withCredentials: true,
						});
			
						if (data && data.success) {
							clearInterval(timerInterval);
							timer_begin = new Date().getTime();
						
							var seconds_timer = document.getElementById('nb_seconds_2');
							if (seconds_timer) {seconds_timer.innerText = 300;};
			
							let box_recovery_code = document.getElementsByClassName('box-recovery-code');
							let box_recovery_change_password = document.getElementsByClassName('box-recovery-change-password');

							if (box_recovery_code && box_recovery_code.length > 0 && box_recovery_change_password && box_recovery_change_password.length > 0)
							{
								box_recovery_code[0].classList.add("hidden");
								box_recovery_change_password[0].classList.remove("hidden");
							}
							
							function updateTimer() {
								var nb_seconds = 300 + Math.floor(timer_begin / 1000) - Math.floor(new Date().getTime() / 1000);
								
								if (nb_seconds <= 0) {
									
									let box_recovery = document.getElementsByClassName('box-recovery');

									if (box_recovery && box_recovery.length > 0 && box_recovery_change_password && box_recovery_change_password.length > 0)
									{
										box_recovery_change_password[0].classList.add("hidden");
										box_recovery[0].classList.remove("hidden");
									}
									clearInterval(timerInterval);
								}
								if (seconds_timer) {seconds_timer.innerText = nb_seconds;};
							}
			
							timerInterval = setInterval(function() {
								updateTimer();
							}, 1000);
						} else {
							if (data && data.message) {showNotificationError(data.message);};
						}
					};

				} catch (error) {
					showNotificationError("Error while sending recovery code");
				}
			}
		}
	}
}

function focusPrevious(event, inputs, i) {
	const lenght = inputs[i].value.length;

	if ((lenght == 0 && event.key === 'Backspace') || event.key === 'ArrowLeft') {
		if (i > 0) {
			const nextInput = inputs[i - 1];
			nextInput.focus();
			setTimeout(() => {
				nextInput.setSelectionRange(nextInput.value.length, nextInput.value.length);
			}, 0);
		}
		setTimeout(() => {
			inputs[i].setSelectionRange(inputs[i].value.length, inputs[i].value.length);
		}, 0);
	}
	if (event.key === 'ArrowRight') {
		if (i < 5) {
			const nextInput = inputs[i + 1];
			nextInput.focus();
			if (nextInput.value.length == 1) {
				setTimeout(() => {
					nextInput.setSelectionRange(nextInput.value.length, nextInput.value.length);
				}, 0);
			}
		}
	}

	if (lenght == 1) {
		if (!isNaN(event.key)) {
			inputs[i].value = "";
		}
	}
}

function checkPassword() {
	const target = document.getElementById('password_recovery');
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

function checkCpassword() {
	const target = document.getElementById('password_recovery');
	const ctarget = document.getElementById('cpassword_recovery');
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

function ActivateSubmitRecoveryChangePassword() {
	const pass = document.getElementById('password_recovery');
	const cpass = document.getElementById('cpassword_recovery');

	if (pass && cpass) {
		let continue_recovery_change_password = document.getElementById('continue_recovery_change_password');

		if (continue_recovery_change_password) {
			if (!pass.classList.contains('inputError-recovery') && !pass.classList.contains('inputWarning-recovery')
					&& pass.value.length > 0 && !cpass.classList.contains('inputError-recovery') 
					&& !cpass.classList.contains('inputWarning-recovery') && cpass.value.length > 0) {
						continue_recovery_change_password.classList.remove('unusable-recovery');
			} else {continue_recovery_change_password.classList.add('unusable-recovery');}
		}
	}
}

function passwordError(type, message) {
	const info = document.getElementById('passwordInfo_recovery');
	const input = document.getElementById('password_recovery');

	if (info && input) {
		if (type === 'error') {
			input.classList.add('inputError-recovery');
			info.innerText = message;
		} else if (type === 'warning') {
			input.classList.add('inputWarning-recovery');
			info.innerText = message;
		} else {
			input.classList.remove('inputError-recovery');
			input.classList.remove('inputWarning-recovery');
			info.innerText = '';
		}
	}
}

function cpasswordError(type, message) {
	const info = document.getElementById('cpasswordInfo_recovery');
	const input = document.getElementById('cpassword_recovery');
	if (info && input) {
		if (type === 'error') {
			input.classList.add('inputError-recovery');
			info.innerText = message;
		} else if (type === 'warning') {
			input.classList.add('inputWarning-recovery');
			info.innerText = message;
		} else {
			input.classList.remove('inputError-recovery');
			input.classList.remove('inputWarning-recovery');
			info.innerText = '';
		}
	}
}
