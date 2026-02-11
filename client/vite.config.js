import {defineConfig} from "vite";
import react from "@vitejs/plugin-react";
import {resolve} from "path";

// https://vite.dev/config/
export default defineConfig(({mode}) => {
  return {
    plugins: [
      react({
        // Habilitar Fast Refresh
        fastRefresh: true,
        // Babel config para optimizaciones
        babel: {
          plugins: [
            // Remover propTypes en producción
            mode === "production" && [
              "babel-plugin-transform-react-remove-prop-types",
              {removeImport: true},
            ],
          ].filter(Boolean),
        },
      }),
    ],

    // Alias para imports más limpios
    resolve: {
      alias: {
        "@": resolve(__dirname, "./src"),
        "@components": resolve(__dirname, "./src/components"),
        "@pages": resolve(__dirname, "./src/pages"),
        "@context": resolve(__dirname, "./src/context"),
        "@api": resolve(__dirname, "./src/api"),
      },
    },

    // Configuración del servidor de desarrollo
    server: {
      port: 5173,
      strictPort: false,
      host: true, // Escuchar en todas las interfaces
      open: true, // Abrir navegador automáticamente
      cors: true,
      // Proxy para desarrollo (si es necesario)
      proxy: {
        // '/api': {
        //   target: 'http://localhost:5000',
        //   changeOrigin: true,
        //   secure: false,
        // }
      },
    },

    // Configuración de build
    build: {
      outDir: "dist",
      assetsDir: "assets",
      sourcemap: mode === "development",
      // Optimizaciones
      minify: "terser",
      terserOptions: {
        compress: {
          drop_console: mode === "production",
          drop_debugger: mode === "production",
        },
      },
      // Configuración de chunks para mejor caching
      rollupOptions: {
        output: {
          manualChunks: {
            "react-vendor": ["react", "react-dom", "react-router-dom"],
            "dnd-vendor": [
              "@dnd-kit/core",
              "@dnd-kit/sortable",
              "@dnd-kit/utilities",
            ],
            "ui-vendor": ["lucide-react", "react-toastify"],
          },
        },
      },
      // Optimización de chunks
      chunkSizeWarningLimit: 1000,
    },

    // Optimización de dependencias
    optimizeDeps: {
      include: [
        "react",
        "react-dom",
        "react-router-dom",
        "@dnd-kit/core",
        "@dnd-kit/sortable",
        "axios",
      ],
    },

    // Variables de entorno
    envPrefix: "VITE_",

    // Preview server
    preview: {
      port: 4173,
      strictPort: false,
      host: true,
      open: true,
    },
  };
});
