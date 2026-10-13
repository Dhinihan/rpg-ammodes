import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { App } from "./App.tsx"
import "./estilo.css"

const raiz = document.getElementById("raiz")
if (raiz === null) throw new Error("index.html sem #raiz")
createRoot(raiz).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
