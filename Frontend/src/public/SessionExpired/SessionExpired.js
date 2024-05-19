import {pageStatus} from './Website.js';
import {GetStatus, UpdateStatus} from './Website.js';
import {Reconnect} from './Website.js';

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
		cssLink.href = './SessionExpired.css';
		document.head.appendChild(cssLink);
        cssLink.onload = function() {
            fetch('SessionExpired.html')
            .then(response => response.text())
            .then(html => {
                page = html;
                child.innerHTML = page;
				child.classList.remove("hidden")
				Page()
            });
        }
	}
	UpdateStatus(pageStatus.SessionExpired);
	document.title = "Session Expired";
}

export function UnloadPage() {
    UpdateStatus("");

    let button_reconnect = document.getElementById("button_reconnect");
    if (button_reconnect) {button_reconnect.removeEventListener('click', function(event) {});};
}

function Page() {
    let button_reconnect = document.getElementById("button_reconnect");
    if (button_reconnect) {
        button_reconnect.addEventListener('click', async (event) => {
            await Reconnect();
        });
    };
}