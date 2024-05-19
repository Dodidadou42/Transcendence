document.addEventListener('DOMContentLoaded', async (event) => {
	let page = document.getElementById('page');
	if (page) {
		page.classList.add('hidden');
		try {
			const {data} = await axios.get('https://' + window.location.hostname + ':' + window.location.port + '/api/sign/is/', {});
			if (data && data.success) {
				window.location.hash = "";
			} else {
				page.classList.remove('hidden');
			}
		} catch (e) {
			page.classList.remove('hidden');
		}
	};
});

async function getCSRFToken() {
	try {
		const response = await axios.get('https://' + window.location.hostname + ':' + window.location.port + '/api/sign/tp/', {
			withCredentials: true,
		});
		if (response.data && response.data.success) {
			return response.data.csrf_token;
		} else {
			window.location.hash = pageStatus.Home;
			return null;
		};
	} catch (error) {
		return null;
	}
}

window.onload = async () => {
	const currentUrl = window.location.href;

	const url = new URL(currentUrl);

	const queryParams = url.searchParams;

	const codeParam = queryParams.get('code');

	try {
		const csrfToken = await getCSRFToken();
		const {data} = await axios.post('https://' + window.location.hostname + ':' + window.location.port + '/api/sign/in42/', {
			code: codeParam,
		}, {
			headers: {
				'Content-Type': 'application/json',
				'X-CSRFToken': csrfToken,
			},
			withCredentials: true,
		});
		window.close();

	} catch (e) {
		window.close();
	}
}