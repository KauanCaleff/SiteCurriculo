// Teclas que estao sendo apertadas
const teclas = {};

class ObjetoJogo {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

  distancia(outro) {
    let dx = this.x - outro.x;
    let dy = this.y - outro.y;
    return Math.sqrt(dx * dx + dy * dy);
  }
}

class Carro extends ObjetoJogo {
  constructor(x, y, cor, numero, controles) {
    super(x, y);
    this.xInicial = x;
    this.yInicial = y;
    this.cor = cor;
    this.numero = numero;
    this.controles = controles;
    this.angulo = Math.PI / 2;
    this.velocidade = 0;
    this.voltas = 0;
    this.checkpoint = 0;
    this.saiuDaLargada = false;
  }

  reiniciar() {
    this.x = this.xInicial;
    this.y = this.yInicial;
    this.angulo = Math.PI / 2;
    this.velocidade = 0;
    this.voltas = 0;
    this.checkpoint = 0;
    this.saiuDaLargada = false;
  }

  mover(jogo) {
    if (teclas[this.controles.acelerar]) this.velocidade += 0.12;
    if (teclas[this.controles.frear]) this.velocidade -= 0.12;
    this.velocidade *= 0.99;

    if (teclas[this.controles.esquerda]) this.angulo -= 0.045;
    if (teclas[this.controles.direita]) this.angulo += 0.045;

    let yAntigo = this.y;
    this.x += Math.cos(this.angulo) * this.velocidade;
    this.y += Math.sin(this.angulo) * this.velocidade;

    if (!jogo.naPista(this.x, this.y)) {
      this.velocidade *= 0.78;
    }

    if (this.distancia({x: this.xInicial, y: this.yInicial}) > 80) {
      this.saiuDaLargada = true;
    }

    // Os tres pontos precisam ser visitados na ordem certa
    if (this.saiuDaLargada && this.checkpoint === 0 && jogo.noCheckpoint(this, 1)) {
      this.checkpoint = 1;
    }
    if (this.checkpoint === 1 && jogo.noCheckpoint(this, 2)) {
      this.checkpoint = 2;
    }
    if (this.checkpoint === 2 && jogo.noCheckpoint(this, 3)) {
      this.checkpoint = 3;
    }

    // A linha conta somente quando o carro passa para baixo dela
    if (this.saiuDaLargada && this.checkpoint === 3 && this.x > 45 && this.x < 135 && yAntigo < jogo.linhaChegadaY && this.y >= jogo.linhaChegadaY) {
      this.voltas++;
      this.checkpoint = 0;
    }
  }

  desenhar(ctx) {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.angulo);
    ctx.fillStyle = this.cor;
    ctx.fillRect(-15, -9, 30, 18);
    ctx.fillStyle = '#d8edf2';
    ctx.fillRect(-5, -7, 9, 14);
    ctx.fillStyle = 'white';
    ctx.font = 'bold 9px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(this.numero, 9, 0);
    ctx.fillStyle = 'yellow';
    ctx.beginPath();
    ctx.arc(14, -4, 4, -Math.PI / 2, Math.PI / 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(14, 4, 4, -Math.PI / 2, Math.PI / 2);
    ctx.fill();
    ctx.restore();
  }
}

class Jogo {
  constructor() {
    this.canvas = document.getElementById('gameCanvas');
    this.ctx = this.canvas.getContext('2d');
    this.larguraPista = 86;
    this.linhaChegadaY = 250;

    /*
      A pista é simétrica.
      O lado direito é o espelho do lado esquerdo.
    */
    this.curvas = [
      // Parte superior central para o alto esquerdo
      [400, 170, 360, 120, 310, 70, 240, 70],

      // Alto esquerdo até a curva esquerda
      [240, 70, 140, 70, 70, 140, 80, 250],

      // Curva esquerda até a parte inferior esquerda
      [80, 250, 70, 360, 140, 430, 240, 430],

      // Inferior esquerdo até o centro inferior
      [240, 430, 310, 430, 360, 380, 400, 330],

      // Centro inferior até o inferior direito
      [400, 330, 440, 380, 490, 430, 560, 430],

      // Inferior direito até a curva direita
      [560, 430, 660, 430, 730, 360, 720, 250],

      // Curva direita até a parte superior direita
      [720, 250, 730, 140, 660, 70, 560, 70],

      // Superior direito até o centro superior
      [560, 70, 490, 70, 440, 120, 400, 170]
    ];

    /*
      Os checkpoints ficam em lados diferentes da pista.
      Eles não são desenhados.
    */
    this.checkpoints = [
      { x: 400, y: 330 },
      { x: 720, y: 250 },
      { x: 400, y: 170 }
    ];

    this.pontosPista = [];
    this.criarPontosPista();

    this.jogadores = [
      new Carro(
        65,
        210,
        '#ff3b30',
        '1',
        {
          acelerar: 'KeyW',
          frear: 'KeyS',
          esquerda: 'KeyA',
          direita: 'KeyD'
        }
      ),

      new Carro(
        95,
        210,
        '#29a9ff',
        '2',
        {
          acelerar: 'ArrowUp',
          frear: 'ArrowDown',
          esquerda: 'ArrowLeft',
          direita: 'ArrowRight'
        }
      )
    ];

    this.rodando = false;
    this.overlay = document.getElementById('gameOverlay');
    this.overlayKicker = document.getElementById('overlayKicker');
    this.overlayTitle = document.getElementById('overlayTitle');
    this.overlayText = document.getElementById('overlayText');
    this.volta1Texto = document.getElementById('lap1');
    this.volta2Texto = document.getElementById('lap2');
    this.timerTexto = document.getElementById('timer');
    this.tempoInicio = 0;
    this.tempoRestante = 60;
    this.desenhar();
    this.atualizar();
  }

  criarPontosPista() {
    // Cada curva e dividida em pontos para desenhar e medir a pista
    for (let i = 0; i < this.curvas.length; i++) {
      let c = this.curvas[i];
      for (let passo = 0; passo <= 35; passo++) {
        let t = passo / 35;
        let outroT = 1 - t;
        let x = outroT * outroT * outroT * c[0] + 3 * outroT * outroT * t * c[2] + 3 * outroT * t * t * c[4] + t * t * t * c[6];
        let y = outroT * outroT * outroT * c[1] + 3 * outroT * outroT * t * c[3] + 3 * outroT * t * t * c[5] + t * t * t * c[7];
        this.pontosPista.push({x: x, y: y});
      }
    }
  }

  distanciaAtePista(x, y) {
    let menorDistancia = 10000;

    for (let i = 0; i < this.pontosPista.length; i++) {
      let a = this.pontosPista[i];
      let b = this.pontosPista[(i + 1) % this.pontosPista.length];
      let dx = b.x - a.x;
      let dy = b.y - a.y;
      let tamanho = dx * dx + dy * dy;
      let parte = ((x - a.x) * dx + (y - a.y) * dy) / tamanho;
      parte = Math.max(0, Math.min(1, parte));
      let pertoX = a.x + parte * dx;
      let pertoY = a.y + parte * dy;
      let distancia = Math.sqrt((x - pertoX) * (x - pertoX) + (y - pertoY) * (y - pertoY));
      if (distancia < menorDistancia) menorDistancia = distancia;
    }
    return menorDistancia;
  }

  naPista(x, y) {
    return this.distanciaAtePista(x, y) < this.larguraPista / 2;
  }

  noCheckpoint(carro, numero) {
    let ponto = this.checkpoints[numero - 1];
    return carro.distancia(ponto) < 55;
  }

  iniciar() {
    this.jogadores[0].reiniciar();
    this.jogadores[1].reiniciar();
    this.rodando = true;
    this.tempoInicio = performance.now();
    this.tempoRestante = 60;
    this.overlay.classList.add('hidden');
    document.getElementById('startButton').textContent = 'CORRER NOVAMENTE';
    this.mostrarVoltas();
    this.mostrarTempo();
  }

  terminar() {
    this.rodando = false;
    this.overlay.classList.remove('hidden');
    this.overlayKicker.textContent = 'BANDEIRA QUADRICULADA';
    if (this.jogadores[0].voltas > this.jogadores[1].voltas) {
      this.overlayTitle.textContent = 'Jogador 1 venceu!';
    } else if (this.jogadores[1].voltas > this.jogadores[0].voltas) {
      this.overlayTitle.textContent = 'Jogador 2 venceu!';
    } else {
      this.overlayTitle.textContent = 'Empate!';
    }
    this.overlayText.textContent = 'Placar final: ' + this.jogadores[0].voltas + ' x ' + this.jogadores[1].voltas + ' voltas';
  }

  mostrarVoltas() {
    this.volta1Texto.textContent = this.jogadores[0].voltas + ' voltas';
    this.volta2Texto.textContent = this.jogadores[1].voltas + ' voltas';
  }

  mostrarTempo() {
    this.timerTexto.textContent = 'Tempo: ' + Math.ceil(this.tempoRestante) + 's';
  }

  desenharPista() {
    let ctx = this.ctx;
    let primeiro = this.pontosPista[0];

    ctx.beginPath();
    ctx.moveTo(primeiro.x, primeiro.y);
    for (let i = 1; i < this.pontosPista.length; i++) {
      ctx.lineTo(this.pontosPista[i].x, this.pontosPista[i].y);
    }
    ctx.closePath();
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';

    // O mesmo caminho recebe a borda, o asfalto e a faixa do meio
    ctx.strokeStyle = 'black';
    ctx.lineWidth = this.larguraPista;
    ctx.stroke();
    ctx.strokeStyle = 'gray';
    ctx.lineWidth = this.larguraPista - 8;
    ctx.stroke();
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 2;
    ctx.setLineDash([18, 18]);
    ctx.stroke();
    ctx.setLineDash([]);

    // Linha de largada e chegada; os checkpoints nao aparecem na tela
    ctx.strokeStyle = 'yellow';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(45, this.linhaChegadaY);
    ctx.lineTo(135, this.linhaChegadaY);
    ctx.stroke();
  }

  desenhar() {
    let ctx = this.ctx;
    ctx.fillStyle = 'green';
    ctx.fillRect(0, 0, 800, 500);
    this.desenharPista();

    for (let i = 0; i < this.jogadores.length; i++) {
      this.jogadores[i].desenhar(ctx);
    }
  }

  atualizar() {
    if (this.rodando) {
      this.tempoRestante = 60 - (performance.now() - this.tempoInicio) / 1000;
      if (this.tempoRestante <= 0) {
        this.tempoRestante = 0;
        this.mostrarTempo();
        this.terminar();
      }

      if (this.rodando) {
        for (let i = 0; i < this.jogadores.length; i++) {
          this.jogadores[i].mover(this);
        }

        let carro1 = this.jogadores[0];
        let carro2 = this.jogadores[1];
        if (carro1.distancia(carro2) < 22) {
          carro1.x -= 1;
          carro2.x += 1;
        }
        this.mostrarVoltas();
        this.mostrarTempo();
      }
    }
    this.desenhar();
    requestAnimationFrame(() => this.atualizar());
  }
}

document.addEventListener('keydown', function(evento) {
  teclas[evento.code] = true;
  if (evento.code.indexOf('Arrow') === 0) evento.preventDefault();
});

document.addEventListener('keyup', function(evento) {
  teclas[evento.code] = false;
});

const jogo = new Jogo();
document.getElementById('startButton').addEventListener('click', function() {
  jogo.iniciar();
});
