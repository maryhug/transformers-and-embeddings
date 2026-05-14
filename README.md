<div align="center">

  <img src="https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript&logoColor=white" />
  <img src="https://img.shields.io/badge/Next.js-14-000000?style=for-the-badge&logo=nextdotjs&logoColor=white" />
  <img src="https://img.shields.io/badge/OpenAI-API-412991?style=for-the-badge&logo=openai&logoColor=white" />
  <img src="https://img.shields.io/badge/SQLite-Base%20de%20datos-003B57?style=for-the-badge&logo=sqlite&logoColor=white" />

  <h1>Transformers & Embeddings Explorer</h1>
  <p>Aplicación fullstack para explorar el funcionamiento de los Transformers y generar, visualizar y comparar embeddings de texto usando la API de OpenAI. Incluye autenticación con JWT, persistencia en SQLite y cálculo de similitud coseno entre vectores.</p>

</div>

---

## Estructura del repositorio

| Carpeta | Tecnología | Puerto |
|---|---|---|
| [`backend/`](./backend) | Node.js + TypeScript + Express | 3001 |
| [`frontend/`](./frontend) | Next.js 14 + App Router | 3000 |

## Funcionalidades principales

- Exploración del modelo Transformer y su arquitectura
- Generación de embeddings con el modelo `text-embedding-ada-002` de OpenAI
- Comparación semántica entre textos usando similitud coseno
- Autenticación segura con JWT y contraseñas hasheadas con bcrypt
- Persistencia de embeddings por usuario en SQLite

## Inicio rápido

```bash
# Backend
cd backend && npm install && npm run dev

# Frontend (en otra terminal)
cd frontend && npm install && npm run dev
```

> Necesitas una `OPENAI_API_KEY` válida con créditos disponibles. Consulta el README de cada módulo para la configuración completa.
