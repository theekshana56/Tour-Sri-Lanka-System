# TSL Platform — Tourism Sri Lanka

Monorepo for the Tourism Sri Lanka booking and trip planning platform.

| Layer    | Stack                          | Hosting              |
| -------- | ------------------------------ | -------------------- |
| Frontend | Next.js 14, React, Tailwind    | Vercel               |
| Backend  | Spring Boot 3, Java 21, JWT    | Render / Railway     |
| Database | MongoDB Atlas (M0 free tier)   | MongoDB Atlas        |
| Files    | Cloudinary                     | Cloudinary free tier |
| Email    | Resend                         | Resend free tier     |
| CI/CD    | GitHub Actions                 | GitHub               |

## Project structure

```
├── frontend/              Next.js 14 + Tailwind + shadcn/ui
├── backend/               Spring Boot 3 REST API
└── .github/workflows/     CI/CD pipelines
```

## Prerequisites

- **Node.js 20+** and npm
- **Java 21+** and Maven 3.9+
- **MongoDB Atlas** account (free M0 cluster — no Docker required)

## Local setup

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd Tour-Sri-Lanka-System
```

### 2. MongoDB Atlas

1. Create a free cluster at [mongodb.com/atlas](https://www.mongodb.com/atlas).
2. **Database Access** → create a database user.
3. **Network Access** → add your current IP address.
4. **Connect** → Drivers → copy the connection string.
5. Replace `<password>` and use database name `tsldb`.

### 3. Backend

```bash
cd backend
cp .env.example .env
# Edit .env — set MONGODB_URI and other secrets
```

**Windows (PowerShell):**

```powershell
cd backend
Copy-Item .env.example .env
# Edit .env, then:
Get-Content .env | ForEach-Object {
  if ($_ -match '^\s*([^#][^=]+)=(.*)$') { Set-Item -Path "env:$($matches[1].Trim())" -Value $matches[2].Trim() }
}
mvn spring-boot:run
```

**macOS / Linux:**

```bash
cd backend
cp .env.example .env
# Edit .env, then:
export $(grep -v '^#' .env | xargs)
mvn spring-boot:run
```

Health check: [http://localhost:8080/api/health](http://localhost:8080/api/health)

Swagger UI (dev): [http://localhost:8080/swagger-ui.html](http://localhost:8080/swagger-ui.html)

### 4. Frontend

```bash
cd frontend
npm install
cp .env.local.example .env.local   # or create manually
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Default frontend env (`frontend/.env.local`):

```env
NEXT_PUBLIC_API_URL=http://localhost:8080/api
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Environment variables

### Backend (`backend/.env`)

| Variable               | Description                          | Required |
| ---------------------- | ------------------------------------ | -------- |
| `MONGODB_URI`          | MongoDB Atlas connection string      | Yes      |
| `JWT_SECRET`           | JWT signing secret (256-bit)         | Yes      |
| `FRONTEND_URL`         | Frontend origin for CORS             | Yes      |
| `RESEND_API_KEY`       | Resend email API key                 | Later    |
| `CLOUDINARY_CLOUD_NAME`| Cloudinary cloud name                | Later    |
| `CLOUDINARY_API_KEY`   | Cloudinary API key                   | Later    |
| `CLOUDINARY_API_SECRET`| Cloudinary API secret                | Later    |
| `SPRING_PROFILES_ACTIVE` | `dev` or `prod`                    | No       |

### Frontend (`frontend/.env.local`)

| Variable               | Description                |
| ---------------------- | -------------------------- |
| `NEXT_PUBLIC_API_URL`  | Backend API base URL       |
| `NEXT_PUBLIC_APP_URL`  | Frontend app URL           |

## Deployment summary

| Service  | Platform        | Notes                                      |
| -------- | --------------- | ------------------------------------------ |
| Frontend | **Vercel**      | Connect repo, set root to `frontend/`      |
| Backend  | **Render/Railway** | Set `SPRING_PROFILES_ACTIVE=prod`, env vars |
| Database | **MongoDB Atlas** | Use same cluster or separate prod cluster |
| CDN/SSL  | **Cloudflare**  | Point DNS to Vercel + backend host         |

Production backend env: set `MONGODB_URI`, `JWT_SECRET`, `FRONTEND_URL` (your Vercel URL), and third-party API keys on the hosting platform — never commit secrets.

## CI/CD

GitHub Actions run on push/PR to `main`:

- **Frontend CI** — `npm ci && npm run build` (when `frontend/**` changes)
- **Backend CI** — `mvn clean package -DskipTests` (when `backend/**` changes)

## Development profiles

- **`dev`** (default) — debug logging, Swagger enabled
- **`prod`** — WARN-level logging, Swagger disabled

Set `SPRING_PROFILES_ACTIVE=prod` in production.
