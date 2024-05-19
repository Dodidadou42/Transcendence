import {pageStatus} from './Website.js';
import {GetStatus, UpdateStatus} from './Website.js';
import {getCSRFToken, showNotificationError} from './Website.js';

var page = "";

export function LoadPage() {
	const child = document.getElementById('website');
	if (!child) {return ;}
	if (page != "") {
		child.innerHTML = page;
		Page();
	} else {
		var cssLink = document.createElement('link');
		cssLink.rel = 'stylesheet';
		cssLink.href = './Contacts.css';
		document.head.appendChild(cssLink);
        cssLink.onload = function() {
            fetch('Contacts.html')
            .then(response => response.text())
            .then(html => {
                page = html;
                child.innerHTML = page;
				child.classList.remove("hidden")
				Page()
            });
        }
	}
	UpdateStatus(pageStatus.Contact);
	document.title = "Contacts";
}

export function UnloadPage() {
	UpdateStatus("");

	let name_contacts = document.getElementById('name_contacts');
	if (name_contacts) {name_contacts.removeEventListener('input', function(event) {});};

	let email_contacts = document.getElementById('email_contacts');
	if (email_contacts) {email_contacts.removeEventListener('input', function(event) {});};

	let submit_contacts = document.getElementById('submit_contacts');
	if (submit_contacts) {submit_contacts.removeEventListener('click', function(event) {});};
}

function Page() {
	var tempImg = new Image();
	tempImg.src = './Contacts.jpg';

	tempImg.onload = function() {
		let name_contacts = document.getElementById('name_contacts');
		if (name_contacts) {
			name_contacts.addEventListener('input', (event) => {
				event.target.value = event.target.value.replace(/[^A-Za-z\-]/g, '');
				VerifName(event.target);
			});
		};
		
		let email_contacts = document.getElementById('email_contacts');
		if (email_contacts) {
			email_contacts.addEventListener('input', (event) => {
				VerifEmail(event.target);
			});
		};
		
		let submit_contacts = document.getElementById('submit_contacts');
		if (submit_contacts) {
			submit_contacts.addEventListener('click', (event) => {
				Send();
			});
		}

		let page_contacts = document.getElementById('page_contacts');
		if (page_contacts) {page_contacts.classList.remove('hidden');};
	};
}

function VerifName(input) {
	if (input.value.length === 0) {
		NameError(false, '');
	} else if (input.value.length <= 3) {
		NameError(true, 'Name too short...');
	} else {
		NameError(false, '');
	}
	handleSubmit();
}

function NameError(is_error, message) {
	const error = document.getElementById('nameError_contacts');
	const input = document.getElementById('name_contacts');

	if (error && input) {
		if (is_error) {
			error.innerText = message;
			input.classList.add('bad_contacts');
		} else {
			error.innerText = '';
			input.classList.remove('bad_contacts');
		}
	}
}

function VerifEmail(input) {
	if (input.value.length === 0) {
		EmailError(false, '');
	} else if (input.value.length <= 7) {
		EmailError(true, 'Email too short...');
	} else if (!/\.([a-zA-Z])+$/i.test(input.value)) {
		EmailError(true, 'Email too short...');
	} else {
		EmailError(false, '');
	}
	handleSubmit();
}

function EmailError(is_error, message) {
	const error = document.getElementById('emailError_contacts');
	const input = document.getElementById('email_contacts');

	if (error && input) {
		if (is_error) {
			error.innerText = message;
			input.classList.add('bad_contacts');
		} else {
			error.innerText = '';
			input.classList.remove('bad_contacts');
		}
	}
}

function handleSubmit() {
	const submitButton = document.getElementById('submit_contacts');
	const name = document.getElementById('name_contacts');
	const email = document.getElementById('email_contacts');

	if (submitButton && name && email) {
		if (name.classList.contains('bad_contacts') || name.value.length === 0 || email.classList.contains('bad_contacts') || email.value.length === 0) {
			submitButton.classList.add('unusable_contacts');
		} else {
			submitButton.classList.remove('unusable_contacts');
		}
	}
}

async function Send() {
	let submit_contacts = document.getElementById('submit_contacts')

	if (submit_contacts) {
		if (submit_contacts.classList.contains('unusable_contacts') === false) {

			let email_contacts = document.getElementById('email_contacts');
			let name_contacts = document.getElementById('name_contacts');
			let topic_contacts = document.getElementById('topic_contacts');
			let mess_contacts = document.getElementById('mess_contacts');

			if (email_contacts && name_contacts && topic_contacts && mess_contacts) {
				if (mess_contacts.value.length <= 15) {showNotificationError("Your message is too short")} 
				else {
					submit_contacts.disabled = true;
					try {
						const csrfToken = await getCSRFToken();
				
						if (csrfToken) {
							const {data} = await axios.post('https://' + window.location.hostname + ':' + window.location.port + '/api/features/sendContactMail', {
								'email': email_contacts.value,
								'name': name_contacts.value,
								'topic': topic_contacts.value,
								'mess': mess_contacts.value,
							}, {
								headers: {
									'Content-Type': 'application/json',
									'X-CSRFToken': csrfToken,
								},
								withCredentials: true,
							});
							
							if (data && data.success) {}

							else {
								if (data && data.message) {showNotificationError(data.message);};
							}

						};

					} catch (error) {
						showNotificationError("Error while sending mail");
					}

					mess_contacts.value = '';
					topic_contacts.value = '';
					name_contacts.value = '';
					NameError(false, '', 0);
					email_contacts.value = '';
					EmailError(false, '', 0);
					handleSubmit();
					submit_contacts.disabled = false;
				}
			};
		}
	};
}