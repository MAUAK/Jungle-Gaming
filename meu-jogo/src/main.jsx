import { createRoot } from "react-dom/client";

import {
  QueryClient,
  QueryClientProvider
} from "@tanstack/react-query";

import "./index.css";
import App from './App.jsx'
import Game from "./Game.jsx";

// =========================================================
// CLIENTE DO TANSTACK QUERY
// =========================================================

const queryClient = new QueryClient();

// =========================================================
// INICIA O REACT
// =========================================================

createRoot(
  document.getElementById("root")
).render(

  <QueryClientProvider
    client={queryClient}
  >

    <App />
    

  </QueryClientProvider>

);