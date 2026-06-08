# MasterMatch AI · Backend

API REST que recomienda **másteres universitarios personalizados** a partir del
perfil del usuario (país, universidad, nota media, presupuesto, preferencias,
objetivos profesionales y prioridades). Combina un **motor de scoring clásico
explicable** con una **capa de IA opcional** que enriquece las explicaciones.

> ⚠️ **Datos demo:** el catálogo de seed es ficticio/orientativo
> (`isDemoData = true`) y **no procede de fuentes oficiales**. Sustitúyelo por
> datos verificados antes de cualquier uso real.

---

## Stack

- **Node.js + TypeScript**
- **Express** (API REST)
- **Prisma ORM + PostgreSQL**
- **Zod** (validación de entrada)
- Capa de IA compatible con **OpenAI** o cualquier endpoint estilo OpenAI
  (`/chat/completions`) — **opcional**, con fallback determinista
- **Vitest** (tests unitarios + integración)
- Arquitectura limpia por capas

---

## Arquitectura

```
src/
  app.ts                 # Construcción de la app Express (middlewares, rutas)
  server.ts              # Arranque del servidor + ciclo de vida
  config/
    env.ts               # Carga y validación de variables de entorno (Zod)
    database.ts          # Cliente Prisma (singleton)
  routes/                # Definición de endpoints
  controllers/           # Validan input y delegan en servicios
  services/              # Lógica de negocio
    scoring.service.ts   # Motor de puntuación 0-100 (clásico, explicable)
    ai.service.ts        # Enriquecimiento con LLM + fallback
    recommendation.service.ts
    masters.service.ts
    savedMasters.service.ts
  repositories/          # Acceso a datos (Prisma)
  schemas/               # Esquemas Zod
  types/                 # Tipos compartibles con el frontend
  utils/                 # errores, logger, normalización, validación
  middlewares/           # logger de peticiones, 404, manejo de errores
prisma/
  schema.prisma          # Modelo de datos
  seed.ts                # 24 másteres demo (10 áreas, 8 países)
tests/                   # Tests de integración HTTP
```

**Flujo de capas:** `routes → controllers → services → repositories → Prisma`.
La lógica de negocio nunca vive en los controladores.

---

## Puesta en marcha

### Requisitos
- Node.js >= 20
- PostgreSQL (local, Docker, o gestionado)

### 1. Instalar dependencias
```bash
npm install
```

### 2. Configurar entorno
```bash
cp .env.example .env   # En Windows PowerShell: Copy-Item .env.example .env
```
Edita `.env` si lo necesitas. El valor por defecto de `DATABASE_URL` ya encaja
con el `docker-compose` incluido.

### 3. Levantar PostgreSQL (opción rápida con Docker)
```bash
docker compose up -d
```
> ¿Sin Docker? Crea una base PostgreSQL y ajusta `DATABASE_URL` en `.env`.

### 4. Crear el esquema y sembrar datos
```bash
npm run db:push     # crea las tablas a partir de schema.prisma
npm run db:seed     # inserta 24 másteres demo
```
> Alternativa con migraciones versionadas: `npm run prisma:migrate`.

### 5. Arrancar el servidor
```bash
npm run dev         # desarrollo (recarga en caliente)
# o
npm run build && npm start   # producción
```

La API queda en `http://localhost:4000`. Comprueba `GET /api/health`.

---

## Variables de entorno

| Variable | Descripción | Por defecto |
|---|---|---|
| `NODE_ENV` | `development` \| `test` \| `production` | `development` |
| `PORT` | Puerto HTTP | `4000` |
| `CORS_ORIGIN` | Orígenes permitidos (coma) o `*` | `*` |
| `DATABASE_URL` | Cadena de conexión PostgreSQL | — (**obligatoria**) |
| `RATE_LIMIT_WINDOW_MS` | Ventana de rate limit (ms) | `900000` |
| `RATE_LIMIT_MAX` | Máx. peticiones por ventana | `300` |
| `LOG_LEVEL` | `debug`\|`info`\|`warn`\|`error` | `info` |
| `LOG_FORMAT` | `pretty` \| `json` | `pretty` |
| `AI_API_KEY` | Clave del LLM (vacío = IA desactivada) | _vacío_ |
| `AI_MODEL` | Modelo del LLM | `gpt-4o-mini` |
| `AI_BASE_URL` | Endpoint estilo OpenAI | `https://api.openai.com/v1` |
| `AI_ENABLED` | Activar IA aunque haya key | `true` |

**Sin `AI_API_KEY` el sistema funciona igual**, usando solo el scoring clásico.

---

## Endpoints

| Método | Ruta | Descripción |
|---|---|---|
| `POST` | `/api/profile/analyze` | Crea el perfil y devuelve recomendaciones ordenadas |
| `GET` | `/api/masters` | Lista másteres (filtros: `country`, `university`, `area`, `language`, `maxPrice`, `modality`) |
| `GET` | `/api/masters/:id` | Detalle de un máster |
| `POST` | `/api/masters/compare` | Compara hasta 3 másteres (`{ masterIds: [...] }`) |
| `POST` | `/api/saved-masters` | Guarda un máster (`{ profileId, masterId }`) |
| `GET` | `/api/saved-masters?profileId=xxx` | Lista los másteres guardados de un perfil |
| `GET` | `/api/health` | Estado del servicio (catálogo + IA) |

Ejemplos listos para usar en [`requests.http`](./requests.http).

### Ejemplo: `POST /api/profile/analyze`

<details>
<summary>Request</summary>

```json
{
  "personalInfo": {
    "name": "Jorge", "age": 24, "residenceCountry": "España",
    "languages": ["Español", "Inglés"], "englishLevel": "C1",
    "maxBudget": 30000, "willingToStudyAbroad": true
  },
  "academicInfo": {
    "degree": "Ingeniería Informática", "university": "Universidad de Vigo",
    "gpa": 8.2, "studyCountry": "España", "graduationYear": 2024,
    "favoriteSubjects": ["Machine Learning", "Estadística"]
  },
  "masterPreferences": {
    "preferredCountries": ["España", "Países Bajos"], "preferredUniversities": [],
    "modality": "onsite", "desiredDuration": "12 meses", "yearlyBudget": 15000,
    "language": "Español", "interestArea": "Inteligencia Artificial"
  },
  "careerGoals": {
    "targetSector": "Tecnología", "targetRole": "Machine Learning Engineer",
    "targetWorkCountry": "España", "employabilityImportance": 9,
    "prestigeImportance": 6, "costImportance": 8,
    "internationalLifeImportance": 5, "networkingImportance": 5
  }
}
```
</details>

<details>
<summary>Response (201)</summary>

```json
{
  "profileId": "uuid",
  "recommendations": [
    {
      "masterId": "uuid",
      "name": "Máster en Inteligencia Artificial",
      "university": "Universidad Politécnica de Madrid",
      "country": "España", "city": "Madrid", "duration": "12 meses",
      "price": 9500, "language": "Español", "modality": "onsite",
      "matchScore": 91.4,
      "reasons": ["El área del máster coincide con tu interés principal.", "..."],
      "pros": ["Dentro de tu presupuesto.", "Alta empleabilidad (88/100)."],
      "cons": ["Admisión exigente (high); tu nota media (8.2) podría ser justa."],
      "admissionDifficulty": "high",
      "careerFit": "Encaje profesional alto"
    }
  ]
}
```
</details>

---

## Motor de scoring (0-100)

`scoring.service.ts` calcula una puntuación **explicable** como media ponderada
de 9 factores (los pesos suman 100):

| Factor | Peso |
|---|---|
| Área de interés | 20% |
| País preferido | 10% |
| Universidad preferida | 10% |
| Ajuste al presupuesto | 15% |
| Idioma del máster | 10% |
| Modalidad | 10% |
| Empleabilidad | 10% |
| Prestigio / ranking | 10% |
| Networking / internacional | 5% |

Las **prioridades del usuario (1-10)** modulan el peso efectivo de empleabilidad,
prestigio, networking y coste, de modo que lo que más le importa pesa más. Cada
factor aporta `reasons`, `pros` y `cons`. Reglas destacadas:

- Si el precio supera el presupuesto → resta puntos y añade un contra.
- País/universidad/área coincidentes → suman puntos y añaden razones.
- Empleabilidad alta + alta importancia → suma puntos.
- Idioma o modalidad que no encajan → penalizan.
- Admisión exigente con nota media justa → aviso (no puntúa).

Las recomendaciones se ordenan por `matchScore` descendente.

## Capa de IA (opcional)

`ai.service.ts` recibe el perfil, los candidatos y el resultado del scoring y
devuelve `improvedReasons`, `personalizedExplanation`, `risks` y
`suggestedAlternatives`. Principios:

- **No inventa datos**: solo explica, resume y reordena lo que recibe.
- Si **no hay API key** o el LLM falla → **fallback determinista** basado en el
  propio scoring. El sistema nunca se rompe por la IA.
- Tiempo de espera configurable (`AI_TIMEOUT_MS`).

---

## Scripts

| Script | Acción |
|---|---|
| `npm run dev` | Servidor en desarrollo (hot reload) |
| `npm run build` | Compila TypeScript a `dist/` |
| `npm start` | Ejecuta el build de producción |
| `npm run typecheck` | Comprobación de tipos sin emitir |
| `npm test` | Tests (Vitest) |
| `npm run db:push` | Sincroniza el esquema con la BD |
| `npm run db:seed` | Inserta los datos demo |
| `npm run prisma:migrate` | Migraciones versionadas (dev) |
| `npm run prisma:studio` | Explorador visual de la BD |

---

## Tests

```bash
npm test
```

- **Unitarios** del motor de scoring (`src/services/scoring.service.test.ts`):
  pesos, rango 0-100, razones/pros/cons, penalizaciones, `careerFit`.
- **Integración HTTP** (`tests/api.integration.test.ts`): routing, validación
  Zod (422) y manejo de errores (404), sin depender de la base de datos.

---

## Seguridad y buenas prácticas

- Variables de entorno validadas con Zod; **las claves nunca se exponen**.
- `helmet`, **CORS** configurable y **rate limiting** básico.
- **Manejo centralizado de errores** con respuestas JSON homogéneas
  (`{ error: { code, message, details? } }`) y traducción de errores de Prisma.
- Validación de **todas** las entradas (body, query, params).
- Código modular por capas; lógica de negocio fuera de los controladores.
- Logs estructurados (formato `pretty` o `json`).

---

## Compatibilidad con el frontend

Los tipos compartibles viven en `src/types/` (`UserProfileInput`,
`MasterProgram`, `Recommendation`, `SavedMaster`, `MasterComparison`,
`RecommendationItem`). Los nombres de campo coinciden exactamente con el
contrato del frontend.
