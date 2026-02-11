# ✅ Che Tarea - MERN Stack Task Manager

[![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://che-tarea.vercel.app/login)
[![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Express](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![NodeJS](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)

**Che Tarea** no es solo una lista de tareas; es una aplicación **Fullstack** completa que integra una arquitectura profesional para la gestión de productividad personal. Desarrollada con el stack MERN, ofrece una interfaz intuitiva y un sistema de autenticación sólido.

---

## 🎯 Objetivo del Proyecto

Demostrar la capacidad de construir una **Single Page Application (SPA)** conectada a una **API RESTful** propia, manejando operaciones asíncronas, seguridad en rutas y persistencia de datos en la nube.

---

## 🚀 Funcionalidades Clave

- **Autenticación Segura:** Sistema de Login y Registro para proteger la información del usuario.
- **Gestión CRUD Completa:** Los usuarios pueden Crear, Leer, Editar y Eliminar sus tareas de forma persistente.
- **Filtros de Estado:** Organización de tareas pendientes y completadas.
- **Diseño UI/UX Moderno:** Desarrollado con Tailwind CSS para garantizar una experiencia fluida tanto en desktop como en mobile.
- **API Propia:** Consumo de servicios mediante una arquitectura de backend escalable.

---

## 🛠️ Stack Técnico

| Capa              | Tecnología                   |
| :---------------- | :--------------------------- |
| **Frontend**      | React (Vite) + Tailwind CSS  |
| **Backend**       | Node.js + Express.js         |
| **Base de Datos** | MongoDB Atlas (Cloud)        |
| **Herramientas**  | Axios, React Router Dom, JWT |

---

## 💻 Instalación Local

1.  **Clonar:**
    ```bash
    git clone [https://github.com/AGCondori95/che-tarea.git](https://github.com/AGCondori95/che-tarea.git)
    ```
2.  **Frontend:**
    ```bash
    cd client && npm install && npm run dev
    ```
3.  **Backend:**
    ```bash
    cd server && npm install && npm start
    ```
    _(Requiere configurar `.env` con `MONGO_URI` y `JWT_SECRET`)_

---

## 🧠 Desafíos Superados

- **Sincronización de Estado:** Implementación de lógica para que el UI se actualice inmediatamente después de una petición al servidor (Optimistic Updates).
- **Seguridad:** Implementación de Middlewares en el backend para validar sesiones antes de permitir el acceso a los datos.
- **Manejo de Errores:** Validación de formularios en el cliente y respuestas de error controladas desde el servidor.

---

## 👤 Autor

**Alvaro Condorí**

- **LinkedIn:** [linkedin.com/in/condorialvaro](https://www.linkedin.com/in/condorialvaro/)
- **GitHub:** [@ACondori95](https://github.com/ACondori95)

---

_Si te gusta este proyecto, considera darle una ⭐ al repositorio._
