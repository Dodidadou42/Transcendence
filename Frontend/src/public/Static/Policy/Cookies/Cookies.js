import {pageStatus} from './Website.js';
import {GetStatus, UpdateStatus} from './Website.js';
import {getCSRFToken} from './Website.js';

var page = "";

export function LoadPage() {
	const child = document.getElementById('child1_policy');
	
	if (!child) {return ;}

	if (page != "") {
		child.innerHTML = page;
		Page();
	} else {
		var cssLink = document.createElement('link');
		cssLink.rel = 'stylesheet';
		cssLink.href = './Cookies.css';
		document.head.appendChild(cssLink);
        cssLink.onload = function() {
            fetch('Cookies.html')
            .then(response => response.text())
            .then(html => {
                page = html;
                child.innerHTML = page;
                Page();
            });
        }
	}
	UpdateStatus(pageStatus.PolicyCookies);
	document.title = "Policy Cookies";
}

export function UnloadPage() {
	UpdateStatus("");
}

function Page() {
	let child1_policy = document.getElementById('child1_policy');
	if (child1_policy) {child1_policy.classList.remove('hidden');};

    let page_policy = document.getElementById("page_policy");
	if (page_policy) {page_policy.classList.remove("hidden");};
}