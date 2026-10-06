const express = require("express");
const cors = require("cors");

const db = require("./database");

const app = express();

// Permite que o frontend React faça requisições
app.use(cors());

// Permite receber JSON
app.use(express.json());

const PORT = 3000;


// ======================================================
// TESTE DA API
// ======================================================

app.get("/api", (req, res) => {
  res.json({
    message: "API do Naval Game funcionando!"
  });
});


// ======================================================
// CRIAR JOGADOR
// ======================================================

app.post("/api/players", (req, res) => {
  const { name } = req.body;

  if (!name) {
    return res.status(400).json({
      error: "Nome do jogador é obrigatório."
    });
  }

  try {
    const resultado = db.prepare(`
      INSERT INTO players (name)
      VALUES (?)
    `).run(name);

    const jogador = db.prepare(`
      SELECT id, name
      FROM players
      WHERE id = ?
    `).get(resultado.lastInsertRowid);

    res.status(201).json(jogador);

  } catch (error) {

    if (error.code === "SQLITE_CONSTRAINT_UNIQUE") {
      return res.status(409).json({
        error: "Esse jogador já existe."
      });
    }

    console.error(error);

    res.status(500).json({
      error: "Erro ao criar jogador."
    });
  }
});


// ======================================================
// REGISTRAR PARTIDA
// ======================================================

app.post("/api/matches", (req, res) => {

  const {
    playerId,
    score,
    duration,
    result
  } = req.body;


  // Validação
  if (
    playerId === undefined ||
    score === undefined ||
    duration === undefined ||
    !result
  ) {
    return res.status(400).json({
      error: "playerId, score, duration e result são obrigatórios."
    });
  }


  // Verifica se o resultado é válido
  if (!["VICTORY", "DEFEAT"].includes(result)) {
    return res.status(400).json({
      error: "result deve ser VICTORY ou DEFEAT."
    });
  }


  // Verifica se o jogador existe
  const jogador = db.prepare(`
    SELECT id, name
    FROM players
    WHERE id = ?
  `).get(playerId);


  if (!jogador) {
    return res.status(404).json({
      error: "Jogador não encontrado."
    });
  }


  // Insere a partida
  const resultado = db.prepare(`
    INSERT INTO matches (
      player_id,
      score,
      duration,
      result
    )
    VALUES (?, ?, ?, ?)
  `).run(
    playerId,
    score,
    duration,
    result
  );


  // Busca a partida criada
  const partida = db.prepare(`
    SELECT
      id,
      player_id AS playerId,
      score,
      duration,
      result,
      created_at AS createdAt
    FROM matches
    WHERE id = ?
  `).get(resultado.lastInsertRowid);


  res.status(201).json(partida);
});


// ======================================================
// HISTÓRICO DE PARTIDAS DO JOGADOR
// ======================================================

app.get("/api/players/:playerId/matches", (req, res) => {

  const playerId = Number(req.params.playerId);

  const page = Math.max(
    Number(req.query.page) || 1,
    1
  );

  const limit = Math.min(
    Math.max(Number(req.query.limit) || 10, 1),
    100
  );

  const offset = (page - 1) * limit;


  // Conta quantas partidas o jogador possui
  const totalResultado = db.prepare(`
    SELECT COUNT(*) AS total
    FROM matches
    WHERE player_id = ?
  `).get(playerId);


  const total = totalResultado.total;


  // Busca as partidas da página
  const partidas = db.prepare(`
    SELECT
      id,
      player_id AS playerId,
      score,
      duration,
      result,
      created_at AS createdAt
    FROM matches
    WHERE player_id = ?
    ORDER BY created_at DESC, id DESC
    LIMIT ? OFFSET ?
  `).all(
    playerId,
    limit,
    offset
  );


  const totalPages = Math.ceil(total / limit);


  res.json({
    page,
    limit,
    total,
    totalPages,
    matches: partidas
  });
});


// ======================================================
// RANKING
// ======================================================

app.get("/api/ranking", (req, res) => {

  const page = Math.max(
    Number(req.query.page) || 1,
    1
  );

  const limit = Math.min(
    Math.max(Number(req.query.limit) || 10, 1),
    100
  );

  const offset = (page - 1) * limit;


  // Quantidade de jogadores no ranking
  const totalResultado = db.prepare(`
    SELECT COUNT(*) AS total
    FROM players
  `).get();


  const total = totalResultado.total;


  /*
    Cada jogador aparece apenas uma vez.

    O score utilizado no ranking é
    a maior pontuação que o jogador conseguiu.
  */
  const jogadores = db.prepare(`
    SELECT
      players.id,
      players.name,
      MAX(matches.score) AS score

    FROM players

    INNER JOIN matches
      ON matches.player_id = players.id

    GROUP BY players.id

    ORDER BY score DESC, players.name ASC

    LIMIT ? OFFSET ?
  `).all(
    limit,
    offset
  );


  const totalPages = Math.ceil(total / limit);


  // Calcula a posição de cada jogador
  const jogadoresComPosicao = jogadores.map(
    (jogador, index) => ({
      position: offset + index + 1,
      id: jogador.id,
      name: jogador.name,
      score: jogador.score
    })
  );


  res.json({
    page,
    limit,
    total,
    totalPages,
    players: jogadoresComPosicao
  });
});


// ======================================================
// INICIAR SERVIDOR
// ======================================================

// ======================================================
// INICIAR SERVIDOR
// ======================================================

app.listen(PORT, () => {
  console.log("========================================");
  console.log(" NAVAL GAME API");
  console.log("========================================");
  console.log(`Servidor rodando em http://localhost:${PORT}`);
  console.log("========================================");
});