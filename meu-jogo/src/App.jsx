import { useState } from "react";
import Game from "./Game";
import api from "./services/api";

function App() {

  // =========================================================
  // ESTADOS
  // =========================================================

  // Nome digitado pelo jogador
  const [nome, setNome] = useState("");

  // ID do jogador no banco de dados
  const [playerId, setPlayerId] = useState(null);

  // Indica se o jogo já foi iniciado
  const [jogoIniciado, setJogoIniciado] = useState(false);

  // Mensagem de erro
  const [erro, setErro] = useState("");


  // =========================================================
  // CADASTRAR JOGADOR E INICIAR
  // =========================================================

  async function iniciarJogo() {

    // Remove espaços do começo e do final
    const nomeLimpo = nome.trim();

    // Verifica se o jogador digitou um nome
    if (nomeLimpo === "") {
      setErro("Digite seu nome para jogar.");
      return;
    }

    // Limpa mensagem de erro
    setErro("");


    try {

      // Envia o nome para o backend
      const resposta = await api.post(
        "/players",
        {
          name: nomeLimpo
        }
      );

      // Dados retornados pelo backend
      const jogador = resposta.data;

      console.log("JOGADOR CRIADO:", jogador);

      // Guarda o ID do jogador
      setPlayerId(jogador.id);

      // Começa o jogo
      setJogoIniciado(true);

    } catch (erroApi) {

      console.error(
        "ERRO AO CADASTRAR JOGADOR:",
        erroApi
      );


      // =====================================================
      // JOGADOR JÁ EXISTE
      // =====================================================

      if (erroApi.response?.status === 409) {

        setErro(
          "Esse nome já está cadastrado. Escolha outro nome."
        );

        return;
      }


      // =====================================================
      // OUTRO ERRO
      // =====================================================

      setErro(
        "Não foi possível conectar ao servidor."
      );
    }
  }


  // =========================================================
  // TELA DE NOME
  // =========================================================

  if (!jogoIniciado) {

    return (
      <div className="tela-nome">

        <h1>MEU JOGO</h1>

        <p>Digite seu nome</p>

        <input
          type="text"
          placeholder="Digite seu nome..."
          value={nome}
          onChange={(event) => {

            setNome(event.target.value);

            // Remove erro quando o usuário começa a digitar
            setErro("");
          }}
          maxLength={20}
        />

        <button onClick={iniciarJogo}>
          JOGAR
        </button>

        {erro && (
          <p
            style={{
              color: "red",
              marginTop: "10px"
            }}
          >
            {erro}
          </p>
        )}

      </div>
    );
  }


  // =========================================================
  // JOGO
  // =========================================================

  return (
    <Game
      nomeJogador={nome}
      playerId={playerId}
    />
  );
}

export default App;