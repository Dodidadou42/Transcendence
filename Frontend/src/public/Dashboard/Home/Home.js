// **********************************************************************
// 				Home Page
// **********************************************************************

import {pageStatus} from './Website.js';
import {GetStatus, UpdateStatus} from './Website.js';
import {getCSRFToken, showNotificationError} from './Website.js';
import {me_user_id, socket} from "./Website.js";

import {handleTitle} from './Dashboard.js';

var page = "";

let radarChart = null;
let lineChart = null;
let polarAreaChart = null;

export async function LoadPage() {
	const child = document.getElementById('child1_dashboard');
	if (!child) {return ;}
	if (page != "") {
		child.innerHTML = page;
		Page();
	} else {
		var cssLink = document.createElement('link');
		cssLink.rel = 'stylesheet';
		cssLink.href = './DHome.css';
		document.head.appendChild(cssLink);
        cssLink.onload = function() {
            fetch('DHome.html')
            .then(response => response.text())
            .then(html => {
                page = html;
                child.innerHTML = page;
				child.classList.remove("hidden")
				Page()
            });
        }
	}
	UpdateStatus(pageStatus.DashboardHome);
	handleTitle('Home');
    document.title = "Dashboard Home"
}

export function UnloadPage() {
	UpdateStatus("");

	if (radarChart) {
		radarChart.destroy();
		radarChart = null;
	}
	if (lineChart) {
		lineChart.destroy();
		lineChart = null;
	}
	if (polarAreaChart) {
		polarAreaChart.destroy();
		polarAreaChart = null;
	}
}

function Page() {
	getInfoHome();
}

async function getInfoHome() {
	try {
		const csrfToken = await getCSRFToken();

		if (csrfToken) {
			const {data} = await axios.get('https://' + window.location.hostname + ':' + window.location.port + '/api/social/get_user_me_info_home', {
				headers: {
					'Content-Type': 'application/json',
					'X-CSRFToken': csrfToken,
				},
				withCredentials: true,
			});

			if (data && data.success) {

				let userImg = document.getElementById('userImg_dhome');
				if (userImg) {userImg.src = data.profil.picture;};

				let Uid = document.getElementById('Uid_dhome');
				if (Uid) {Uid.innerText = data.profil.user_id;};

				let pseudo = document.getElementById('pseudo_dhome');
				if (pseudo) {pseudo.innerText = "(" + data.profil.pseudo + ")";};
		
				const userLevel = data.profil.level;
				let lvltext = document.getElementById('lvltext_dhome');
				if (lvltext) {lvltext.innerText = 'Level : ' + ((userLevel - (userLevel % 100)) / 100);};

				let lvl = document.getElementById('lvl_dhome');
				if (lvl) {lvl.style.width = `${(userLevel % 100)}%`;};

				let ctx = null;
				let radarChart_dhome = document.getElementById('radarChart_dhome');
				if (radarChart_dhome) {ctx = radarChart_dhome.getContext('2d');};

				if (ctx) {
					const data_chart = {
					labels: ['Capybara', 'Drugged', 'Defender', 'Waste of evolution', 'Masochist', 'Agressivity'],
					datasets: [{
						label: 'Value (%)',
						data: [data.profil.capybara, data.profil.drugged, data.profil.defender, data.profil.waste, data.profil.masochist, data.profil.agressivity],
						backgroundColor: 'rgba(54, 162, 235, 0.2)',
						borderColor: 'rgba(54, 162, 235, 1)',
						borderWidth: 2
					}]
					};
				
					const options = {
						responsive: true,
						scale: {
						ticks: {
							beginAtZero: true,
							stepSize: 20
						},
						min: 0,
						max: 100,
						},
						plugins: {
							legend: {
							display: false 
							},
							title: {
							display: true,
							text: 'Player Global Statistics Over Last 30 Games',
							align: 'center'
							}
						}
						};
				
					if (radarChart) {radarChart.destroy();};
					radarChart = new Chart(ctx, {
					type: 'radar',
					data: data_chart,
					options: options
					});
				}

				let ctx2 = null;
				let lineChart_dhome = document.getElementById('lineChart_dhome');
				if (lineChart_dhome) {ctx2 = lineChart_dhome.getContext('2d');};

				if (ctx2) {
					const data_chart2 = {
						labels: ['', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
						datasets: [{
							label: 'Win Rate (%)',
							data: data.profil.victory_ratio_list,
							borderColor: 'rgba(54, 162, 235, 1)',
							borderWidth: 2,
							fill: false
						}]
						};
					
					const options2 = {
						responsive: true,
						scales: {
							y: {
								beginAtZero: true,
								min: 0,
								max: 100,
								ticks: {
									callback: function(value) {
										return value + '%';
									}
								}
							}
						},
						plugins: {
							legend: {
								display: false,
							},
							title: {
								display: true,
								text: 'Average Win Rate Over Last 30 Games (for 30 previous games)',
								align: 'center'
							},
							annotation: {
								annotations: {
									line1: {
										type: 'line',
										yMin: 60,
										yMax: 60,
										borderColor: 'rgb(255, 99, 132)',
										borderWidth: 2,
									}
								}
							}
						}
					};

					if (lineChart) {lineChart.destroy();};
					lineChart = new Chart(ctx2, {
						type: 'line',
						data: data_chart2,
						options: options2
					});
				}

				let ctx3 = null;
				let polarAreaChart_dhome = document.getElementById('polarAreaChart_dhome');
				if (polarAreaChart_dhome) {ctx3 = polarAreaChart_dhome.getContext('2d');};

				if (ctx3) {
					const data_chart3 = {
						labels: ['1vs1 Classic', '1vs1 Powerups', 'Overall', '2vs2 Powerups', '2vs2 Classic'],
						datasets: [{
						label: 'Win Rate (%)',
						data: [data.profil.vs1, data.profil.vs1P, data.profil.overall, data.profil.vs2P, data.profil.vs2],
						backgroundColor: [
							'rgba(255, 99, 132, 0.5)',
							'rgba(54, 162, 235, 0.5)',
							'rgba(255, 206, 86, 0.5)',
							'rgba(75, 192, 192, 0.5)',
							'rgba(153, 102, 255, 0.5)'
						],
						borderColor: [
							'rgba(255, 99, 132, 1)',
							'rgba(54, 162, 235, 1)',
							'rgba(255, 206, 86, 1)',
							'rgba(75, 192, 192, 1)',
							'rgba(153, 102, 255, 1)'
						],
						borderWidth: 1
						}]
					};
					
					const options3 = {
						responsive: true,
						scales: {
							r: {
								beginAtZero: true,
								min: 0,
								max: 100,
								ticks: {
									display: true,
									stepSize: 20
								},
								pointLabels: {
									display: true,
									centerPointLabels: true,
									font: {
										size: 10
									},
								}
							}
						},
						plugins: {
							legend: {
								display: false,
							},
							title: {
								display: true,
								text: 'Average Win Rate Over Last 30 Games (for each game mode)',
								align: 'center'
							}
						}
					};
					
					if (polarAreaChart) {polarAreaChart.destroy();};
					polarAreaChart = new Chart(ctx3, {
						type: 'polarArea',
						data: data_chart3,
						options: options3
					});
				}

			} else {
				if (data && data.message) {showNotificationError(data.message);};
			};
		};
	} catch (error) {
		showNotificationError("Error while searching user infos");
	}
}