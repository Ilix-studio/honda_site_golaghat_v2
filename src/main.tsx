import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import { persistor, store } from "./redux-store/store.ts";
import { PersistGate } from "redux-persist/integration/react";
import { registerServiceWorker } from "./lib/registerServiceWorker.tsx";
import { LanguageProvider } from "./lib/language.tsx";
import ConfettiHost from "./mainComponents/shared/ConfettiHost.tsx";
import PageLanguageTranslator from "./mainComponents/shared/PageLanguageTranslator.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <BrowserRouter>
          <LanguageProvider>
            <App />
            <PageLanguageTranslator />
            <ConfettiHost />
          </LanguageProvider>
        </BrowserRouter>
      </PersistGate>
    </Provider>
  </StrictMode>
);

// Register the PWA/FCM service worker and prompt on new versions.
registerServiceWorker();
