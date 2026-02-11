const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const {startTaskCleanupJob} = require("./utils/taskCleanup");

// Cargar variables de entorno
dotenv.config();

// Validar variables de entorno críticas
const requiredEnvVars = ["MONGODB_URI", "JWT_SECRET", "JWT_EXPIRE", "PORT"];
const missingEnvVars = requiredEnvVars.filter((envVar) => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  console.error(
    `❌ Error: Faltan las siguientes variables de entorno: ${missingEnvVars.join(", ")}`,
  );
  process.exit(1);
}

// Conectar a la base de datos
connectDB();

const app = express();

// Middleware
app.use(cors({origin: process.env.CORS_ORIGIN || "*", credentials: true}));
app.use(express.json({limit: "10mb"}));
app.use(express.urlencoded({extended: true, limit: "10mb"}));

// Middleware de logging
if (process.env.NODE_ENV === "development") {
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
  });
}

// Iniciar tarea de auto-borrado
startTaskCleanupJob();

// Rutas
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/tasks", require("./routes/taskRoutes"));
app.use("/api/tags", require("./routes/tagRoutes"));
app.use("/api/users", require("./routes/userRoutes"));

// Ruta de prueba
app.get("/", (req, res) => {
  res.json({
    message: "🚀 Bienvenido a Che Tarea API",
    version: "1.0.0",
    status: "active",
    environment: process.env.NODE_ENV || "development",
    database: "connected",
    features: {
      autoDelete: "enabled (daily at 2:00 AM)",
      retentionPeriod: `${process.env.TASK_RETENTION_DAYS || 10} days`,
    },
    endpoints: {
      auth: "/api/auth",
      tasks: "/api/tasks",
      tags: "/api/tags",
      users: "/api/users (admin only)",
      health: "/health",
    },
  });
});

// Ruta de health check
app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || "development",
    database: "connected",
  });
});

// Manejo de rutas no encontradas
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Ruta no encontrada: ${req.method} ${req.path}`,
  });
});

// Manejo de errores global
app.use((err, req, res, next) => {
  console.error("❌ Error en servidor:", err.stack);

  // No exponer detalles del error en producción
  const errorMessage =
    process.env.NODE_ENV === "development"
      ? err.message
      : "Error interno del servidor";

  res.status(500).json({
    success: false,
    message: err.message || "Error interno del servidor",
    ...(process.env.NODE_ENV === "development" && {stack: err.stack}),
  });
});

// Iniciar servidor
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
  console.log(`📍 http://localhost:${PORT}`);
  console.log(`🌎 Entorno: ${process.env.NODE_ENV || "development"}`);
  console.log(
    `⏰ Auto-borrado programado: ${process.env.CLEANUP_CRON_SCHEDULE || "0 2 * * *"}`,
  );
});

// Manejo de cierre graceful
const gracefulShutdown = (signal) => {
  console.log(`\n${signal} recibido. Cerrado servidor...`);

  server.close(() => {
    console.log("✅ Servidor cerrado correctamente");
    process.exit(0);
  });

  // Forzar cierre después de 10 segundos
  setTimeout(() => {
    console.error("⚠️ Forzando cierre del servidor");
    process.exit(1);
  }, 10000);
};

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));

// Manejo de errores no capturados
process.on("unhandledRejection", (reason, promise) => {
  console.error("❌ Unhandled Rejection at:", promise, "reason:", reason);
  // En producción, considera reiniciar el servidor
});

process.on("uncaughtException", (error) => {
  console.error("❌ Uncaught Exception:", error);
  process.exit(1);
});

module.exports = app;
