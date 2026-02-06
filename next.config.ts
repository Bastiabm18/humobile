import type { NextConfig } from "next";
import withSerwistInit from "@serwist/next";

const withSerwist = withSerwistInit({
  // Donde estará tu código fuente del SW
  swSrc: "src/sw.ts",
  // Donde se guardará el archivo final (en public)
  swDest: "public/sw.js",
  // Desactiva el SW en desarrollo para que no te vuelva loco con el caché
  disable: process.env.NODE_ENV === "development",
});

const nextConfig: NextConfig = {
  /* Tus opciones de configuración aquí */
};

export default withSerwist(nextConfig);