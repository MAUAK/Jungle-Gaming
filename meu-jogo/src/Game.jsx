import { useEffect, useRef } from "react";

import {
  Application,
  Graphics,
  Text,
  Sprite,
  Assets
} from "pixi.js";

import shipImagem from "./assets/ship_1.png";

import {
  useRegistrarPartida,
  useHistoricoPartidas,
  useRanking
} from "./hooks/usePartidas";


function Game({ nomeJogador }) {

  // ============================================================
  // REFERÊNCIAS DO REACT
  // ============================================================

  const gameRef = useRef(null);

  const rankingRef = useRef(null);

  const historicoRef = useRef(null);


  // ============================================================
  // HOOKS DO BACKEND
  // ============================================================

  const registrarPartida = useRegistrarPartida();

  const {
    data: historicoData
  } = useHistoricoPartidas(1);

  const {
    data: rankingData
  } = useRanking();


  // ============================================================
  // CONFIGURAÇÕES DA TELA
  // ============================================================

  const larguraTela = 800;

  const alturaTela = 600;


  // ============================================================
  // VARIÁVEIS DO PIXI
  // ============================================================

  let app;

  let jogador;

  let painelVida;

  let textoVida;

  let textoScore;

  let textoTempo;

  let textoNome;


  // ============================================================
  // TELAS
  // ============================================================

  let telaMenu;

  let telaRanking;

  let telaHistorico;

  let telaOptions;

  let telaDerrota;

  let telaVitoria;


  // ============================================================
  // VARIÁVEIS DO JOGO
  // ============================================================

  let jogoIniciado = false;

  let jogoTerminou = false;


  // ============================================================
  // JOGADOR
  // ============================================================

  let velocidadeX = 0;

  let velocidadeY = 0;

  const aceleracao = 0.2;

  const atrito = 0.98;

  const velocidadeMaxima = 5;

  const velocidadeRotacao = 0.05;


  // Tamanho aproximado do navio na tela

  const metadeLargura = 30;

  const metadeAltura = 20;


  // ============================================================
  // VIDA
  // ============================================================

  let vida = 100;

  const danoColisao = 25;

  const danoProjetil = 10;


  // ============================================================
  // PONTUAÇÃO
  // ============================================================

  let score = 0;


  // ============================================================
  // TEMPO
  // ============================================================

  let tempoRestante = 60;


  // ============================================================
  // PROJÉTEIS
  // ============================================================

  const projectiles = [];

  const enemyProjectiles = [];


  // ============================================================
  // INIMIGOS
  // ============================================================

  const enemies = [];


  // ============================================================
  // EXPLOSÕES
  // ============================================================

  const explosions = [];


  // ============================================================
  // TECLADO
  // ============================================================

  const teclas = {};


  // ============================================================
  // CONTROLE DE TIROS
  // ============================================================

  let ultimoTiro = 0;


  // ============================================================
  // CRIA O JOGADOR
  // ============================================================

  async function criarJogador() {

    // Carrega a imagem do navio

    const texturaShip = await Assets.load(shipImagem);


    // Cria um Sprite usando a imagem

    jogador = new Sprite(texturaShip);


    // Define o tamanho do navio

    jogador.width = 60;

    jogador.height = 40;


    // Faz o centro do sprite ser seu ponto de referência

    jogador.anchor.set(0.5);


    // Coloca o jogador no centro da tela

    jogador.x = larguraTela / 2;

    jogador.y = alturaTela / 2;


    // Adiciona o navio à tela

    app.stage.addChild(jogador);
  }


  // ============================================================
  // CRIA A INTERFACE
  // ============================================================

  function criarInterface() {

    // ----------------------------------------------------------
    // NOME DO JOGADOR
    // ----------------------------------------------------------

    textoNome = new Text({
      text: `Jogador: ${nomeJogador}`,
      style: {
        fill: 0xffffff,
        fontSize: 18
      }
    });

    textoNome.x = 20;

    textoNome.y = 15;

    app.stage.addChild(textoNome);


    // ----------------------------------------------------------
    // TEXTO DA VIDA
    // ----------------------------------------------------------

    textoVida = new Text({
      text: "Vida: 100",
      style: {
        fill: 0xffffff,
        fontSize: 18
      }
    });

    textoVida.x = 20;

    textoVida.y = 45;

    app.stage.addChild(textoVida);


    // ----------------------------------------------------------
    // BARRA DE VIDA
    // ----------------------------------------------------------

    painelVida = new Graphics();

    painelVida.rect(20, 75, 200, 20);

    painelVida.fill(0x00ff00);

    app.stage.addChild(painelVida);


    // ----------------------------------------------------------
    // SCORE
    // ----------------------------------------------------------

    textoScore = new Text({
      text: "Score: 0",
      style: {
        fill: 0xffffff,
        fontSize: 20
      }
    });

    textoScore.x = 20;

    textoScore.y = 105;

    app.stage.addChild(textoScore);


    // ----------------------------------------------------------
    // TEMPO
    // ----------------------------------------------------------

    textoTempo = new Text({
      text: "Tempo: 60",
      style: {
        fill: 0xffffff,
        fontSize: 20
      }
    });

    textoTempo.x = 680;

    textoTempo.y = 20;

    app.stage.addChild(textoTempo);
  }


  // ============================================================
  // ATUALIZA INTERFACE
  // ============================================================

  function atualizarInterface() {

    // Atualiza vida

    textoVida.text = `Vida: ${Math.max(0, Math.round(vida))}`;


    // Atualiza score

    textoScore.text = `Score: ${score}`;


    // Atualiza tempo

    textoTempo.text = `Tempo: ${Math.ceil(tempoRestante)}`;


    // Remove a barra antiga

    painelVida.clear();


    // Calcula porcentagem da vida

    const porcentagemVida = Math.max(0, vida / 100);


    // Desenha novamente a barra

    painelVida
      .rect(
        20,
        75,
        200 * porcentagemVida,
        20
      )
      .fill(
        vida > 50
          ? 0x00ff00
          : vida > 25
            ? 0xffff00
            : 0xff0000
      );
  }


  // ============================================================
  // CRIA TELA DE DERROTA
  // ============================================================

  function criarTelaDerrota() {

    telaDerrota = new Graphics();

    telaDerrota.rect(
      0,
      0,
      larguraTela,
      alturaTela
    );

    telaDerrota.fill(0x000000);


    // Texto

    const titulo = new Text({
      text: "VOCÊ PERDEU",
      style: {
        fill: 0xff0000,
        fontSize: 50,
        fontWeight: "bold"
      }
    });

    titulo.anchor.set(0.5);

    titulo.x = larguraTela / 2;

    titulo.y = 200;

    telaDerrota.addChild(titulo);


    // Score

    const scoreFinal = new Text({
      text: "Score: 0",
      style: {
        fill: 0xffffff,
        fontSize: 25
      }
    });

    scoreFinal.anchor.set(0.5);

    scoreFinal.x = larguraTela / 2;

    scoreFinal.y = 270;

    telaDerrota.addChild(scoreFinal);


    // Botão jogar novamente

    const botaoNovamente = criarBotao(
      "JOGAR NOVAMENTE",
      330,
      () => {
        telaDerrota.visible = false;

        resetarPartida();
      }
    );

    telaDerrota.addChild(botaoNovamente);


    // Botão menu

    const botaoMenu = criarBotao(
      "MENU PRINCIPAL",
      410,
      () => {
        voltarAoMenu();
      }
    );

    telaDerrota.addChild(botaoMenu);


    telaDerrota.visible = false;

    app.stage.addChild(telaDerrota);
  }


  // ============================================================
  // CRIA TELA DE VITÓRIA
  // ============================================================

  function criarTelaVitoria() {

    telaVitoria = new Graphics();

    telaVitoria.rect(
      0,
      0,
      larguraTela,
      alturaTela
    );

    telaVitoria.fill(0x000000);


    // Texto

    const titulo = new Text({
      text: "VOCÊ VENCEU!",
      style: {
        fill: 0x00ff00,
        fontSize: 50,
        fontWeight: "bold"
      }
    });

    titulo.anchor.set(0.5);

    titulo.x = larguraTela / 2;

    titulo.y = 200;

    telaVitoria.addChild(titulo);


    // Score

    const scoreFinal = new Text({
      text: "Score: 0",
      style: {
        fill: 0xffffff,
        fontSize: 25
      }
    });

    scoreFinal.anchor.set(0.5);

    scoreFinal.x = larguraTela / 2;

    scoreFinal.y = 270;

    telaVitoria.addChild(scoreFinal);


    // Jogar novamente

    const botaoNovamente = criarBotao(
      "JOGAR NOVAMENTE",
      330,
      () => {

        telaVitoria.visible = false;

        resetarPartida();
      }
    );

    telaVitoria.addChild(botaoNovamente);


    // Menu

    const botaoMenu = criarBotao(
      "MENU PRINCIPAL",
      410,
      () => {

        voltarAoMenu();
      }
    );

    telaVitoria.addChild(botaoMenu);


    telaVitoria.visible = false;

    app.stage.addChild(telaVitoria);
  }


  // ============================================================
  // CRIA UM BOTÃO
  // ============================================================

  function criarBotao(texto, y, funcao) {

    const container = new Graphics();


    container
      .roundRect(
        larguraTela / 2 - 120,
        y,
        240,
        55,
        10
      )
      .fill(0x333333);


    const textoBotao = new Text({
      text: texto,
      style: {
        fill: 0xffffff,
        fontSize: 20
      }
    });


    textoBotao.anchor.set(0.5);


    textoBotao.x = larguraTela / 2;

    textoBotao.y = y + 27;


    container.addChild(textoBotao);


    container.eventMode = "static";

    container.cursor = "pointer";


    container.on("pointerdown", funcao);


    return container;
  }


  // ============================================================
  // MENU PRINCIPAL
  // ============================================================

  function criarMenu() {

    telaMenu = new Graphics();


    const titulo = new Text({
      text: "NAVAL GAME",
      style: {
        fill: 0xffffff,
        fontSize: 50,
        fontWeight: "bold"
      }
    });


    titulo.anchor.set(0.5);

    titulo.x = larguraTela / 2;

    titulo.y = 70;


    telaMenu.addChild(titulo);


    // PLAY

    const play = criarBotao(
      "PLAY",
      160,
      () => {

        iniciarPartida();
      }
    );

    telaMenu.addChild(play);


    // Ranking

    const ranking = criarBotao(
      "RANKING",
      240,
      () => {

        mostrarRanking();
      }
    );

    telaMenu.addChild(ranking);


    // Histórico

    const historico = criarBotao(
      "HISTÓRICO",
      320,
      () => {

        mostrarHistorico();
      }
    );

    telaMenu.addChild(historico);


    // Options

    const options = criarBotao(
      "OPTIONS",
      400,
      () => {

        mostrarOptions();
      }
    );

    telaMenu.addChild(options);


    app.stage.addChild(telaMenu);
  }


  // ============================================================
  // ESCONDE MENU
  // ============================================================

  function esconderMenuPrincipal() {

    telaMenu.visible = false;
  }


  // ============================================================
  // MOSTRA MENU
  // ============================================================

  function mostrarMenuPrincipal() {

    telaMenu.visible = true;

    telaRanking.visible = false;

    telaHistorico.visible = false;

    telaOptions.visible = false;

    telaDerrota.visible = false;

    telaVitoria.visible = false;
  }


  // ============================================================
  // VOLTAR AO MENU
  // ============================================================

  function voltarAoMenu() {

    jogoIniciado = false;

    jogoTerminou = true;


    telaVitoria.visible = false;

    telaDerrota.visible = false;


    mostrarMenuPrincipal();
  }


  // ============================================================
  // INICIAR PARTIDA
  // ============================================================

  function iniciarPartida() {

    esconderMenuPrincipal();

    telaRanking.visible = false;

    telaHistorico.visible = false;

    telaOptions.visible = false;

    resetarPartida();
  }


  // ============================================================
  // RESETAR PARTIDA
  // ============================================================

  function resetarPartida() {

    jogoIniciado = true;

    jogoTerminou = false;


    // Vida

    vida = 100;


    // Score

    score = 0;


    // Tempo

    tempoRestante = 60;


    // Velocidade

    velocidadeX = 0;

    velocidadeY = 0;


    // Tiro

    ultimoTiro = 0;


    // Remove projéteis

    projectiles.forEach((projetil) => {

      projetil.destroy();
    });

    projectiles.length = 0;


    // Remove projéteis inimigos

    enemyProjectiles.forEach((projetil) => {

      projetil.destroy();
    });

    enemyProjectiles.length = 0;


    // Remove inimigos

    enemies.forEach((enemy) => {

      enemy.sprite.destroy();
    });

    enemies.length = 0;


    // Remove explosões

    explosions.forEach((explosao) => {

      explosao.graphics.destroy();
    });

    explosions.length = 0;


    // Recoloca jogador

    if (jogador) {

      jogador.visible = true;

      jogador.x = larguraTela / 2;

      jogador.y = alturaTela / 2;

      jogador.rotation = 0;
    }


    atualizarInterface();
  }


  // ============================================================
  // CONFIGURA TECLADO
  // ============================================================

  function configurarTeclado() {

    function keyDown(event) {

      teclas[event.key.toLowerCase()] = true;


      // Tiro frontal

      if (
        event.code === "Space" &&
        jogoIniciado &&
        !jogoTerminou
      ) {

        disparar();
      }


      // Tiro lateral esquerdo

      if (
        event.key.toLowerCase() === "q" &&
        jogoIniciado &&
        !jogoTerminou
      ) {

        dispararLateral(-1);
      }


      // Tiro lateral direito

      if (
        event.key.toLowerCase() === "e" &&
        jogoIniciado &&
        !jogoTerminou
      ) {

        dispararLateral(1);
      }
    }


    function keyUp(event) {

      teclas[event.key.toLowerCase()] = false;
    }


    window.addEventListener(
      "keydown",
      keyDown
    );

    window.addEventListener(
      "keyup",
      keyUp
    );


    return () => {

      window.removeEventListener(
        "keydown",
        keyDown
      );

      window.removeEventListener(
        "keyup",
        keyUp
      );
    };
  }


  // ============================================================
  // DISPARO FRONTAL
  // ============================================================

  function disparar() {

    if (!jogador) return;


    const projetil = new Graphics();


    projetil
      .rect(-4, -2, 8, 4)
      .fill(0xffff00);


    // Direção do navio

    const direcaoX =
      Math.cos(jogador.rotation);

    const direcaoY =
      Math.sin(jogador.rotation);


    // Coloca o tiro na frente do navio

    projetil.x =
      jogador.x +
      direcaoX * 35;

    projetil.y =
      jogador.y +
      direcaoY * 35;


    projetil.vx = direcaoX * 8;

    projetil.vy = direcaoY * 8;


    app.stage.addChild(projetil);


    projectiles.push(projetil);
  }


  // ============================================================
  // DISPARO LATERAL
  // ============================================================

  function dispararLateral(lado) {

    if (!jogador) return;


    const direcaoX =
      Math.cos(jogador.rotation);

    const direcaoY =
      Math.sin(jogador.rotation);


    // Vetor perpendicular

    const perpendicularX = -direcaoY * lado;

    const perpendicularY = direcaoX * lado;


    // Três tiros paralelos

    for (let i = -1; i <= 1; i++) {

      const projetil = new Graphics();


      projetil
        .rect(-4, -2, 8, 4)
        .fill(0x00ffff);


      // Pequena separação entre os três tiros

      const deslocamentoX =
        direcaoX * i * 10;

      const deslocamentoY =
        direcaoY * i * 10;


      projetil.x =
        jogador.x +
        perpendicularX * 25 +
        deslocamentoX;


      projetil.y =
        jogador.y +
        perpendicularY * 25 +
        deslocamentoY;


      projetil.vx =
        perpendicularX * 8;


      projetil.vy =
        perpendicularY * 8;


      app.stage.addChild(projetil);


      projectiles.push(projetil);
    }
  }


  // ============================================================
  // CRIA INIMIGO
  // ============================================================

  function criarInimigo() {

    if (!jogador) return;


    const enemy = new Graphics();


    const tipo =
      Math.random() < 0.5
        ? "chaser"
        : "shooter";


    // ----------------------------------------------------------
    // CHASER
    // ----------------------------------------------------------

    if (tipo === "chaser") {

      enemy
        .rect(-20, -20, 40, 40)
        .fill(0x9900ff);
    }


    // ----------------------------------------------------------
    // SHOOTER
    // ----------------------------------------------------------

    else {

      enemy
        .rect(-20, -20, 40, 40)
        .fill(0xff8800);
    }


    // Posição aleatória na borda

    const lado =
      Math.floor(Math.random() * 4);


    if (lado === 0) {

      enemy.x = 20;

      enemy.y =
        Math.random() * alturaTela;
    }

    else if (lado === 1) {

      enemy.x = larguraTela - 20;

      enemy.y =
        Math.random() * alturaTela;
    }

    else if (lado === 2) {

      enemy.x =
        Math.random() * larguraTela;

      enemy.y = 20;
    }

    else {

      enemy.x =
        Math.random() * larguraTela;

      enemy.y =
        alturaTela - 20;
    }


    enemy.tipo = tipo;

    enemy.vida = 1;

    enemy.cooldown = 0;


    app.stage.addChild(enemy);


    enemies.push({
      sprite: enemy,
      tipo: tipo
    });
  }


  // ============================================================
  // DISPARO DO INIMIGO
  // ============================================================

  function dispararInimigo(enemy) {

    if (!jogador) return;


    const dx =
      jogador.x - enemy.x;

    const dy =
      jogador.y - enemy.y;


    const distancia =
      Math.sqrt(
        dx * dx +
        dy * dy
      );


    if (distancia === 0) return;


    const direcaoX =
      dx / distancia;

    const direcaoY =
      dy / distancia;


    const projetil = new Graphics();


    projetil
      .rect(-4, -2, 8, 4)
      .fill(0xff0000);


    projetil.x = enemy.x;

    projetil.y = enemy.y;


    projetil.vx =
      direcaoX * 5;

    projetil.vy =
      direcaoY * 5;


    app.stage.addChild(projetil);


    enemyProjectiles.push(projetil);
  }


  // ============================================================
  // EXPLOSÃO
  // ============================================================

  function criarExplosao(x, y) {

    const graphics = new Graphics();


    graphics
      .circle(0, 0, 20)
      .fill(0xffaa00);


    graphics.x = x;

    graphics.y = y;


    app.stage.addChild(graphics);


    explosions.push({
      graphics: graphics,
      vida: 20
    });
  }


  // ============================================================
  // DANO NO JOGADOR
  // ============================================================

  function receberDano(valor) {

    if (jogoTerminou) return;


    vida -= valor;


    if (vida <= 0) {

      vida = 0;

      derrotarJogador();
    }


    atualizarInterface();
  }


  // ============================================================
  // DERROTA
  // ============================================================

  function derrotarJogador() {

    if (jogoTerminou) return;


    jogoTerminou = true;

    jogoIniciado = false;


    criarExplosao(
      jogador.x,
      jogador.y
    );


    jogador.visible = false;


    registrarPartida.mutate({
      playerId: 1,
      score: score,
      duration: Math.round(60 - tempoRestante),
      result: "DEFEAT"
    });


    mostrarTelaDerrota();
  }


  // ============================================================
  // VITÓRIA
  // ============================================================

  function vencerJogo() {

    if (jogoTerminou) return;


    jogoTerminou = true;

    jogoIniciado = false;


    registrarPartida.mutate({
      playerId: 1,
      score: score,
      duration: 60,
      result: "VICTORY"
    });


    mostrarTelaVitoria();
  }


  // ============================================================
  // MOSTRAR DERROTA
  // ============================================================

  function mostrarTelaDerrota() {

    const texto =
      telaDerrota.children.find(
        (child) =>
          child instanceof Text &&
          child.text.startsWith("Score:")
      );


    if (texto) {

      texto.text =
        `Score: ${score}`;
    }


    telaDerrota.visible = true;
  }


  // ============================================================
  // MOSTRAR VITÓRIA
  // ============================================================

  function mostrarTelaVitoria() {

    const texto =
      telaVitoria.children.find(
        (child) =>
          child instanceof Text &&
          child.text.startsWith("Score:")
      );


    if (texto) {

      texto.text =
        `Score: ${score}`;
    }


    telaVitoria.visible = true;
  }


  // ============================================================
  // RANKING
  // ============================================================

  function criarTelaRanking() {

    telaRanking = new Graphics();


    const titulo = new Text({
      text: "RANKING",
      style: {
        fill: 0xffffff,
        fontSize: 40,
        fontWeight: "bold"
      }
    });


    titulo.anchor.set(0.5);

    titulo.x = larguraTela / 2;

    titulo.y = 60;


    telaRanking.addChild(titulo);


    rankingRef.current = new Text({
      text: "Carregando...",
      style: {
        fill: 0xffffff,
        fontSize: 20
      }
    });


    rankingRef.current.x = 180;

    rankingRef.current.y = 130;


    telaRanking.addChild(
      rankingRef.current
    );


    const voltar = criarBotao(
      "VOLTAR",
      500,
      () => {

        mostrarMenuPrincipal();
      }
    );


    telaRanking.addChild(voltar);


    telaRanking.visible = false;


    app.stage.addChild(
      telaRanking
    );
  }


  // ============================================================
  // MOSTRAR RANKING
  // ============================================================

  function mostrarRanking() {

    esconderMenuPrincipal();


    telaRanking.visible = true;


    atualizarRanking();
  }


  // ============================================================
  // ATUALIZAR RANKING
  // ============================================================

  function atualizarRanking() {

    if (!rankingRef.current) return;


    if (!rankingData) {

      rankingRef.current.text =
        "Carregando ranking...";

      return;
    }


    let texto = "";


    rankingData.players.forEach(
      (player) => {

        texto +=
          `${player.position}. ${player.name} - ${player.score}\n`;
      }
    );


    if (texto === "") {

      texto = "Nenhum jogador ainda.";
    }


    rankingRef.current.text = texto;
  }


  // ============================================================
  // HISTÓRICO
  // ============================================================

  function criarTelaHistorico() {

    telaHistorico = new Graphics();


    const titulo = new Text({
      text: "HISTÓRICO",
      style: {
        fill: 0xffffff,
        fontSize: 40,
        fontWeight: "bold"
      }
    });


    titulo.anchor.set(0.5);

    titulo.x = larguraTela / 2;

    titulo.y = 60;


    telaHistorico.addChild(titulo);


    historicoRef.current = new Text({
      text: "Carregando...",
      style: {
        fill: 0xffffff,
        fontSize: 18
      }
    });


    historicoRef.current.x = 130;

    historicoRef.current.y = 130;


    telaHistorico.addChild(
      historicoRef.current
    );


    const voltar = criarBotao(
      "VOLTAR",
      500,
      () => {

        mostrarMenuPrincipal();
      }
    );


    telaHistorico.addChild(voltar);


    telaHistorico.visible = false;


    app.stage.addChild(
      telaHistorico
    );
  }


  // ============================================================
  // MOSTRAR HISTÓRICO
  // ============================================================

  function mostrarHistorico() {

    esconderMenuPrincipal();


    telaHistorico.visible = true;


    atualizarHistorico();
  }


  // ============================================================
  // ATUALIZAR HISTÓRICO
  // ============================================================

  function atualizarHistorico() {

    if (!historicoRef.current) return;


    if (!historicoData) {

      historicoRef.current.text =
        "Carregando histórico...";

      return;
    }


    let texto = "";


    historicoData.matches.forEach(
      (partida) => {

        const resultado =
          partida.result === "VICTORY"
            ? "VITÓRIA"
            : "DERROTA";


        texto +=
          `${resultado} | Score: ${partida.score} | Tempo: ${partida.duration}s\n`;
      }
    );


    if (texto === "") {

      texto =
        "Nenhuma partida registrada.";
    }


    historicoRef.current.text =
      texto;
  }


  // ============================================================
  // OPTIONS
  // ============================================================

  function criarTelaOptions() {

    telaOptions = new Graphics();


    const titulo = new Text({
      text: "OPTIONS",
      style: {
        fill: 0xffffff,
        fontSize: 40,
        fontWeight: "bold"
      }
    });


    titulo.anchor.set(0.5);

    titulo.x = larguraTela / 2;

    titulo.y = 100;


    telaOptions.addChild(titulo);


    const controles = new Text({
      text:
        "CONTROLES\n\n" +
        "W / ↑  - Acelerar\n" +
        "A / ←  - Girar para esquerda\n" +
        "D / →  - Girar para direita\n" +
        "ESPAÇO - Atirar\n" +
        "Q - Atirar para esquerda\n" +
        "E - Atirar para direita",
      style: {
        fill: 0xffffff,
        fontSize: 20,
        align: "center"
      }
    });


    controles.anchor.set(0.5);

    controles.x = larguraTela / 2;

    controles.y = 290;


    telaOptions.addChild(controles);


    const voltar = criarBotao(
      "VOLTAR",
      500,
      () => {

        mostrarMenuPrincipal();
      }
    );


    telaOptions.addChild(voltar);


    telaOptions.visible = false;


    app.stage.addChild(
      telaOptions
    );
  }


  // ============================================================
  // MOSTRAR OPTIONS
  // ============================================================

  function mostrarOptions() {

    esconderMenuPrincipal();


    telaOptions.visible = true;
  }


  // ============================================================
  // LOOP DO JOGO
  // ============================================================

  function iniciarLoop() {

    app.ticker.add(
      (ticker) => {

        // DeltaTime do Pixi

        const delta =
          ticker.deltaTime;


        // Se o jogo não estiver acontecendo,
        // não atualiza as mecânicas

        if (
          !jogoIniciado ||
          jogoTerminou
        ) {

          atualizarRanking();

          atualizarHistorico();

          return;
        }


        // ======================================================
        // TEMPO
        // ======================================================

        tempoRestante -=
          delta / 60;


        if (tempoRestante <= 0) {

          tempoRestante = 0;

          atualizarInterface();

          vencerJogo();

          return;
        }


        // ======================================================
        // ROTAÇÃO
        // ======================================================

        if (
          teclas["a"] ||
          teclas["arrowleft"]
        ) {

          jogador.rotation -=
            velocidadeRotacao * delta;
        }


        if (
          teclas["d"] ||
          teclas["arrowright"]
        ) {

          jogador.rotation +=
            velocidadeRotacao * delta;
        }


        // ======================================================
        // ACELERAÇÃO
        // ======================================================

        if (
          teclas["w"] ||
          teclas["arrowup"]
        ) {

          const direcaoX =
            Math.cos(jogador.rotation);

          const direcaoY =
            Math.sin(jogador.rotation);


          velocidadeX +=
            direcaoX *
            aceleracao *
            delta;


          velocidadeY +=
            direcaoY *
            aceleracao *
            delta;


          // Limita velocidade

          const velocidade =
            Math.sqrt(
              velocidadeX *
                velocidadeX +
              velocidadeY *
                velocidadeY
            );


          if (
            velocidade >
            velocidadeMaxima
          ) {

            velocidadeX =
              (velocidadeX /
                velocidade) *
              velocidadeMaxima;


            velocidadeY =
              (velocidadeY /
                velocidade) *
              velocidadeMaxima;
          }
        }


        // ======================================================
        // ATRITO / INÉRCIA
        // ======================================================

        velocidadeX *=
          Math.pow(
            atrito,
            delta
          );


        velocidadeY *=
          Math.pow(
            atrito,
            delta
          );


        // ======================================================
        // MOVIMENTO
        // ======================================================

        jogador.x +=
          velocidadeX *
          delta;


        jogador.y +=
          velocidadeY *
          delta;


        // ======================================================
        // LIMITES DA TELA
        // ======================================================

        jogador.x = Math.max(
          metadeLargura,
          Math.min(
            larguraTela -
              metadeLargura,
            jogador.x
          )
        );


        jogador.y = Math.max(
          metadeAltura,
          Math.min(
            alturaTela -
              metadeAltura,
            jogador.y
          )
        );


        // ======================================================
        // ATUALIZA PROJÉTEIS DO JOGADOR
        // ======================================================

        for (
          let i =
            projectiles.length - 1;
          i >= 0;
          i--
        ) {

          const projetil =
            projectiles[i];


          projetil.x +=
            projetil.vx *
            delta;


          projetil.y +=
            projetil.vy *
            delta;


          // Remove se sair da tela

          if (
            projetil.x < -20 ||
            projetil.x > larguraTela + 20 ||
            projetil.y < -20 ||
            projetil.y > alturaTela + 20
          ) {

            projetil.destroy();

            projectiles.splice(i, 1);

            continue;
          }


          // ====================================================
          // COLISÃO COM INIMIGOS
          // ====================================================

          for (
            let j =
              enemies.length - 1;
            j >= 0;
            j--
          ) {

            const enemy =
              enemies[j].sprite;


            const dx =
              projetil.x -
              enemy.x;


            const dy =
              projetil.y -
              enemy.y;


            const distancia =
              Math.sqrt(
                dx * dx +
                dy * dy
              );


            if (
              distancia < 25
            ) {

              criarExplosao(
                enemy.x,
                enemy.y
              );


              enemy.destroy();


              enemies.splice(j, 1);


              projetil.destroy();


              projectiles.splice(
                i,
                1
              );


              score++;


              break;
            }
          }
        }


        // ======================================================
        // PROJÉTEIS DOS INIMIGOS
        // ======================================================

        for (
          let i =
            enemyProjectiles.length - 1;
          i >= 0;
          i--
        ) {

          const projetil =
            enemyProjectiles[i];


          projetil.x +=
            projetil.vx *
            delta;


          projetil.y +=
            projetil.vy *
            delta;


          // Fora da tela

          if (
            projetil.x < -20 ||
            projetil.x >
              larguraTela + 20 ||
            projetil.y < -20 ||
            projetil.y >
              alturaTela + 20
          ) {

            projetil.destroy();

            enemyProjectiles.splice(
              i,
              1
            );

            continue;
          }


          // Colisão com jogador

          const dx =
            projetil.x -
            jogador.x;


          const dy =
            projetil.y -
            jogador.y;


          const distancia =
            Math.sqrt(
              dx * dx +
              dy * dy
            );


          if (
            distancia < 20
          ) {

            projetil.destroy();


            enemyProjectiles.splice(
              i,
              1
            );


            receberDano(
              danoProjetil
            );
          }
        }


        // ======================================================
        // INIMIGOS
        // ======================================================

        for (
          let i =
            enemies.length - 1;
          i >= 0;
          i--
        ) {

          const enemyData =
            enemies[i];


          const enemy =
            enemyData.sprite;


          const dx =
            jogador.x -
            enemy.x;


          const dy =
            jogador.y -
            enemy.y;


          const distancia =
            Math.sqrt(
              dx * dx +
              dy * dy
            );


          // ====================================================
          // CHASER
          // ====================================================

          if (
            enemyData.tipo ===
            "chaser"
          ) {

            if (
              distancia > 0
            ) {

              enemy.x +=
                (dx / distancia) *
                2 *
                delta;


              enemy.y +=
                (dy / distancia) *
                2 *
                delta;
            }


            // Colisão com jogador

            if (
              distancia < 35
            ) {

              receberDano(
                danoColisao
              );


              criarExplosao(
                enemy.x,
                enemy.y
              );


              enemy.destroy();


              enemies.splice(
                i,
                1
              );
            }
          }


          // ====================================================
          // SHOOTER
          // ====================================================

          else {

            // Aproxima até 300 pixels

            if (
              distancia > 300
            ) {

              if (
                distancia > 0
              ) {

                enemy.x +=
                  (dx / distancia) *
                  1.5 *
                  delta;


                enemy.y +=
                  (dy / distancia) *
                  1.5 *
                  delta;
              }
            }


            // Cooldown do tiro

            enemyData.cooldown -=
              delta;


            if (
              distancia <= 300 &&
              enemyData.cooldown <= 0
            ) {

              dispararInimigo(
                enemy
              );


              enemyData.cooldown =
                90;
            }


            // Colisão direta

            if (
              distancia < 35
            ) {

              receberDano(
                danoColisao
              );


              criarExplosao(
                enemy.x,
                enemy.y
              );


              enemy.destroy();


              enemies.splice(
                i,
                1
              );
            }
          }
        }


        // ======================================================
        // CRIA NOVOS INIMIGOS
        // ======================================================

        ultimoTiro +=
          delta;


        if (
          ultimoTiro >= 180
        ) {

          criarInimigo();

          ultimoTiro = 0;
        }


        // ======================================================
        // EXPLOSÕES
        // ======================================================

        for (
          let i =
            explosions.length - 1;
          i >= 0;
          i--
        ) {

          const explosao =
            explosions[i];


          explosao.vida -=
            delta;


          explosao.graphics.scale.x +=
            0.03 * delta;


          explosao.graphics.scale.y +=
            0.03 * delta;


          explosao.graphics.alpha =
            explosao.vida / 20;


          if (
            explosao.vida <= 0
          ) {

            explosao.graphics.destroy();


            explosions.splice(
              i,
              1
            );
          }
        }


        // ======================================================
        // ATUALIZA INTERFACE
        // ======================================================

        atualizarInterface();
      }
    );
  }


  // ============================================================
  // INICIALIZA O JOGO
  // ============================================================

  useEffect(() => {

    let removerTeclado;


    async function iniciar() {

      // Cria aplicação Pixi

      app = new Application();


      // Inicializa Pixi

      await app.init({
        width: larguraTela,
        height: alturaTela,
        background: "#222222",
        antialias: true
      });


      // Adiciona canvas ao React

      if (
        gameRef.current
      ) {

        gameRef.current.appendChild(
          app.canvas
        );
      }


      // Cria jogador usando a imagem

      await criarJogador();


      // Cria interface

      criarInterface();


      // Cria telas

      criarTelaDerrota();

      criarTelaVitoria();

      criarMenu();

      criarTelaOptions();

      criarTelaRanking();

      criarTelaHistorico();


      // Configura teclado

      removerTeclado =
        configurarTeclado();


      // Inicia loop

      iniciarLoop();
    }


    iniciar();


    // ==========================================================
    // LIMPEZA
    // ==========================================================

    return () => {

      if (removerTeclado) {

        removerTeclado();
      }


      if (app) {

        app.destroy(
          true,
          true
        );
      }
    };

  }, []);


  // ============================================================
  // ATUALIZA RANKING/HISTÓRICO QUANDO OS DADOS CHEGAM
  // ============================================================

  useEffect(() => {

    if (rankingData) {

      atualizarRanking();
    }

  }, [rankingData]);


  useEffect(() => {

    if (historicoData) {

      atualizarHistorico();
    }

  }, [historicoData]);


  // ============================================================
  // HTML DO REACT
  // ============================================================

  return (
    <div
      ref={gameRef}
      style={{
        width: "800px",
        height: "600px",
        margin: "0 auto"
      }}
    />
  );
}


export default Game;