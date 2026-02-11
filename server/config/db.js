const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    // Validar que MONGODB_URI existe
    if (!process.env.MONGODB_URI) {
      throw new Error(
        "MONGODB_URI no está configurado en las variables de entorno",
      );
    }

    // Opciones de conexión recomendadas
    const options = {
      // Opciones por defecto de Mongoose 6+ ya no necesitan estas configuraciones:
      // useNewUrlParser: true,
      // useUnifiedTopology: true,

      // Configuraciones útiles para producción
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    };

    const conn = await mongoose.connect(process.env.MONGODB_URI, options);

    console.log(`✅ MongoDB conectado: ${conn.connection.host}`);
    console.log(`📊 Base de datos: ${conn.connection.name}`);

    // Listener para errores de conexión después del inicio
    mongoose.connection.on("error", (err) => {
      console.error("❌ Error de MongoDB:", err);
    });

    mongoose.connection.on("disconnected", () => {
      console.warn("⚠️ MongoDB desconectado");
    });

    // Listener para reconexión exitosa
    mongoose.connection.on("reconnected", () => {
      console.log("✅ MongoDB reconectado");
    });

    // Manejo de señales de terminación para cerrar conexión limpiamente
    process.on('SIGINT', async () => {
      
    })
  } catch (error) {
    console.error("❌ Error al conectar MongoDB:", error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
