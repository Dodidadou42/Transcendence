/* ################### Social Game Details Page event ##########################  */

import {pageStatus} from './Website.js';
import {GetStatus, UpdateStatus} from './Website.js';
import {getCSRFToken, showNotificationError} from './Website.js';
import {me_user_id, socket} from "./Website.js";

import {formatMessageDate} from './DSocial.js';

import {set_chartPointTime, get_chartPointTime, set_chartBonus, get_chartBonus} from './Website.js'

var page = "";

export async function LoadPage() {
	const child = document.getElementById('content');
	if (!child) {return ;}
	if (page != "") {
		child.innerHTML = page;
		Page();
	} else {
		var cssLink = document.createElement('link');
		cssLink.rel = 'stylesheet';
		cssLink.href = './SGameDetails.css';
		document.head.appendChild(cssLink);
        cssLink.onload = function() {
            fetch('SGameDetails.html')
            .then(response => response.text())
            .then(html => {
                page = html;
                child.innerHTML = page;
				child.classList.remove("hidden")
				Page()
            });
        }
	}
	UpdateStatus(pageStatus.DashboardSocialGameDetails);
    document.title = "Dashboard Social Game Details"
}

export function UnloadPage() {
	UpdateStatus("");

	if (get_chartPointTime()) {
		get_chartPointTime().destroy()
		set_chartPointTime(null);
	}
	if (get_chartBonus()) {
		get_chartBonus().destroy()
		set_chartBonus(null);
	}
}

async function Page() {
	const hashParts = window.location.hash.split('&');
	if (hashParts.length == 2) {
		const param_name = hashParts[1].split('=');
		const id = param_name[1];

		get_history_with_id(id);
	};
}

function generateGameDuration(duration) {
	var minutes = Math.floor(duration / 60);
	if (minutes < 1) {
		return duration + "s";
	}

	var seconds = duration % 60;	
	var hours = Math.floor(minutes / 60);
	if (hours < 1) {
		return minutes + "m" + seconds + "s";
	}

	minutes = minutes % 60;
	var days = Math.floor(hours / 24);
	if (days < 1) {
		return hours + "h" + minutes + "m" + seconds + "s";
	}

	hours = hours % 60;
	return days + "d" + hours + "h" + minutes + "m" + seconds + "s";
}

async function get_history_with_id(game_id) {
	try {
		const csrfToken = await getCSRFToken();

		if (csrfToken) {
			const {data} = await axios.post('https://' + window.location.hostname + ':' + window.location.port + '/api/social/game_history', {
				game_id: game_id
			}, {
				headers: {
					'Content-Type': 'application/json',
					'X-CSRFToken': csrfToken,
				},
				withCredentials: true,
			});

			if (data && data.success) {
				var winner = document.getElementById("leftParticipant");
				var loser = document.getElementById("rightParticipant");

				if (winner && loser) {
					var winner_list = data.winner;
					var loser_list = data.loser;

					var child_winner = document.createElement('div');
					child_winner.classList.add("participant");
					child_winner.innerText = data.winner;
					winner.appendChild(child_winner)

					var child_loser = document.createElement('div');
					child_loser.classList.add("participant");
					child_loser.innerText = data.loser;
					loser.appendChild(child_loser);

					if ("winner2" in data && "loser2" in data) {
						winner_list += ", " + data.winner2;

						var child_winner = document.createElement('div');
						child_winner.classList.add("participant");
						child_winner.innerText = data.winner2;
						winner.appendChild(child_winner)

						loser_list += ", " + data.loser2;

						var child_loser = document.createElement('div');
						child_loser.classList.add("participant");
						child_loser.innerText = data.loser2;
						loser.appendChild(child_loser);
					};
				}
				
				var left_score = document.getElementById("leftScore");
				var right_score = document.getElementById("rightScore");

				if (left_score && right_score) {
					left_score.innerText = data.winner_score;
					right_score.innerText = data.loser_score;
				};

				var powerups_activated_left = document.getElementById("powerupsActivatedLeft");
				var powerups_activated_right = document.getElementById("powerupsActivatedRight");

				if (powerups_activated_left && powerups_activated_right) {
					powerups_activated_left.innerText = data.winner_powerups_activated;
					powerups_activated_right.innerText = data.loser_powerups_activated;

					if (data.winner_powerups_activated >= data.loser_powerups_activated) {
						powerups_activated_left.classList.add("bold")
					} 
					if (data.winner_powerups_activated <= data.loser_powerups_activated) {
						powerups_activated_right.classList.add("bold")
					}
				};

				var bonus_activated_left = document.getElementById("bonusActivatedLeft");
				var bonus_activated_right = document.getElementById("bonusActivatedRight");

				if (bonus_activated_left && bonus_activated_right) {
					bonus_activated_left.innerText = data.winner_bonus_activated;
					bonus_activated_right.innerText = data.loser_bonus_activated;

					if (data.winner_bonus_activated >= data.loser_bonus_activated) {
						bonus_activated_left.classList.add("bold")
					} 
					if (data.winner_bonus_activated <= data.loser_bonus_activated) {
						bonus_activated_right.classList.add("bold")
					}
				};

				var malus_activated_left = document.getElementById("malusActivatedLeft");
				var malus_activated_right = document.getElementById("malusActivatedRight");

				if (malus_activated_left && malus_activated_right) {
					malus_activated_left.innerText = data.winner_malus_activated;
					malus_activated_right.innerText = data.loser_malus_activated;

					if (data.winner_malus_activated >= data.loser_malus_activated) {
						malus_activated_left.classList.add("bold")
					} 
					if (data.winner_malus_activated <= data.loser_malus_activated) {
						malus_activated_right.classList.add("bold")
					}
				};

				var highest_points_streak_left = document.getElementById("highestPointsStreakLeft");
				var highest_points_streak_right = document.getElementById("highestPointsStreakRight");

				if (highest_points_streak_left && highest_points_streak_right) {
					highest_points_streak_left.innerText = data.winner_highest_points_streak;
					highest_points_streak_right.innerText = data.loser_highest_points_streak;

					if (data.winner_highest_points_streak >= data.loser_highest_points_streak) {
						highest_points_streak_left.classList.add("bold")
					} 
					if (data.winner_highest_points_streak <= data.loser_highest_points_streak) {
						highest_points_streak_right.classList.add("bold")
					}
				}

				var game_date = document.getElementById("gameDate");
				if (game_date) {game_date.innerText = formatMessageDate(data.created_at);};

				var game_duration = document.getElementById("gameDuration");
				if (game_duration) {game_duration.innerText = generateGameDuration(data.game_duration);};

				var total_balls_hits = document.getElementById("totalBallsHits");
				if (total_balls_hits) {total_balls_hits.innerText = data.total_balls_hits;};

				var highest_balls_hits_streak = document.getElementById("highestBallsHitsStreak");
				if (highest_balls_hits_streak) {highest_balls_hits_streak.innerText = data.highest_balls_hits_streak;};

				var highest_balls_speed = document.getElementById("highestBallsSpeed");
				if (highest_balls_speed) {highest_balls_speed.innerText = data.highest_balls_speed + " m/s";};
				
				var total_powerups_activated = document.getElementById("totalPowerupsActivated");
				if (total_powerups_activated) {total_powerups_activated.innerText = data.total_powerups_activated;};

				var total_freeze_powerups_activated = document.getElementById("totalFreezePowerupsActivated");
				if (total_freeze_powerups_activated) {total_freeze_powerups_activated.innerText = data.total_freeze_powerups_activated;};

				var total_slow_powerups_activated = document.getElementById("totalSlowPowerupsActivated");
				if (total_slow_powerups_activated) {total_slow_powerups_activated.innerText = data.total_slow_powerups_activated;};

				var total_speed_powerups_activated = document.getElementById("totalSpeedPowerupsActivated");
				if (total_speed_powerups_activated) {total_speed_powerups_activated.innerText = data.total_speed_powerups_activated;};

				var total_racket_increase_powerups_activated = document.getElementById("totalRacketIncreasePowerupsActivated");
				if (total_racket_increase_powerups_activated) {total_racket_increase_powerups_activated.innerText = data.total_racket_increase_powerups_activated;};

				var total_multi_balls_powerups_activated = document.getElementById("totalMultiBallsPowerupsActivated");
				if (total_multi_balls_powerups_activated) {total_multi_balls_powerups_activated.innerText = data.total_multi_balls_powerups_activated;};

				var total_racket_reduction_powerups_activated = document.getElementById("totalRacketReductionPowerupsActivated");
				if (total_racket_reduction_powerups_activated) {total_racket_reduction_powerups_activated.innerText = data.total_racket_reduction_powerups_activated;};

				var chartPointTimeName = "chartPointTime"

				if (data.total_powerups_activated == 0) {
					chartPointTimeName = "chartPointTime2"
					
					let chartPointTimeStats = document.getElementById("chartPointTimeStats");
					if (chartPointTimeStats) {chartPointTimeStats.classList.add("hidden");};

					let chartBonus = document.getElementById("chartBonus");
					if (chartBonus) {chartBonus.classList.add("hidden");};
				} else {

					let chartPointTime2 = document.getElementById("chartPointTime2");
					if (chartPointTime2) {chartPointTime2.classList.add("hidden");};

					let ctx2 = null;
					let chartBonus = document.getElementById('chartBonus');
					if (chartBonus) {ctx2 = chartBonus.getContext('2d');};

					if (ctx2) {
						const chart_data2 = {
							labels: ["Freeze Powerups Activated", "Slow Powerups Activated", "Speed Powerups Activated", "Multi-Balls Powerups Activated", "Racket-Reduction Powerups Activated", "Racket-Increase Powerups Activated"],
							datasets: [{
								label: 'Taken',
								data: [data.total_freeze_powerups_activated, data.total_slow_powerups_activated, data.total_speed_powerups_activated, data.total_multi_balls_powerups_activated, data.total_racket_reduction_powerups_activated, data.total_racket_increase_powerups_activated],
								backgroundColor: [
									'rgba(255, 99, 132, 0.8)',
									'rgba(54, 162, 235, 0.8)',
									'rgba(255, 206, 86, 0.8)',
									'rgba(75, 192, 192, 0.8)',
									'rgba(153, 102, 255, 0.8)',
									'rgba(255, 159, 64, 0.8)'
								],
								borderColor: [
									'rgba(255, 99, 132, 1)',
									'rgba(54, 162, 235, 1)',
									'rgba(255, 206, 86, 1)',
									'rgba(75, 192, 192, 1)',
									'rgba(153, 102, 255, 1)',
									'rgba(255, 159, 64, 1)'
								],
								borderWidth: 1
							}]
						};

						const options2 = {
							plugins: {
								title: {
									display: true,
									text: 'Share of each bonus taken'
								}
							},
						};

						if (get_chartBonus()) {get_chartBonus().destroy();};
						set_chartBonus(new Chart(ctx2, {
							type: 'pie',
							data: chart_data2,
							options: options2
						}));
					}
				}

				let ctx = null;
				let chart_pointtime = document.getElementById(chartPointTimeName);
				if (chart_pointtime) {ctx = chart_pointtime.getContext('2d');};

				if (ctx) {
					const chart_data = {
						labels: data.point_time_time,
						datasets: [
							{
								label: winner_list,
								data: data.point_time_left,
								borderColor: 'rgba(255, 99, 132, 1)',
								borderWidth: 2,
								fill: false
							},
							{
								label: loser_list,
								data: data.point_time_right,
								borderColor: 'rgba(54, 162, 235, 1)',
								borderWidth: 2,
								fill: false
							}
						]
					};
			
					const options = {
						responsive: true,
						plugins: {
							title: {
								display: true,
								text: 'Team points in relation to time'
							}
						},
						scales: {
							x: {
								title: {
									display: true,
									text: 'Time (in seconds)'
								},
								type: 'linear',
								min: 0,
								max: data.point_time_time[data.point_time_time.length - 1],
							},
							y: {
								title: {
									display: true,
									text: 'Scores'
								},
								ticks: {
									stepSize: 1,
									min: 0,
									max: 5
								}
							}
						}
					};
			
					if (get_chartPointTime()) {get_chartPointTime().destroy();}
					set_chartPointTime( new Chart(ctx, {
						type: 'line',
						data: chart_data,
						options: options
					}));
				}

			} else {
				if (data && data.message) {showNotificationError(data.message);};
				window.location.hash = pageStatus.DashboardSocialContacts;
			};
		};

	} catch (error) {
		showNotificationError("Error while recovering game history");
		window.location.hash = pageStatus.DashboardSocialContacts;
	}
}