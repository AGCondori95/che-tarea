# Che Tarea - Backend API

Sistema de gestión de tareas con autenticación JWT y auto-borrado de tareas finalizadas.

## 📋 Características

- ✅ Autenticación con JWT
- ✅ Gestión de tareas (CRUD)
- ✅ Sistema de etiquetas (tags)
- ✅ Gestión de usuarios (admin)
- ✅ Auto-borrado de tareas finalizadas después de 10 días
- ✅ Roles de usuario (admin/user)
- ✅ Subtareas y comentarios

## 🚀 Instalación

1. Clonar el repositorio

```bash
git clone <url-del-repo>
cd che-tarea-backend
```

2. Instalar dependencias

```bash
npm install
```

3. Configurar variables de entorno

```bash
cp .env.example .env
# Editar .env con tus credenciales
```

4. Iniciar el servidor

```bash
# Desarrollo
npm run dev

# Producción
npm start
```

## 🔧 Variables de Entorno

| Variable              | Descripción                 | Ejemplo                 |
| --------------------- | --------------------------- | ----------------------- |
| `PORT`                | Puerto del servidor         | `5000`                  |
| `MONGODB_URI`         | URI de MongoDB              | `mongodb://...`         |
| `JWT_SECRET`          | Secreto para JWT            | Mínimo 32 caracteres    |
| `JWT_EXPIRE`          | Expiración del token        | `7d`                    |
| `CORS_ORIGIN`         | Origen permitido para CORS  | `http://localhost:3000` |
| `TASK_RETENTION_DAYS` | Días antes de borrar tareas | `10`                    |

## 📚 Endpoints

### Autenticación

- `POST /api/auth/register` - Registrar usuario
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Usuario actual
- `PUT /api/auth/profile` - Actualizar perfil
- `PUT /api/auth/change-password` - Cambiar contraseña

### Tareas

- `GET /api/tasks` - Listar tareas
- `POST /api/tasks` - Crear tarea
- `GET /api/tasks/:id` - Obtener tarea
- `PUT /api/tasks/:id` - Actualizar tarea
- `DELETE /api/tasks/:id` - Eliminar tarea
- `POST /api/tasks/:id/subtasks` - Agregar subtarea
- `POST /api/tasks/:id/comments` - Agregar comentario

### Etiquetas

- `GET /api/tags` - Listar etiquetas
- `POST /api/tags` - Crear etiqueta
- `PUT /api/tags/:id` - Actualizar etiqueta
- `DELETE /api/tags/:id` - Eliminar etiqueta

### Usuarios (Admin)

- `GET /api/users` - Listar usuarios
- `POST /api/users` - Crear usuario
- `PUT /api/users/:id` - Actualizar usuario
- `DELETE /api/users/:id` - Desactivar usuario

## 🏗️ Estructura del Proyecto

```
├── config/
│   └── db.js
├── controllers/
│   ├── authController.js
│   ├── tagController.js
│   ├── taskController.js
│   └── userController.js
├── middleware/
│   ├── authMiddleware.js
│   └── roleMiddleware.js
├── models/
│   ├── Tag.js
│   ├── Task.js
│   └── User.js
├── routes/
│   ├── authRoutes.js
│   ├── tagRoutes.js
│   ├── taskRoutes.js
│   └── userRoutes.js
├── utils/
│   ├── generateToken.js
│   └── taskCleanup.js
├── .env
├── .gitignore
├── package.json
└── server.js
```

## 📝 Licencia

MIT
