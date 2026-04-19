# 🔷 Explorador de Embeddings

Aplicación full-stack para generar, visualizar y comparar **embeddings de texto** usando OpenAI. Construida con Node.js + TypeScript en el backend y Next.js 14 en el frontend.

---

## 📖 ¿Qué son los embeddings?

Un **embedding** es una representación numérica de texto en forma de vector de alta dimensión. Cuando un modelo de lenguaje procesa la frase "el gato está en la silla", la convierte en un arreglo de 1 536 números (por ejemplo, `[0.021, -0.045, 0.312, ...]`). Cada número captura algún aspecto del **significado semántico** del texto.

Esta aplicación usa el modelo **`text-embedding-ada-002`** de OpenAI, que produce vectores de **1 536 dimensiones** y es uno de los modelos de embedding más utilizados por su equilibrio entre calidad y costo.

### ¿Por qué funciona la similitud coseno?

La **similitud coseno** mide el ángulo entre dos vectores en un espacio de alta dimensión:

```
similitud = (A · B) / (||A|| × ||B||)
```

- Si dos textos tienen **significado similar** (ej: "perro" y "canino"), sus vectores apuntan en direcciones parecidas → ángulo pequeño → similitud alta (cercana a **1**)
- Si dos textos son **muy diferentes** (ej: "astronomía" y "receta de pasta"), sus vectores apuntan en direcciones muy distintas → ángulo grande → similitud baja (cercana a **0**)

Esto permite responder preguntas como: _¿Cuán relacionadas están semánticamente estas dos frases?_

---

## 🚀 Instalación y configuración

### Requisitos previos

- **Node.js** 18 o superior
- **npm** 9 o superior
- Cuenta en [OpenAI](https://platform.openai.com/) con créditos disponibles para usar la API de embeddings

### 1. Clonar el repositorio

```bash
git clone <url-del-repositorio>
cd embedding-explorer
```

### 2. Configurar el backend

```bash
cd backend
npm install
```

Copia el archivo de variables de entorno:

```bash
cp .env.example .env
```

Edita `backend/.env` con tus valores reales:

```env
PORT=3001
JWT_SECRET=un_secreto_largo_y_aleatorio_aqui
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxxxxxxxxx
DATABASE_PATH=./data/database.sqlite
```

> **¿Cómo obtener la `OPENAI_API_KEY`?**
> Entra a [platform.openai.com/api-keys](https://platform.openai.com/api-keys), crea una clave nueva y cópiala aquí. Asegúrate de tener crédito disponible en tu cuenta.

### 3. Configurar el frontend

```bash
cd ../frontend
npm install
```

Copia el archivo de variables de entorno:

```bash
cp .env.example .env.local
```

El archivo `frontend/.env.local` ya está preconfigurado:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

---

## ▶️ Ejecutar la aplicación

### Backend (en una terminal)

```bash
cd backend
npm run dev
```

El servidor arrancará en `http://localhost:3001`. Verás:
```
✅ Base de datos inicializada en: /ruta/al/data/database.sqlite
🚀 Servidor corriendo en http://localhost:3001
```

### Frontend (en otra terminal)

```bash
cd frontend
npm run dev
```

La aplicación estará disponible en `http://localhost:3000`.

---

## 🗂️ Estructura del proyecto

```
proyecto/
├── backend/
│   ├── src/
│   │   ├── types/          # Interfaces y tipos TypeScript
│   │   ├── db/             # Conexión SQLite y esquema SQL
│   │   ├── repositories/   # Acceso a la base de datos
│   │   ├── services/       # Lógica de negocio (auth, OpenAI)
│   │   ├── controllers/    # Manejadores de peticiones HTTP
│   │   ├── middlewares/    # Auth JWT y manejo de errores
│   │   ├── routes/         # Definición de endpoints
│   │   └── app.ts          # Punto de entrada del servidor
│   └── data/               # Base de datos SQLite (se crea automáticamente)
│
└── frontend/
    └── src/
        ├── app/            # Páginas Next.js (App Router)
        ├── components/     # Componentes React reutilizables
        ├── services/       # Llamadas a la API del backend
        ├── hooks/          # Hooks personalizados (useAuth)
        ├── types/          # Tipos TypeScript del frontend
        └── utils/          # Utilidades (wrapper de fetch)
```

---

## 🔌 Endpoints de la API

| Método | Ruta | Descripción | Auth |
|--------|------|-------------|------|
| POST | `/api/auth/register` | Registrar nuevo usuario | ❌ |
| POST | `/api/auth/login` | Iniciar sesión | ❌ |
| GET | `/api/auth/me` | Obtener perfil del usuario | ✅ |
| POST | `/api/embeddings/generate` | Generar embedding con OpenAI | ✅ |
| POST | `/api/embeddings/save` | Guardar embedding en la DB | ✅ |
| GET | `/api/embeddings` | Listar embeddings del usuario | ✅ |
| POST | `/api/embeddings/compare` | Comparar dos embeddings | ✅ |
| DELETE | `/api/embeddings/:id` | Eliminar un embedding | ✅ |

---

## 🎨 Características de diseño

- **Tema oscuro** con fondo `#0a0a0f`
- **Glassmorphism**: tarjetas con `backdrop-filter: blur(10px)`
- **Ondas animadas** en el fondo con gradiente morado/azul
- **Indicador de fortaleza** de contraseña en el registro
- **Notificaciones toast** para éxito y error
- **Diseño responsive** para móvil y escritorio

---

## 🔒 Seguridad implementada

- Contraseñas hasheadas con **bcrypt** (10 rondas de sal)
- Autenticación con **tokens JWT** (expiración de 7 días)
- Validación de propiedad: solo puedes ver/eliminar tus propios embeddings
- La clave de API de OpenAI nunca se expone al cliente (solo se usa en el backend)

---

## 🛠️ Construcción para producción

```bash
# Backend
cd backend && npm run build

# Frontend
cd frontend && npm run build && npm start
```

---

## 📝 Licencia

MIT
