/***********************************************************************************/
/*                         Login Page event + loading page                         */
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
		cssLink.href = './Login.css';
		document.head.appendChild(cssLink);
        cssLink.onload = function() {
            fetch('Login.html')
                .then(response => response.text())
                .then(html => {
                    page = html
                    child.innerHTML = page;
					let footer = document.querySelector('footer');
					if (footer) {footer.classList.remove('hidden');};
                    Page();
                });
        };
	}
    UpdateStatus(pageStatus.ConnectLogin);
	document.title = "Login";
}

export function UnloadPage() {
	UpdateStatus("");

	let email_login = document.getElementById('email_login');
	if (email_login) {email_login.removeEventListener('input', function(event) {});};

	let password_login = document.getElementById('password_login');
	if (password_login) {password_login.removeEventListener('input', function(event) {});};

	let StayLabel_login = document.getElementById('StayLabel_login');
	if (StayLabel_login) {StayLabel_login.removeEventListener('click', function(event) {});};

	let submit_login = document.getElementById('submit_login');
	if (submit_login) {submit_login.removeEventListener('click', function(event) {});}

	let Auth_login = document.getElementById('Auth_login');
	if (Auth_login) {Auth_login.removeEventListener('click', function(event) {});};

	let RedirectEmail_login = document.getElementById("RedirectEmail_login");
	if (RedirectEmail_login) {RedirectEmail_login.removeEventListener('click', function(event) {});};
}

var timer_begin = new Date().getTime();
var timerInterval = null;

function Page() {
	let email_login = document.getElementById('email_login');
	if (email_login) {
		email_login.value = GetSameMail();
		CheckEmail();
		email_login.addEventListener('input', function(event) {
			CheckEmail();
		});
	}

	let password_login = document.getElementById('password_login');
	if (password_login) {
		password_login.addEventListener('input', function(event) {
			CheckPassword();
		});
	}

	let StayLabel_login = document.getElementById('StayLabel_login');
	if (StayLabel_login) {
		StayLabel_login.addEventListener('click', function(event) {
			const checkbox = document.getElementById('stay_login');
			if (checkbox) {checkbox.checked = !checkbox.checked;};
		});
	}

	let submit_login = document.getElementById("submit_login");
	if (submit_login) {
		submit_login.onclick = async () => {
			let email_login = document.getElementById('email_login');
			let password_login = document.getElementById('password_login');
			let stay_login = document.getElementById('stay_login');

			if (email_login && password_login && stay_login) {
				var email = email_login.value;
				var password = password_login.value;
				var week = stay_login.checked;
				try {
					const csrfToken = await getCSRFToken();

					if (csrfToken) {
						const {data} = await axios.post('https://' + window.location.hostname + ':' + window.location.port + '/api/sign/in/', {
							email: email,
							password: password,
							week: week,
							is_a2f: false,
						}, {
							headers: {
								'Content-Type': 'application/json',
								'X-CSRFToken': csrfToken,
							},
							withCredentials: true,
						});

						if (data && data.success) {
							if (data.a2f_status) {
								let box_login = document.getElementsByClassName('box-login');
								let box_a2f_login = document.getElementsByClassName('box-a2f_login');

								if (box_login && box_login.length > 0 && box_a2f_login && box_a2f_login.length > 0) {
									box_login[0].classList.add("hidden");
									box_a2f_login[0].classList.remove("hidden");
								}
							} else {
								window.location.hash = pageStatus.DashboardHome;
							}
						} else {
							if (data && data.message) {showNotificationError(data.message);};
						};
					};

				} catch (error) {
					showNotificationError("Error while log in");
				}
			}
		};
	}

	let Auth_login = document.getElementById("Auth_login");
	if (Auth_login) {
		Auth_login.onclick = async () => {
			try {
				const {data} = await axios.get('https://' + window.location.hostname + ':' + window.location.port + '/api/sign/42/', {
					headers: {
						'Content-Type': 'application/json',
					},
					withCredentials: true,
				});

				if (data && data.success) {
					let url_to_add = "https%3A%2F%2F" + window.location.hostname + "%3A" + window.location.port + "%2Ffourty-two-link%2F&response_type=code"
					var authWindow = window.open(data.link + url_to_add, "42 Auth", "");
					var checkAuthInterval = setInterval(function() {
						if (authWindow && authWindow.closed) {
							clearInterval(checkAuthInterval);
							window.location.hash = "#dashboard_home";
						}
					}, 1000);
				} else {
					if (data && data.message) {showNotificationError(data.message);};
				};

			} catch (error) {
				showNotificationError("Error while using 42Auth");
			}
		};
	}
	
	var inputs = document.getElementsByClassName("digit-input_login");
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

	let RedirectEmail_login = document.getElementById("RedirectEmail_login");
	if (RedirectEmail_login) {
		RedirectEmail_login.onclick = async () => {
			let email_login = document.getElementById('email_login');
			let password_login = document.getElementById('password_login');
			if (email_login && password_login) {
				var email = email_login.value;
				var password = password_login.value;

				try {
					const csrfToken = await getCSRFToken();

					if (csrfToken) {
						const {data} = await axios.post('https://' + window.location.hostname + ':' + window.location.port + '/api/sign/bypass_a2f/', {
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

							timer_begin = new Date().getTime();
							
							var seconds_timer = document.getElementById('nb_seconds_email_login');
							if (seconds_timer) {seconds_timer.innerText = 300;};
					
							let box_a2f_login = document.getElementsByClassName('box-a2f_login');
							let box_email_login = document.getElementsByClassName('box-email_login');

							if (box_a2f_login && box_a2f_login.length > 0 && box_email_login && box_email_login.length > 0) {
								box_a2f_login[0].classList.add("hidden");
								box_email_login[0].classList.remove("hidden");
							}
							
							function updateTimer() {
								var nb_seconds = 300 + Math.floor(timer_begin / 1000) - Math.floor(new Date().getTime() / 1000);
								
								if (nb_seconds <= 0) {
									let box_login = document.getElementsByClassName('box-login');

									if (box_login && box_login.length > 0 && box_email_login && box_email_login.length > 0) {
										box_email_login[0].classList.add("hidden");
										box_login[0].classList.remove("hidden");
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
					showNotificationError("Error while sending bypass 2FA email");
				}
			}
		};
	}

	var inputs_email = document.getElementsByClassName("digit-input-email_login");
	if (inputs_email) {
		for (let i = 0; i < inputs_email.length; i++) {
			inputs_email[i].addEventListener('input', function(event) {
				this.value = this.value.replace(/\D/g, '');
				focusNextEmail(event, inputs_email, i);
			});
			inputs_email[i].addEventListener('keydown', function(event) {
				focusPreviousEmail(event, inputs_email, i);
			});
		}
	}
}

function CheckEmail() {
	const target = document.getElementById('email_login');
	if (target) {
		UpdateSameMail(target.value);
		if (target.value.length < 1) {
			EmailError('none', "");
			ActivateSubmit();
			return ;
		}
		if (!target.value.includes("@")) {
			EmailError('warning', "Not an email adress");
		} else if (!/\.([a-zA-Z])+$/i.test(target.value)) {
			EmailError('warning', "Email doesn't end with the correct domain");
		} else if (target.value.length <= 10) {
			EmailError('warning', 'Email is too short')
		} else {
			EmailError('none', "");
		}
		ActivateSubmit();
	}
}

function CheckPassword() {
	const target = document.getElementById('password_login');
	if (target) {
		if (target.value.length < 1) {
			PasswordError('none', "");
			ActivateSubmit();
			return ;
		}
		if (target.value.length <= 6) {
			PasswordError('warning', 'Password is too short');
		} else {
			PasswordError('none', "");
		}
		ActivateSubmit();
	}
}

function ActivateSubmit() {
	const email = document.getElementById('email_login');
	const pass = document.getElementById('password_login');

	if (email && pass) {
		let submit_login = document.getElementById('submit_login');

		if (submit_login) {
			if (!email.classList.contains('inputError_login') && !email.classList.contains('inputWarning_login') && !pass.classList.contains('inputError_login') && !pass.classList.contains('inputWarning_login') && email.value.length > 0 && pass.value.length > 0) {
				submit_login.classList.remove('unusable_login');
			} else {submit_login.classList.add('unusable_login');}
		}
	}
}

function EmailError(type, message) {
	const info = document.getElementById('emailInfo_login');
	const EmailInput = document.getElementById('email_login');

	if (info && EmailInput) {
		if (type === 'error') {
			EmailInput.classList.add('inputError_login');
			info.innerText = message;
		} else if (type === 'warning') {
			EmailInput.classList.add('inputWarning_login');
			info.innerText = message;
		} else {
			EmailInput.classList.remove('inputError_login');
			EmailInput.classList.remove('inputWarning_login');
			info.innerText = '';
		}
	}
}

function PasswordError(type, message) {
	const info = document.getElementById('passwordInfo_login');
	const PassInput = document.getElementById('password_login');

	if (info && PassInput) {
		if (type === 'error') {
			PassInput.classList.add('inputError_login');
			info.innerText = message;
		} else if (type === 'warning') {
			PassInput.classList.add('inputWarning_login');
			info.innerText = message;
		} else {
			PassInput.classList.remove('inputError_login');
			PassInput.classList.remove('inputWarning_login');
			info.innerText = '';
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
		var a2f_code = inputs[0].value + inputs[1].value + inputs[2].value + inputs[3].value + inputs[4].value + inputs[5].value;
		if (a2f_code.length == 6) {
			let email_login = document.getElementById('email_login');
			let password_login = document.getElementById('password_login');
			let stay_login = document.getElementById('stay_login');

			if (email_login && password_login && stay_login) {
				var email = email_login.value;
				var password = password_login.value;
				var week = stay_login.checked;
		
				try {
					const csrfToken = await getCSRFToken();

					if (csrfToken) {
						const {data} = await axios.post('https://' + window.location.hostname + ':' + window.location.port + '/api/sign/in/', {
							email: email,
							password: password,
							week: week,
							is_a2f: true,
							a2f_code: a2f_code,
						}, {
							headers: {
								'Content-Type': 'application/json',
								'X-CSRFToken': csrfToken,
							},
							withCredentials: true,
						});
			
						if (data && data.success) {
							window.location.hash = pageStatus.DashboardHome;
						} else {
							if (data && data.message) {showNotificationError(data.message);};
						};
					};

				} catch (error) {
					showNotificationError("Error while log in");
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

async function focusNextEmail(event, inputs, i) {
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
		var connection_code = inputs[0].value + inputs[1].value + inputs[2].value + inputs[3].value + inputs[4].value + inputs[5].value;
		if (connection_code.length == 6) {
			let email_login = document.getElementById('email_login');
			let password_login = document.getElementById('password_login');
			let stay_login = document.getElementById('stay_login');
			let remove_a2f_login = document.getElementById('remove_a2f_login');

			if (email_login && password_login && stay_login && remove_a2f_login) {

				var email = email_login.value;
				var password = password_login.value;
				var week = stay_login.checked;
				var desactivate_a2f = remove_a2f_login.checked;
		
				try {
					const csrfToken = await getCSRFToken();

					if (csrfToken) {
						const {data} = await axios.post('https://' + window.location.hostname + ':' + window.location.port + '/api/sign/is_connection_code/', {
							email: email,
							password: password,
							week: week,
							desactivate_a2f: desactivate_a2f,
							connection_code: connection_code,
						}, {
							headers: {
								'Content-Type': 'application/json',
								'X-CSRFToken': csrfToken,
							},
							withCredentials: true,
						});
			
						if (data && data.success) {
							window.location.hash = pageStatus.DashboardHome;
						} else {
							if (data && data.message) {showNotificationError(data.message);};
						};
					};

				} catch (error) {
					showNotificationError("Error while mail code log in");
				}
			}
		}
	}
}

function focusPreviousEmail(event, inputs, i) {
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