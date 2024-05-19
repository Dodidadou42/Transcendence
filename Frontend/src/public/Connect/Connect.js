/***********************************************************************************/
/*                          General event + loading page                           */
/***********************************************************************************/

import {pageStatus} from './Website.js';
import {GetStatus, UpdateStatus} from './Website.js';
import {getCSRFToken} from './Website.js';

let module_login = null;
let module_register = null;
let module_forgot_password = null;

var same_mail = "";
var page = ""

export function LoadPage() {
	const child = document.getElementById('website');
	if (!child) {return ;}
	if (page != "") {
		let body = document.body;
		if (body) {body.classList.add("body_add_by_connect");};

		child.innerHTML = page;
		Page(window.location.hash);
	} else {
		var cssLink = document.createElement('link');
		cssLink.rel = 'stylesheet';
		cssLink.href = './Connect.css';
		document.head.appendChild(cssLink);

		let body = document.body;
		if (body) {body.classList.add("body_add_by_connect");};
		
        cssLink.onload = function() {
            fetch('Connect.html')
            .then(response => response.text())
            .then(html => {
                page = html;
                child.innerHTML = page;
				child.classList.remove("hidden")
				Page(window.location.hash)
            });
        }
	}
}

export function UnloadPage() {
	switch(GetStatus()) {
		case pageStatus.ConnectLogin:
			if (module_login) {module_login.UnloadPage();};
			break;

		case pageStatus.ConnectRegister:
			if (module_register) {module_register.UnloadPage();};
			break;

		case pageStatus.ConnectForgotPassword:
			if (module_forgot_password) {module_forgot_password.UnloadPage();};
			break;

		default:
			break;
	};

	let body = document.body;
	if (body) {body.classList.remove("body_add_by_connect");};
}

function Page(page) {
	if (page == pageStatus.Connect || page == pageStatus.ConnectLogin) {
		if (!module_login) {
			import('./Login.js').then((module) => {
				module_login = module;
				module_login.LoadPage();
			});
		} else {
			module_login.LoadPage();
		}
	} else if (page == pageStatus.ConnectRegister) {
		if (!module_register) {
			import('./Register.js').then((module) => {
				module_register = module;
				module_register.LoadPage();
			});
		} else {
			module_register.LoadPage();
		}
	} else if (page == pageStatus.ConnectForgotPassword) {
		if (!module_forgot_password) {
			import('./ForgotPassword.js').then((module) => {
				module_forgot_password = module;
				module_forgot_password.LoadPage();
			});
		} else {
			module_forgot_password.LoadPage();
		}
	} else {
		window.location.hash = pageStatus.ConnectLogin;
	}
}

export function GetSameMail() {
	return same_mail;
}

export function UpdateSameMail(new_same_mail) {
	same_mail = new_same_mail;
}