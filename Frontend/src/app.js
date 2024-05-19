const http = require('http');
const fs = require('fs');
const path = require('path');
const axios = require('axios')
const port = process.env.PORT_FRONT || 3000;

const server = http.createServer((req, res) => {
	const url = req.url;
	const parsedUrl = new URL(url, `http://${req.headers.host}`);
	const pathname = parsedUrl.pathname;

	if (url.endsWith('.css')) {
		const cssFilename = path.basename(url, '.css');
		RenderCssFiles(res, `${cssFilename}.css`);
	} else if (url.endsWith('.js')) {
		const jsFilename = path.basename(url, '.js');
		RenderJsFiles(res, `${jsFilename}.js`);
	} else if (url.endsWith('.html')) {
		const HFilename = path.basename(url, '.html');
		RenderHtmlFiles(res, `${HFilename}.html`);
	} else if (url.endsWith('.gif')) {
		const Filename = path.basename(url, '.gif');
		serveImgFile(`${Filename}.gif`, res, 'gif');
	} else if (url.endsWith('.png')) {
		const Filename = path.basename(url, '.png');
		serveImgFile(`${Filename}.png`, res, 'png');
	} else if (url.endsWith('.jpg')) {
		const Filename = path.basename(url, '.jpg');
		serveImgFile(`${Filename}.jpg`, res, 'jpg');
	} else if (url == '/favicon.ico') {
		const Filename = path.basename('./home', '.ico');
		serveImgFile(`${Filename}.ico`, res, 'ico');
	} else if (url.endsWith('.ico')) {
		const Filename = path.basename(url, '.ico');
		serveImgFile(`${Filename}.ico`, res, 'ico');
	} else if (url.endsWith('.mp4')) {
		const Filename = path.basename(url, '.mp4');
		serveMediaFile(`${Filename}.mp4`, res, 'video/mp4');
	} else {
		if (pathname === '/fourty-two-link/') {
			serveFile('fourtytwo/Ft.html', res);
		} else {
			serveFile('Website.html', res);
		}
	}
});

function RenderCssFiles(res, Filename) {
	if (Filename === 'Website.css') {
		serveCSSFile(`Website.css`, res);
	} else if (Filename === 'Home.css') {
		serveCSSFile(`Home/Home.css`, res);
	} else if (Filename === 'Connect.css') {
		serveCSSFile(`Connect/Connect.css`, res);
	} else if (Filename === 'Login.css') {
		serveCSSFile(`Connect/Login/Login.css`, res);
	} else if (Filename === 'Register.css') {
		serveCSSFile(`Connect/Register/Register.css`, res);
	} else if (Filename === 'ForgotPassword.css') {
		serveCSSFile(`Connect/ForgotPassword/ForgotPassword.css`, res);
	} else if (Filename === 'Contacts.css') {
		serveCSSFile(`Static/Contacts/Contacts.css`, res);
	} else if (Filename === 'Policy.css') {
		serveCSSFile(`Static/Policy/Policy.css`, res);
	} else if (Filename === 'PHome.css') {
		serveCSSFile(`Static/Policy/Home/PolicyHome.css`, res);
	} else if (Filename === 'Cookies.css') {
		serveCSSFile(`Static/Policy/Cookies/Cookies.css`, res);
	} else if (Filename === 'Data.css') {
		serveCSSFile(`Static/Policy/Data/Data.css`, res);
	} else if (Filename === 'Dashboard.css') {
		serveCSSFile(`Dashboard/Dashboard.css`, res);
	} else if (Filename === 'Ft.css') {
		serveCSSFile(`fourtytwo/Ft.css`, res);
	} else if (Filename === 'DHome.css') {
		serveCSSFile(`Dashboard/Home/Home.css`, res);
	} else if (Filename === 'DProfil.css') {
		serveCSSFile(`Dashboard/Profil/Profil.css`, res);
	} else if (Filename === 'DSocial.css') {
		serveCSSFile(`Dashboard/Social/Social.css`, res);
	} else if (Filename === 'SContacts.css') {
		serveCSSFile(`Dashboard/Social/Contacts/Contacts.css`, res);
	} else if (Filename === 'DLobby.css') {
		serveCSSFile(`Dashboard/Lobby/Lobby.css`, res);
	} else if (Filename === 'SMessages.css') {
		serveCSSFile(`Dashboard/Social/Messages/Messages.css`, res);
	} else if (Filename === 'SProfil.css') {
		serveCSSFile(`Dashboard/Social/Profil/Profil.css`, res);
	} else if (Filename === 'SGameDetails.css') {
		serveCSSFile(`Dashboard/Social/GameDetails/SGameDetails.css`, res);
	} else if (Filename === 'DMatchmaking.css') {
		serveCSSFile(`Dashboard/Matchmaking/Matchmaking.css`, res);
	} else if (Filename === 'DTournament.css') {
		serveCSSFile(`Dashboard/Tournament/Tournament.css`, res);
	} else if (Filename === 'PongGame.css') {
		serveCSSFile(`Game/PongGame.css`, res);
	} else if (Filename === 'SessionExpired.css') {
		serveCSSFile(`SessionExpired/SessionExpired.css`, res);
	} else {
		res.writeHead(404, { 'Content-Type': 'text/plain' });
		res.end('Not Found');
	}
}

function RenderJsFiles(res, Filename) {
	if (Filename === 'Website.js') {
		serveJsFile(`Website.js`, res);
	} else if (Filename === 'Home.js') {
		serveJsFile(`Home/Home.js`, res);
	} else if (Filename === 'utils.js') {
		serveJsFile(`Component/utils.js`, res);
	} else if (Filename === 'Connect.js') {
		serveJsFile(`Connect/Connect.js`, res);
	} else if (Filename === 'Login.js') {
		serveJsFile(`Connect/Login/Login.js`, res);
	} else if (Filename === 'Register.js') {
		serveJsFile(`Connect/Register/Register.js`, res);
	} else if (Filename === 'ForgotPassword.js') {
		serveJsFile(`Connect/ForgotPassword/ForgotPassword.js`, res);
	} else if (Filename === 'Contacts.js') {
		serveJsFile(`Static/Contacts/Contacts.js`, res);
	} else if (Filename === 'Policy.js') {
		serveJsFile(`Static/Policy/Policy.js`, res);
	} else if (Filename === 'PHome.js') {
		serveJsFile(`Static/Policy/Home/PolicyHome.js`, res);
	} else if (Filename === 'Cookies.js') {
		serveJsFile(`Static/Policy/Cookies/Cookies.js`, res);
	} else if (Filename === 'Data.js') {
		serveJsFile(`Static/Policy/Data/Data.js`, res);
	} else if (Filename === 'Dashboard.js') {
		serveJsFile(`Dashboard/Dashboard.js`, res);
	} else if (Filename === 'DHome.js') {
		serveJsFile(`Dashboard/Home/Home.js`, res);
	} else if (Filename === 'DLobby.js') {
		serveJsFile(`Dashboard/Lobby/Lobby.js`, res);
	} else if (Filename === 'DMatchmaking.js') {
		serveJsFile(`Dashboard/Matchmaking/Matchmaking.js`, res);
	} else if (Filename === 'DTournament.js') {
		serveJsFile(`Dashboard/Tournament/Tournament.js`, res);
	} else if (Filename === 'DProfil.js') {
		serveJsFile(`Dashboard/Profil/Profil.js`, res);
	} else if (Filename === 'DSocial.js') {
		serveJsFile(`Dashboard/Social/Social.js`, res);
	} else if (Filename === 'SContacts.js') {
		serveJsFile(`Dashboard/Social/Contacts/Contacts.js`, res);
	} else if (Filename === 'SProfil.js') {
		serveJsFile(`Dashboard/Social/Profil/Profil.js`, res);
	} else if (Filename === 'SGameDetails.js') {
		serveJsFile(`Dashboard/Social/GameDetails/SGameDetails.js`, res);
	} else if (Filename === 'SMessages.js') {
		serveJsFile(`Dashboard/Social/Messages/Messages.js`, res);
	} else if (Filename === 'Ft.js') {
		serveJsFile(`fourtytwo/Ft.js`, res);
	} else if (Filename === 'loading.js') {
		serveJsFile(`Component/loading.js`, res);
	} else if (Filename === 'PongGame.js') {
		serveJsFile(`Game/PongGame.js`, res);
	} else if (Filename === 'SessionExpired.js') {
		serveJsFile(`SessionExpired/SessionExpired.js`, res);
	} else {
		res.writeHead(404, { 'Content-Type': 'text/plain' });
		res.end('Not Found');
	}
}

function RenderHtmlFiles(res, Filename) {
	if (Filename === 'Home.html') {
		serveHtmlFile(`Home/Home.html`, res);
	} else if (Filename === 'Connect.html') {
		serveHtmlFile(`Connect/Connect.html`, res);
	} else if (Filename === 'Register.html') {
		serveHtmlFile(`Connect/Register/Register.html`, res);
	} else if (Filename === 'Login.html') {
		serveHtmlFile(`Connect/Login/Login.html`, res);
	} else if (Filename === 'ForgotPassword.html') {
		serveHtmlFile(`Connect/ForgotPassword/ForgotPassword.html`, res);
	} else if (Filename === 'Contacts.html') {
		serveHtmlFile(`Static/Contacts/Contacts.html`, res);
	} else if (Filename === 'Policy.html') {
		serveHtmlFile(`Static/Policy/Policy.html`, res);
	} else if (Filename === 'PHome.html') {
		serveHtmlFile(`Static/Policy/Home/PolicyHome.html`, res);
	} else if (Filename === 'Cookies.html') {
		serveHtmlFile(`Static/Policy/Cookies/Cookies.html`, res);
	} else if (Filename === 'Data.html') {
		serveHtmlFile(`Static/Policy/Data/Data.html`, res);
	} else if (Filename === 'loading1.html') {
		serveHtmlFile(`Component/loading1.html`, res);
	} else if (Filename === 'Dashboard.html') {
		serveHtmlFile(`Dashboard/Dashboard.html`, res);
	} else if (Filename === 'DHome.html') {
		serveHtmlFile(`Dashboard/Home/Home.html`, res);
	} else if (Filename === 'DProfil.html') {
		serveHtmlFile(`Dashboard/Profil/Profil.html`, res);
	} else if (Filename === 'DLobby.html') {
		serveHtmlFile(`Dashboard/Lobby/Lobby.html`, res);
	} else if (Filename === 'DSocial.html') {
		serveHtmlFile(`Dashboard/Social/Social.html`, res);
	} else if (Filename === 'SContacts.html') {
		serveHtmlFile(`Dashboard/Social/Contacts/Contacts.html`, res);
	} else if (Filename === 'SMessages.html') {
		serveHtmlFile(`Dashboard/Social/Messages/Messages.html`, res);
	} else if (Filename === 'SProfil.html') {
		serveHtmlFile(`Dashboard/Social/Profil/Profil.html`, res);
	} else if (Filename === 'SGameDetails.html') {
		serveHtmlFile(`Dashboard/Social/GameDetails/SGameDetails.html`, res);
	} else if (Filename === 'PongGame.html') {
		serveHtmlFile(`Game/PongGame.html`, res);
	} else if (Filename === 'DMatchmaking.html') {
		serveHtmlFile(`Dashboard/Matchmaking/Matchmaking.html`, res);
	} else if (Filename === 'DTournament.html') {
		serveHtmlFile(`Dashboard/Tournament/Tournament.html`, res);
	} else if (Filename === 'SessionExpired.html') {
		serveHtmlFile(`SessionExpired/SessionExpired.html`, res);
	} else {
		res.writeHead(404, { 'Content-Type': 'text/plain' });
		res.end('Not Found');
	}
}

function serveFile(filename, res) {
	const filePath = path.join(__dirname, 'public/', filename);

	fs.readFile(filePath, (err, data) => {
		if (err) {
			res.writeHead(404, { 'Content-Type': 'text/plain' });
			res.end('Not Found');
		} else {
			res.writeHead(200, { 'Content-Type': 'text/html' });
			res.end(data);
		}
	});
}

function serveCSSFile(filename, res) {
	const filePath = path.join(__dirname, 'public/', filename);

	fs.readFile(filePath, (err, data) => {
		if (err) {
			res.writeHead(404, { 'Content-Type': 'text/plain' });
			res.end('Not Found');
		} else {
			res.writeHead(200, { 'Content-Type': 'text/css' });
			res.end(data);
		}
	});
}

function serveJsFile(filename, res) {
	const filePath = path.join(__dirname, 'public/', filename);

	fs.readFile(filePath, (err, data) => {
		if (err) {
			res.writeHead(404, { 'Content-Type': 'text/plain' });
			res.end('Not Found');
		} else {
			res.writeHead(200, { 'Content-Type': 'application/javascript' });
			res.end(data);
		}
	});
}

function serveHtmlFile(filename, res) {
	const filePath = path.join(__dirname, 'public/', filename);
	fs.readFile(filePath, (err, data) => {
		if (err) {
			res.writeHead(404, { 'Content-Type': 'text/plain' });
			res.end('Not Found');
		} else {
			res.writeHead(200, { 'Content-Type': 'text/html' });
			res.end(data);
			return data;
		}
	});
}

function serveImgFile(filename, res, format) {
	const filePath = path.join(__dirname, 'img/', filename);

	fs.readFile(filePath, (err, data) => {
		if (err) {
			res.writeHead(404, { 'Content-Type': 'text/plain' });
			res.end('Not Found');
		} else {
			res.writeHead(200, { 'Content-Type': `image/${format}` });
			res.end(data);
			return data;
		}
	});
}

function serveMediaFile(filename, res, format) {
	const filePath = path.join(__dirname, 'media/', filename);

	fs.readFile(filePath, (err, data) => {
		if (err) {
			res.writeHead(404, { 'Content-Type': 'text/plain' });
			res.end('Not Found');
		} else {
			res.writeHead(200, { 'Content-Type': `${format}` });
			res.end(data);
			return data;
		}
	});
}

server.listen(port, () => {
  console.log(`Le serveur est en cours d'exécution sur le port ${port}`);
});
