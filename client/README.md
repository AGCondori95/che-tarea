# Che Tarea - Frontend

Sistema de gestión de tareas colaborativo con tablero Kanban, desarrollado con React y Vite.

## 🚀 Características

- 📋 Tablero Kanban interactivo con drag & drop
- 👥 Gestión de equipos y usuarios
- 🏷️ Sistema de etiquetas personalizables
- 📊 Dashboard con estadísticas en tiempo real
- 🔔 Sistema de notificaciones
- 🎨 Interfaz moderna y responsive
- 🔐 Autenticación y autorización
- ♿ Accesible (WCAG 2.1)

## 🛠️ Tecnologías

- **React 19** - Librería de UI
- **Vite** - Build tool y dev server
- **React Router** - Navegación
- **Tailwind CSS** - Estilos
- **@dnd-kit** - Drag and drop
- **Axios** - Cliente HTTP
- **React Toastify** - Notificaciones
- **Lucide React** - Iconos

## 📋 Prerequisitos

- Node.js >= 18.0.0
- npm >= 9.0.0

## 🔧 Instalación

1. Clona el repositorio:

```bash
git clone <url-del-repositorio>
cd che-tarea-frontend
```

2. Instala las dependencias:

```bash
npm install
```

3. Configura las variables de entorno:

```bash
cp .env.example .env
```

Edita `.env` con tus configuraciones:

```env
VITE_API_URL=http://localhost:5000/api
```

## 🚀 Uso

### Desarrollo

```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:5173`

### Build de producción

```bash
npm run build
```

### Preview del build

```bash
npm run preview
```

### Linting

```bash
npm run lint          # Verificar errores
npm run lint:fix      # Corregir errores automáticamente
```

### Formateo

```bash
npm run format        # Formatear código con Prettier
```

## 📁 Estructura del Proyecto

```
src/
├── api/              # Configuración de Axios
├── components/       # Componentes reutilizables
│   ├── kanban/      # Componentes del tablero Kanban
│   └── layout/      # Componentes de layout
├── context/         # Contextos de React
├── pages/           # Páginas de la aplicación
├── App.jsx          # Componente principal
├── main.jsx         # Punto de entrada
└── index.css        # Estilos globales
```

## 🎨 Colores del Tema

- **Primary**: `#2563eb` (blue-600)
- **Urgent**: `#ef4444` (red-500)
- **Medium**: `#f59e0b` (amber-500)
- **Low**: `#22c55e` (green-500)

## 🔐 Rutas de la Aplicación

### Públicas

- `/login` - Inicio de sesión
- `/register` - Registro de usuarios

### Protegidas

- `/dashboard` - Panel principal
- `/tasks` - Tablero Kanban
- `/profile` - Perfil de usuario
- `/archive` - Tareas archivadas
- `/team` - Gestión de equipo (solo admin)

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add: nueva característica'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📝 Convenciones de Código

- Usar ES6+ features
- Componentes funcionales con hooks
- Nombres descriptivos en español para variables/funciones
- Comentarios en español
- 2 espacios para indentación
- Seguir las reglas de ESLint configuradas

## 🐛 Reporte de Bugs

Si encuentras un bug, por favor abre un issue con:

- Descripción detallada del problema
- Pasos para reproducirlo
- Comportamiento esperado vs actual
- Screenshots si es posible
- Información del navegador/OS

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para más detalles.

## 👥 Autores

- **Álvaro Condorí** - _Desarrollo inicial_ - [Mi GitHub](https://github.com/ACondori95)

## 🙏 Agradecimientos

- Equipo de React
- Comunidad de Vite
- Contribuidores de Tailwind CSS
- Todos los que contribuyeron al proyecto
