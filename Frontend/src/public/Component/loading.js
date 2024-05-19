
class Loading1 extends HTMLElement {
	constructor() {
		super();
		this.attachShadow({ mode: 'open' });
		this.shadowRoot.innerHTML = `
			<style>
			.loading1 {
				height: 80px;
				width: 80px;
				display: flex;
				flex-direction: column;
				justify-content: center;
				position: relative;

				animation: loadRoation 2s infinite;
			}

			@keyframes loadRoation {
				0% {
					transform: rotateZ(0deg);
				}
				100% {
					transform: rotateZ(360deg);
				}
			}

			.load1Point {
				width: 15px;
				height: 15px;
				margin: 0 auto;
				position: relative;
			}

			.load1bar {
				width: 100%;
				height: 100%;
				margin: auto;
				position: absolute;
				border-radius: 50%;
				background-image: url('./p5.gif');
				animation: opaBar 2s infinite;
			}

			@keyframes opaBar {
				0% {
					opacity: 1;
				}
				100% {
					opacity: 0;
				}
			}

			.load1bar:nth-child(1) {
				top: -40px;
				display: none;
				animation-delay: 0;
			}

			.load1bar:nth-child(2) {
				top: -27px;
				right: -13px;
				animation-delay: 167ms;
			}

			.load1bar:nth-child(3) {
				top: -13px;
				right: -27px;
				animation-delay: 334ms;
			}

			.load1bar:nth-child(4) {
				right: -40px;
				display: none;
				animation-delay: 501ms;
			}

			.load1bar:nth-child(5) {
				bottom: -13px;
				right: -27px;
				animation-delay: 668ms;
			}

			.load1bar:nth-child(6) {
				bottom: -27px;
				right: -13px;
				animation-delay: 835ms;
			}

			.load1bar:nth-child(7) {
				bottom: -40px;
				display: none;
				animation-delay: 1002ms;
			}

			.load1bar:nth-child(8) {
				bottom: -27px;
				left: -13px;
				animation-delay: 1169ms;
			}

			.load1bar:nth-child(9) {
				bottom: -13px;
				left: -27px;
				animation-delay: 1336ms;
			}

			.load1bar:nth-child(10) {
				left: -40px;
				display: none;
				animation-delay: 1503ms;
			}

			.load1bar:nth-child(11) {
				top: -13px;
				left: -27px;
				animation-delay: 1670ms;
			}

			.load1bar:nth-child(12) {
				top: -27px;
				left: -13px;
				animation-delay: 1837ms;
			}
			</style>
			<div class="loading1">
				<div class="load1Point">
					<div class="load1bar"></div>
					<div class="load1bar"></div>
					<div class="load1bar"></div>
					<div class="load1bar"></div>
					<div class="load1bar"></div>
					<div class="load1bar"></div>
					<div class="load1bar"></div>
					<div class="load1bar"></div>
					<div class="load1bar"></div>
					<div class="load1bar"></div>
					<div class="load1bar"></div>
					<div class="load1bar"></div>
				</div>
			</div>
			`;
	}
}

customElements.define('load-one', Loading1);