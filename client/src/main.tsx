import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { ApolloProvider } from "@apollo/client";
import { Toaster } from "sonner";
import { apolloClient } from "./shared/apollo/client";
import { AuthProvider } from "./features/auth/AuthContext";
import { ThemeProvider } from "./shared/ThemeContext";
import { ErrorBoundary } from "./shared/ErrorBoundary";
import { App } from "./App";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <ApolloProvider client={apolloClient}>
        <AuthProvider>
          <ThemeProvider>
            <ErrorBoundary>
              <App />
            </ErrorBoundary>
            <Toaster position="bottom-right" richColors />
          </ThemeProvider>
        </AuthProvider>
      </ApolloProvider>
    </BrowserRouter>
  </React.StrictMode>,
);
