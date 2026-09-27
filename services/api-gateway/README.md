# MAMA-AI API

FastAPI backend for the MAMA-AI maternal health platform. See the main repo at
https://github.com/ZziemWellu/mama-ai-platform for source, docs and issue tracking.

Deployed on Render (see `render.yaml` at the repo root) — Hugging Face Docker Spaces now require a
paid PRO plan to create (as of mid-2026), so this stays on Render's free web service tier instead;
only the free-tier Postgres was ever the actual problem, and that's been replaced with Neon.

Required environment variables (set in the Render dashboard, not committed): `DATABASE_URL` (a Neon
connection string), `JWT_SECRET` (Render generates this automatically), `ALLOWED_ORIGINS` (the real
frontend origin, comma-separated if more than one).

Health check: `GET /health`. Interactive API docs: `/docs`.
