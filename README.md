# 22sentiers - Setup local et production (Coolify Nixpacks)

## 1) Lancer en local (dev)

### Backend (FastAPI)

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend (Vite + React)

```bash
cd front
npm install
cp .env.example .env
npm run dev -- --host 0.0.0.0 --port 5173
```

Frontend: `http://localhost:5173`  
Backend: `http://localhost:8000`  
Healthcheck API: `http://localhost:8000/api/health`

## 2) Variables d'environnement

- `front/.env`
  - `VITE_ASTRO_API_URL`: URL publique du backend.
- `backend/.env` (ou variables système)
  - `ALLOWED_ORIGINS`: origines CORS séparées par des virgules.
  - `HOST`: host de binding API (ex: `0.0.0.0`).
  - `PORT`: port API (ex: `8000`).
  - `WORKERS`: nombre de workers Uvicorn en production.

## 3) Build production

```bash
cd front
npm run build
npm run preview
```

## 4) Déploiement Coolify (Nixpacks)

Déploie en **2 applications séparées** dans Coolify, depuis le même repo:

- Backend:
  - Base directory: `backend`
  - Builder: `Nixpacks`
  - Port: `8000`
  - Variables: `ALLOWED_ORIGINS`, `PORT`, `WORKERS`
- Frontend:
  - Base directory: `front`
  - Builder: `Nixpacks`
  - Port: `4173` (ou `PORT` Coolify)
  - Variable build/runtime: `VITE_ASTRO_API_URL`

Les fichiers `nixpacks.toml` dans `backend/` et `front/` définissent les étapes de build/start.

## 5) Notes importantes

- Renseigne `ALLOWED_ORIGINS` avec ton domaine frontend de production.
- Renseigne `VITE_ASTRO_API_URL` avec l'URL backend finale (https recommandé).
- Configure les domaines dans Coolify (ex: `api.tondomaine.com` et `app.tondomaine.com`) avec TLS.
