import {
  useMutation,
  useQuery,
  useQueryClient
} from "@tanstack/react-query";

import api from "../services/api";


// =========================================================
// REGISTRAR PARTIDA
// =========================================================

export function useRegistrarPartida() {

  const queryClient =
    useQueryClient();


  return useMutation({

    mutationFn: async (partida) => {

      const resposta =
        await api.post(
          "/matches",
          partida
        );


      return resposta.data;
    },


    onSuccess: () => {

      // Atualiza o histórico

      queryClient.invalidateQueries({
        queryKey: ["historico-partidas"]
      });


      // Atualiza o ranking

      queryClient.invalidateQueries({
        queryKey: ["ranking"]
      });
    }

  });
}


// =========================================================
// HISTÓRICO DE PARTIDAS
// =========================================================

export function useHistoricoPartidas(
  playerId
) {

  return useQuery({

    queryKey: [
      "historico-partidas",
      playerId
    ],


    queryFn: async () => {

      const resposta =
        await api.get(
          `/players/${playerId}/matches?page=1&limit=10`
        );


      return resposta.data;
    },


    enabled: !!playerId

  });
}


// =========================================================
// RANKING
// =========================================================

export function useRanking() {

  return useQuery({

    queryKey: [
      "ranking"
    ],


    queryFn: async () => {

      const resposta =
        await api.get(
          "/ranking?page=1&limit=10"
        );


      return resposta.data;
    }

  });
}