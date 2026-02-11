const cron = require("node-cron");
const Task = require("../models/Task");

// Función para eliminar tareas finalizadas después de 10 días
const deleteExpiredTasks = async () => {
  try {
    const now = new Date();

    // Buscar y eliminar en una sola operación
    const result = await Task.deleteMany({
      autoDeleteAt: {$lte: now},
      status: "finalizada",
    });

    if (result.deletedCount > 0) {
      console.log(
        `🗑️ Auto-borrado: ${result.deletedCount} tarea(s) eliminada(s)`,
      );

      return {success: true, deletedCount: result.deletedCount};
    } else {
      console.log("✅ Auto-borrado: No hay tareas para eliminar");
      return {success: true, deletedCount: 0};
    }
  } catch (error) {
    console.error("❌ Error en auto-borrado:", error);
    return {success: false, error: error.message};
  }
};

// Función para iniciar el cron job
const startTaskCleanupJob = () => {
  // Validar que node-cron pueda ejecutarse
  if (!cron.validate("0 2 * * *")) {
    throw new Error("Expresión cron válida");
  }

  // Ejecutar todos los días a las 2:00 AM
  // Formato: segundo minuto hora día mes día_semana
  const job = cron.schedule(
    "0 2 * * *",
    async () => {
      console.log("⏰ Ejecutando tarea de auto-borrado programada...");
      await deleteExpiredTasks();
    },
    {scheduled: true, timezone: "America/Argentina/Salta"},
  );

  console.log(
    "✅ Tarea de auto-borrado programada (diariamente a las 2:00 AM)",
  );

  return job;
};

// Función para ejecutar limpieza manual (útil para testing)
const runManualCleanup = async () => {
  console.log("🔄️ Ejecutando limpieza manual...");
  return await deleteExpiredTasks();
};

module.exports = {startTaskCleanupJob, runManualCleanup, deleteExpiredTasks};
