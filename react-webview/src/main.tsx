import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";

const data = (window as any).INITIAL_DATA;

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App data={data} />
  </StrictMode>,
);
