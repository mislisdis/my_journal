import React from "react";
import { ThemeProvider } from "../contexts/ThemeContext";
import "../styles/globals.css";

export default function MyApp({ Component, pageProps }) {
  return (
    <ThemeProvider>
      <Component {...pageProps} />
    </ThemeProvider>
  );
}
