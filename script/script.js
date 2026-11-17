function openNav() {
  document.getElementById("mySidebar").style.width = "340px";
  document.body.classList.add("menu-aberto");
}

function closeNav() {
  document.getElementById("mySidebar").style.width = "0";
  document.getElementById("main").style.marginLeft = "0";
  document.body.classList.remove("menu-aberto");
}

function mudarFonte(fonte) {
  document.body.style.fontFamily = "'" + fonte + "', Arial, sans-serif";
}

function atualizarProgresso() {
  const barra = document.getElementById("scrollProgress");
  const alturaPagina = document.documentElement.scrollHeight - window.innerHeight;
  const progresso = alturaPagina > 0 ? (window.scrollY / alturaPagina) * 100 : 0;
  barra.style.width = progresso + "%";
}

function revelarSecoes() {
  const elementos = document.querySelectorAll(".reveal");
  const limiteTela = window.innerHeight * 0.86;

  elementos.forEach(function(elemento) {
    const posicao = elemento.getBoundingClientRect().top;

    if (posicao < limiteTela) {
      elemento.classList.add("ativo");
    }
  });
}

window.addEventListener("scroll", function() {
  atualizarProgresso();
  revelarSecoes();
});

window.addEventListener("load", function() {
  atualizarProgresso();
  revelarSecoes();
});

function iniciarCarrosselGaleria() {
  const carrossel = document.querySelector(".carrossel-galeria");
  if (!carrossel) return;

  const slides = Array.from(carrossel.querySelectorAll(".slide-galeria"));
  const botaoVoltar = carrossel.querySelector(".carrossel-voltar");
  const botaoAvancar = carrossel.querySelector(".carrossel-avancar");
  const marcadores = document.querySelector(".marcadores-galeria");
  let slideAtual = 0;

  function normalizarIndice(indice) {
    if (indice < 0) return slides.length - 1;
    if (indice >= slides.length) return 0;
    return indice;
  }

  function atualizarCarrossel() {
    const slideAnterior = normalizarIndice(slideAtual - 1);
    const slideProximo = normalizarIndice(slideAtual + 1);

    slides.forEach(function(slide, indice) {
      slide.classList.remove("ativo", "anterior", "proximo", "oculto");

      if (indice === slideAtual) {
        slide.classList.add("ativo");
        slide.setAttribute("aria-hidden", "false");
      } else if (indice === slideAnterior) {
        slide.classList.add("anterior");
        slide.setAttribute("aria-hidden", "false");
      } else if (indice === slideProximo) {
        slide.classList.add("proximo");
        slide.setAttribute("aria-hidden", "false");
      } else {
        slide.classList.add("oculto");
        slide.setAttribute("aria-hidden", "true");
      }
    });

    if (marcadores) {
      const botoesMarcadores = marcadores.querySelectorAll("button");
      botoesMarcadores.forEach(function(botao, indice) {
        botao.classList.toggle("ativo", indice === slideAtual);
        botao.setAttribute("aria-label", "Exibir imagem " + (indice + 1));
      });
    }
  }

  function irParaSlide(indice) {
    slideAtual = normalizarIndice(indice);
    atualizarCarrossel();
  }

  slides.forEach(function(slide, indice) {
    slide.addEventListener("click", function() {
      if (indice !== slideAtual) {
        irParaSlide(indice);
      }
    });
  });

  if (botaoVoltar) {
    botaoVoltar.addEventListener("click", function() {
      irParaSlide(slideAtual - 1);
    });
  }

  if (botaoAvancar) {
    botaoAvancar.addEventListener("click", function() {
      irParaSlide(slideAtual + 1);
    });
  }

  if (marcadores && marcadores.children.length === 0) {
    slides.forEach(function(_, indice) {
      const botao = document.createElement("button");
      botao.type = "button";
      botao.addEventListener("click", function() {
        irParaSlide(indice);
      });
      marcadores.appendChild(botao);
    });
  }

  atualizarCarrossel();
}

window.addEventListener("load", iniciarCarrosselGaleria);


function atualizarMenuAtivo() {
  const secoes = document.querySelectorAll("header[id], section[id]");
  const links = document.querySelectorAll(".sidebar a[data-nav]");
  let secaoAtual = "home";

  secoes.forEach(function(secao) {
    const topo = secao.getBoundingClientRect().top;
    if (topo <= 180) {
      secaoAtual = secao.id;
    }
  });

  links.forEach(function(link) {
    link.classList.toggle("ativo", link.getAttribute("data-nav") === secaoAtual);
  });
}

function iniciarCursorGlow() {
  const glow = document.getElementById("cursorGlow");
  if (!glow) return;

  window.addEventListener("pointermove", function(evento) {
    glow.classList.add("ativo");
    glow.style.left = evento.clientX + "px";
    glow.style.top = evento.clientY + "px";
  });

  window.addEventListener("pointerleave", function() {
    glow.classList.remove("ativo");
  });
}

function criarParticulasDeFundo() {
  const quantidade = window.innerWidth < 700 ? 12 : 26;

  for (let i = 0; i < quantidade; i++) {
    const particula = document.createElement("span");
    particula.className = "particula-fundo";
    particula.style.left = Math.random() * 100 + "vw";
    particula.style.bottom = -10 - Math.random() * 35 + "vh";
    particula.style.setProperty("--duracao", 10 + Math.random() * 12 + "s");
    particula.style.animationDelay = -Math.random() * 14 + "s";
    particula.style.opacity = String(0.15 + Math.random() * 0.55);
    document.body.appendChild(particula);
  }
}

function iniciarEfeitoTilt() {
  const cards = document.querySelectorAll(".card, .hero-painel, .slide-galeria");

  cards.forEach(function(card) {
    card.addEventListener("mousemove", function(evento) {
      if (window.innerWidth < 980) return;

      const retangulo = card.getBoundingClientRect();
      const x = evento.clientX - retangulo.left;
      const y = evento.clientY - retangulo.top;
      const meioX = retangulo.width / 2;
      const meioY = retangulo.height / 2;
      const giroX = ((y - meioY) / meioY) * -3.5;
      const giroY = ((x - meioX) / meioX) * 3.5;

      card.style.transform = "perspective(900px) rotateX(" + giroX + "deg) rotateY(" + giroY + "deg) translateY(-4px)";
    });

    card.addEventListener("mouseleave", function() {
      card.style.transform = "";
    });
  });
}

function iniciarAtalhosMenu() {
  document.addEventListener("keydown", function(evento) {
    if (evento.key === "Escape") {
      closeNav();
    }
  });
}

window.addEventListener("scroll", atualizarMenuAtivo);
window.addEventListener("load", function() {
  atualizarMenuAtivo();
  iniciarCursorGlow();
  criarParticulasDeFundo();
  iniciarEfeitoTilt();
  iniciarAtalhosMenu();
});
