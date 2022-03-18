// Variáveis Globais | Elementos da página
const inicioBtn = document.getElementById("inicio"); // Botão para iniciar o jogo
inicioBtn.addEventListener("click", start);
var fundoGamer = document.getElementById("fundoGame"); // Local onde será exibido o jogo
const TECLA = {
	// Teclas para o jogo
	W: "w",
	S: "s",
	D: "d",
};

const posInicialJogador = { x: "8px", y: "179px" };
const posInicialInimigo1 = { x: "700px", y: Math.random() * 334 + "px" };
const posInicialInimigo2 = { x: "775px", y: "425px" };
const posInicialAmigo = { x: "10px", y: "450px" };
const limiteEsquerdoInimigo = -256;
const limiteDireito = 950;

// Sons
const somDisparo = document.getElementById("somDisparo");
const somExplosao = document.getElementById("somExplosao");
const musica = document.getElementById("musica");
const somGameover = document.getElementById("somGameover");
const somPerdido = document.getElementById("somPerdido");
const somResgate = document.getElementById("somResgate");

function criarElement(tipo, id, classe) {
	let ele = document.createElement(tipo);
	if (id) ele.id = id;
	if (classe) ele.className = classe;
	return ele;
}

function setPosicao(elemento, posicao) {
	if (posicao.x) elemento.style.left = posicao.x;
	if (posicao.y) elemento.style.top = posicao.y;
}

function start() {
	inicioBtn.remove();

	// Principais variáveis do jogo
	let jogo = {
		pressionou: [],
		timer: null,
	};
	let velocidadeInimigo1 = 5;
	let velocidadeInimigo2 = 3;
	let podeAtirar = true;
	let fimdejogo = false;
	let pontos = 0;
	let salvos = 0;
	let perdidos = 0;
	let energiaAtual = 3;
	let amigoFlag = true;
	let inimigoFlag = true;

	// Criando elementos do Jogo
	var eleJogador = criarElement("div", "jogador", "anima1");
	var eleInimigo1 = criarElement("div", "inimigo1", "anima2");
	var eleInimigo2 = criarElement("div", "inimigo2");
	var eleAmigo = criarElement("div", "amigo", "anima3");
	var elePlacar = criarElement("div", "placar");
	var eleEnergia = criarElement("div", "energia");

	// Posições Iniciais
	setPosicao(eleJogador, posInicialJogador);
	setPosicao(eleInimigo1, posInicialInimigo1);
	setPosicao(eleInimigo2, posInicialInimigo2);
	setPosicao(eleAmigo, posInicialAmigo);

	// Adicionando os elemento no Jogo
	fundoGamer.appendChild(eleJogador);
	fundoGamer.appendChild(eleInimigo1);
	fundoGamer.appendChild(eleInimigo2);
	fundoGamer.appendChild(eleAmigo);
	fundoGamer.appendChild(elePlacar);
	fundoGamer.appendChild(eleEnergia);

	// Música em loop
	musica.addEventListener(
		"ended",
		function () {
			musica.currentTime = 0;
			musica.play();
		},
		false
	);
	musica.play();

	// Verifica se o usuário pressionou alguma tecla
	document.addEventListener("keydown", (e) => {
		jogo.pressionou[e.key] = true;
	});
	document.addEventListener("keyup", (e) => {
		jogo.pressionou[e.key] = false;
	});

	// Game Loop
	jogo.timer = setInterval(loop, 30);

	function loop() {
		movefundo();
		movejogador();
		moveinimigo1();
		moveinimigo2();
		moveamigo();
		colisao();
		placar();
		energia();
	}

	// Função que movimenta o fundo do jogo
	function movefundo() {
		esquerda = parseInt(fundoGamer.style.backgroundPositionX || 0);
		fundoGamer.style.backgroundPositionX = esquerda - 1 + "px";
	}

	function movejogador() {
		// Moveu para cima
		if (jogo.pressionou[TECLA.W]) {
			let topo = parseInt(eleJogador.style.top);
			let newPos = topo - 10;
			if (newPos > 0) eleJogador.style.top = newPos + "px";
		}

		// Moveu para baixo
		if (jogo.pressionou[TECLA.S]) {
			let topo = parseInt(eleJogador.style.top);
			let newPos = topo + 10;
			if (newPos < 434) eleJogador.style.top = newPos + "px";
		}

		// Atirou
		if (jogo.pressionou[TECLA.D]) {
			disparo();
		}
	}

	function moveinimigo1() {
		let posicaoX = parseInt(eleInimigo1.style.left);
		eleInimigo1.style.left = posicaoX - velocidadeInimigo1 + "px";

		if (posicaoX <= limiteEsquerdoInimigo) {
			eleInimigo1.style.left = posInicialInimigo1.x;
			eleInimigo1.style.top = parseInt(Math.random() * 334) + "px";
		}
	}

	function moveinimigo2() {
		if (inimigoFlag) {
			let posicaoX = parseInt(eleInimigo2.style.left);
			eleInimigo2.style.left = posicaoX - velocidadeInimigo2 + "px";

			if (posicaoX <= limiteEsquerdoInimigo) {
				eleInimigo2.style.left = posInicialInimigo2.x;
			}
		}
	}

	function moveamigo() {
		if (amigoFlag) {
			let posicaoX = parseInt(eleAmigo.style.left);
			eleAmigo.style.left = posicaoX + 1 + "px";

			if (posicaoX >= limiteDireito) {
				eleAmigo.style.left = 0;
			}
		}
	}

	function disparo() {
		if (podeAtirar == true) {
			somDisparo.play();
			podeAtirar = false;

			let posJog = posicaoElemento(eleJogador);
			let posTiroX = posJog.x1 - 50; // -50 para ficar o tiro mais próximo do hericóptero
			let posTiroY = posJog.y + posJog.altura * 0.66; // * 0.66 para ficar a +- 2/3 do topo
			var disparo = criarElement("div", "disparo");

			disparo.style.left = posTiroX + "px";
			disparo.style.top = posTiroY + "px";
			fundoGamer.appendChild(disparo);

			var tempoDisparo = window.setInterval(executaDisparo, 30);
		}

		function executaDisparo() {
			let posicaoX = parseInt(disparo.style.left);
			disparo.style.left = posicaoX + 15 + "px";

			if (posicaoX >= limiteDireito) {
				window.clearInterval(tempoDisparo);
				tempoDisparo = null;
				disparo.remove();
				podeAtirar = true;
			}
		}
	}

	function colisao() {
		let disparo = document.getElementById("disparo");

		// Jogador com o Inimigo1
		if (colide(eleJogador, eleInimigo1)) {
			energiaAtual--;
			explosao1(eleInimigo1);
			reposicionaInimigo1();
		}

		// Jogador com o Inimigo2
		if (colide(eleJogador, eleInimigo2) && inimigoFlag) {
			inimigoFlag = false;
			energiaAtual--;
			explosao1(eleInimigo2);
			eleInimigo2.remove();
			reposicionaInimigo2();
		}

		// Disparo com o Inimigo1
		if (colide(disparo, eleInimigo1)) {
			pontos += 100;
			velocidadeInimigo1 = velocidadeInimigo1 + 0.3;
			explosao1(eleInimigo1);
			disparo.style.left = limiteDireito + "px";
			reposicionaInimigo1();
		}

		// Disparo com o Inimigo2
		if (colide(disparo, eleInimigo2) && inimigoFlag) {
			inimigoFlag = false;
			pontos += 50;
			explosao1(eleInimigo2);
			eleInimigo2.remove();
			disparo.style.left = limiteDireito + "px";
			reposicionaInimigo2();
		}

		// Jogador com o Amigo
		if (colide(eleJogador, eleAmigo) && amigoFlag) {
			amigoFlag = false;
			pontos += 10;
			salvos++;
			somResgate.play();
			eleAmigo.remove();
			reposicionaAmigo();
		}

		// Inimigo2 com o Amigo
		if (colide(eleInimigo2, eleAmigo) && amigoFlag && inimigoFlag) {
			amigoFlag = false;
			pontos -= 50;
			perdidos++;
			explosao2(eleAmigo);
			eleAmigo.remove();
			reposicionaAmigo();
		}
	}

	// Animação Morte Inimigos
	function explosao1(elemento) {
		somExplosao.play();
		let explosao = criarElement("div", "explosao1");
		explosao.style.left = elemento.style.left;
		explosao.style.top = elemento.style.top;
		fundoGamer.appendChild(explosao);
		explosao.style.width = "0";
		explosao.style.opacity = 1;
		explosao.style.backgroundImage = "url(imgs/explosao.png)";

		var tempoExplosao = window.setInterval(removeExplosao, 30);

		function removeExplosao() {
			if (explosao.style.opacity == "0") {
				explosao.remove();
				window.clearInterval(tempoExplosao);
				tempoExplosao = null;
			}
			let tam = parseInt(explosao.style.width);
			let opacity = parseFloat(explosao.style.opacity);
			explosao.style.width = tam + 23 + "px";
			explosao.style.opacity = opacity - 0.1;
		}
	}

	// Animação morte Amigo
	function explosao2(elemento) {
		somPerdido.play();
		let explosao = criarElement("div", "explosao3", "anima4");
		setPosicao(explosao, { x: elemento.style.left, y: elemento.style.top });
		fundoGamer.appendChild(explosao);
		let tempoExplosao3 = window.setInterval(resetaExplosao, 1000);

		function resetaExplosao() {
			explosao.remove();
			window.clearInterval(tempoExplosao3);
			tempoExplosao3 = null;
		}
	}

	function reposicionaInimigo1() {
		let posicaoY = parseInt(Math.random() * 334);
		eleInimigo1.style.left = posInicialInimigo1.x;
		eleInimigo1.style.top = posicaoY + "px";
	}

	function reposicionaInimigo2() {
		var tempoRetorno = window.setInterval(reposiciona, 5000);

		function reposiciona() {
			window.clearInterval(tempoRetorno);
			tempoRetorno = null;

			if (fimdejogo == false) {
				inimigoFlag = true;
				eleInimigo2 = criarElement("div", "inimigo2");
				setPosicao(eleInimigo2, posInicialInimigo2);
				fundoGamer.appendChild(eleInimigo2);
			}
		}
	}

	function reposicionaAmigo() {
		var tempoAmigo = window.setInterval(reposiciona6, 6000);

		function reposiciona6() {
			window.clearInterval(tempoAmigo);
			tempoAmigo = null;

			if (fimdejogo == false) {
				amigoFlag = true;
				eleAmigo = criarElement("div", "amigo", "anima3");
				setPosicao(eleAmigo, posInicialAmigo);
				fundoGamer.appendChild(eleAmigo);
			}
		}
	}

	function placar() {
		elePlacar.innerHTML =
			"<h2> Pontos: " +
			pontos +
			" Salvos: " +
			salvos +
			" Perdidos: " +
			perdidos +
			"</h2>";
	}

	// Barra de energia
	function energia() {
		if (energiaAtual == 3) {
			eleEnergia.style.backgroundImage = "url(imgs/energia3.png)";
		} else if (energiaAtual == 2) {
			eleEnergia.style.backgroundImage = "url(imgs/energia2.png)";
		} else if (energiaAtual == 1) {
			eleEnergia.style.backgroundImage = "url(imgs/energia1.png)";
		} else if (energiaAtual == 0) {
			eleEnergia.style.backgroundImage = "url(imgs/energia0.png)";

			gameOver();
		}
	}

	function gameOver() {
		fimdejogo = true;
		musica.pause();
		somGameover.play();

		window.clearInterval(jogo.timer);
		jogo.timer = null;

		eleJogador.remove();
		eleInimigo1.remove();
		eleInimigo2.remove();
		eleAmigo.remove();
		elePlacar.remove();

		let fim = criarElement("div", "fim");
		fim.innerHTML = `<h1> Game Over </h1><p>Sua pontuação foi: ${pontos}<br>Amigos salvos: ${salvos}<br>Amigos perdidos: ${perdidos}</p><div id='reinicia' onClick='reiniciaJogo()'><h3>Jogar Novamente</h3></div>`;
		fundoGamer.appendChild(fim);
	}
} // Fim da função start

function reiniciaJogo() {
	somGameover.pause();
	document.getElementById("fim").remove();
	start();
}

function colide(ele1, ele2) {
	if (ele1 == null || ele2 == null) return false;
	const posA1 = posicaoElemento(ele1);
	const posB1 = posicaoElemento(ele2);
	const pontoA1 = { x: posA1.x, y: posA1.y };
	const pontoA2 = { x: posA1.x + posA1.largura, y: posA1.y };
	const pontoA3 = { x: posA1.x, y: posA1.y + posA1.altura };
	const pontoA4 = { x: posA1.x + posA1.largura, y: posA1.y + posA1.altura };
	const pontoB1 = { x: posB1.x, y: posB1.y };
	const pontoB2 = { x: posB1.x + posB1.largura, y: posB1.y };
	const pontoB3 = { x: posB1.x, y: posB1.y + posB1.altura };
	const pontoB4 = { x: posB1.x + posB1.largura, y: posB1.y + posB1.altura };
	return pontoInterseccaoArea(pontoA1, posB1) ||
		pontoInterseccaoArea(pontoA2, posB1) ||
		pontoInterseccaoArea(pontoA3, posB1) ||
		pontoInterseccaoArea(pontoA4, posB1) ||
		pontoInterseccaoArea(pontoB1, posA1) ||
		pontoInterseccaoArea(pontoB2, posA1) ||
		pontoInterseccaoArea(pontoB3, posA1) ||
		pontoInterseccaoArea(pontoB4, posA1)
		? true
		: false;
}

function pontoInterseccaoArea(ponto, area) {
	return ponto.x >= area.x &&
		ponto.x <= area.x1 &&
		ponto.y >= area.y &&
		ponto.y <= area.y1
		? true
		: false;
}

function posicaoElemento(e) {
	const x = parseInt(e.style.left); // Coordenada de X no ponto Superior Esquerda
	const y = parseInt(e.style.top); // Coordenada de Y na ponto Superior Esquerda
	// const x = parseInt(e.getBoundingClientRect().left); // Coordenada de X no ponto Superior Esquerda
	// const y = parseInt(e.getBoundingClientRect().top); // Coordenada de Y na ponto Superior Esquerda
	const altura = e.offsetHeight;
	const largura = e.offsetWidth;
	const x1 = x + largura; // Coordenada de X no ponto Inferior Direita
	const y1 = y + altura; // Coordenada de Y no ponto Inferior Direita
	return { x, y, altura, largura, x1, y1 };
}
