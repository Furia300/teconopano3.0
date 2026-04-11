import { createRoot } from "react-dom/client";
import App from "./App";
import { TecnopanoThemeProvider } from "./hooks/useTecnopanoTheme";
import "./styles/globals.css";

createRoot(document.getElementById("root")!).render(
  <TecnopanoThemeProvider>
    <App />
  </TecnopanoThemeProvider>,
);
