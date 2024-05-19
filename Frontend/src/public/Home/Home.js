import {pageStatus} from './Website.js';
import {GetStatus, UpdateStatus} from './Website.js';
import {getCSRFToken} from './Website.js';

let burgerNavActive = false;
var slideIndex = 0;
var slides = ['ft_transcendance_home.png', 'ft_transcendance_play.png', 'ft_transcendance_social.png', 'ft_transcendance_profil.png', 'ft_transcendance_history.png', 'ft_transcendance_custom.png', 'ft_transcendance_tournament.png'];

var timeout

var page = "";

export function LoadPage() {
	burgerNavActive = false;

	const child = document.getElementById('website');
	if (!child) {return ;}
	if (page != "") {
		child.innerHTML = page;
		Page();
	} else {
		var cssLink = document.createElement('link');
		cssLink.rel = 'stylesheet';
		cssLink.href = './Home.css';
		document.head.appendChild(cssLink);
        cssLink.onload = function() {
            fetch('Home.html')
            .then(response => response.text())
            .then(html => {
                page = html;
                child.innerHTML = page;
				child.classList.remove("hidden")
				Page()
            });
        }
	}
	UpdateStatus(pageStatus.Home);
	document.title = "Home";
}

export function UnloadPage() {
	UpdateStatus("");
	if (timeout) {clearTimeout(timeout);}

	var dots = document.getElementsByClassName("dot_home");
	if (dots) {
		for (let i = 0; i < dots.length; i++) {
			dots[i].removeEventListener('click', function(event) {});
		}
	}
	
	let RegisterButton_home = document.getElementById('RegisterButton_home');
	if (RegisterButton_home) {RegisterButton_home.removeEventListener('click', function(event) {});};
	
	let burgerNavClose_home = document.getElementById('burgerNavClose_home');
	if (burgerNavClose_home) {burgerNavClose_home.removeEventListener('click', function(event) {});};

	let burgerMenu_home = document.getElementById('burgerMenu_home');
	if (burgerMenu_home) {burgerMenu_home.removeEventListener('click', function(event) {});};
}

function Page() {
	var tempImg = new Image();
	tempImg.src = './b3.png';
	tempImg.onload = function() {
		var dots = document.getElementsByClassName("dot_home");
		if (dots) {
			for (let i = 0; i < dots.length; i++) {
				dots[i].addEventListener("click", function() {
					slideIndex = i;
					updateSlide();
				});
			}
			showSlides()
		}

		let RegisterButton_home = document.getElementById('RegisterButton_home');
		if (RegisterButton_home) {
			RegisterButton_home.addEventListener('click', () => {
				window.location.hash = pageStatus.ConnectLogin;
			});
		};
		
		let burgerNavClose_home = document.getElementById('burgerNavClose_home');
		if (burgerNavClose_home) {
			burgerNavClose_home.addEventListener('click', () => {
				burgerNavActive = false;
				handleBurgerMenu();
			});
		};

		let burgerMenu_home = document.getElementById('burgerMenu_home');
		if (burgerMenu_home) {
			burgerMenu_home.addEventListener('click', () => {
				burgerNavActive = true;
				handleBurgerMenu();
			});
		};
	};
}

function handleBurgerMenu() {
	const burgerMenu = document.getElementById('burgerNav_home');
	if (burgerMenu) {
		if (burgerNavActive){
			burgerMenu.classList.remove('hidden');
		} else {
			burgerMenu.classList.add('hidden');
		}
	};
}

function updateSlide() {
	let slide_home = document.getElementById('slide_home');
	if (slide_home) {
		slide_home.src = slides[slideIndex];

		var dots = document.getElementsByClassName("dot_home");
		if (dots) {
			for (var i = 0; i < dots.length; i++) {
				dots[i].className = dots[i].className.replace(" active_home", "");
			}
			dots[slideIndex].className += " active_home";
		}

		slide_home.onload = function() {
			let page_home = document.getElementById('page_home');
			if (page_home) {page_home.classList.remove('hidden');};

			let footer = document.querySelector('footer');
			if (footer) {footer.classList.remove('hidden');};
		}
	};
}

function showSlides() {
	if (slideIndex >= slides.length) {slideIndex = 0}
	updateSlide();
	slideIndex++;
	timeout = setTimeout(showSlides, 10000);
}
