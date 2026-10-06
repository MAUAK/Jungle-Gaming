const Database = require("better-sqlite3");
const path = require("path");

// Define onde o banco de dados será criado
const caminhoBanco = path.join(__dirname, "../database/game.db");

// Cria ou abre o banco de dados
const db = new Database(caminhoBanco);

// Ativa as chaves estrangeiras do SQLite
db.pragma("foreign_keys = ON");

// Cria a tabela de jogadores
db.prepare(`
  CREATE TABLE IF NOT EXISTS players (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE
  )
`).run();

// Cria a tabela de partidas
db.prepare(`
  CREATE TABLE IF NOT EXISTS matches (
    id INTEGER PRIMARY KEY AUTOINCREMENT,

    player_id INTEGER NOT NULL,

    score INTEGER NOT NULL,

    duration INTEGER NOT NULL,

    result TEXT NOT NULL CHECK(result IN ('VICTORY', 'DEFEAT')),

    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (player_id) REFERENCES players(id)
  )
`).run();

console.log("Banco de dados conectado!");

module.exports = db;