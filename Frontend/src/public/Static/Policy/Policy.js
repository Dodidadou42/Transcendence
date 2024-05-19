import {pageStatus} from './Website.js';
import {GetStatus, UpdateStatus} from './Website.js';
import {getCSRFToken} from './Website.js';

let module_home = null;
let module_data = null;
let module_cookies = null;

var page = "";

let skip_load = false;

export function LoadPage() {
	if (skip_load == false) {
		const child = document.getElementById('website');
		if (!child) {return ;}
		if (page != "") {
			child.innerHTML = page;
			Page(window.location.hash);
		} else {
			var cssLink = document.createElement('link');
			cssLink.rel = 'stylesheet';
			cssLink.href = './Policy.css';
			document.head.appendChild(cssLink);
			cssLink.onload = function() {
				fetch('Policy.html')
				.then(response => response.text())
				.then(html => {
					page = html;
					child.innerHTML = page;
					child.classList.remove("hidden");
					Page(window.location.hash);
				});
			}
		}
	} else {
		Page(window.location.hash);
	};
}

function Page(page) {
	var tempImg = new Image();
	tempImg.src = './p4.gif';

	tempImg.onload = function() {
		if (page == pageStatus.Policy || page == pageStatus.PolicyHome) {
			if (!module_home) {
				import('./PHome.js').then((module) => {
					module_home = module;
					module_home.LoadPage();
				});
			} else {
				module_home.LoadPage();
			}
		} else if (page == pageStatus.PolicyData) {
			if (!module_data) {
				import('./Data.js').then((module) => {
					module_data = module;
					module_data.LoadPage();
				});
			} else {
				module_data.LoadPage();
			}
		} else if (page == pageStatus.PolicyCookies) {
			if (!module_cookies) {
				import('./Cookies.js').then((module) => {
					module_cookies= module;
					module_cookies.LoadPage();
				});
			} else {
				module_cookies.LoadPage();
			}
		} else {
			window.location.hash = pageStatus.Policy;
		}

		if (skip_load == false) {
			let openPanel_policy = document.getElementById('openPanel_policy');
			if (openPanel_policy) {
				openPanel_policy.addEventListener('click', (event) =>  {
					const nav = document.getElementById('nav_policy');
					if (nav) {nav.classList.add('open_policy');};
				});
			};
			
			let navCross_policy = document.getElementById('navCross_policy');
			if (navCross_policy) {
				navCross_policy.addEventListener('click', (event) =>  {
					const nav = document.getElementById('nav_policy');
					if (nav) {nav.classList.remove('open_policy');};
				});
			};
		};
	};
}

export function UnloadPage() {
	switch(GetStatus()) {
		case pageStatus.PolicyHome:
			if (module_home) {module_home.UnloadPage();};
			break;

		case pageStatus.PolicyData:
			if (module_data) {module_data.UnloadPage();};
			break;

		case pageStatus.PolicyCookies:
			if (module_cookies) {module_cookies.UnloadPage();};
			break;

		default:
			break;
	};

	if (window.location.hash == pageStatus.Policy
		|| window.location.hash == pageStatus.PolicyHome
		|| window.location.hash == pageStatus.PolicyData
		|| window.location.hash == pageStatus.PolicyCookies) {
		skip_load = true;
	} else {
		skip_load = false;
		let openPanel_policy = document.getElementById('openPanel_policy');
		if (openPanel_policy) {openPanel_policy.removeEventListener('click', function(event) {});};
	
		let navCross_policy = document.getElementById('navCross_policy');
		if (navCross_policy) {navCross_policy.removeEventListener('click', function(event) {});};
	}
}