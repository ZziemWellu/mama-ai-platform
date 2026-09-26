---
title: MAMA AI API
emoji: 🏥
colorFrom: blue
colorTo: green
sdk: docker
app_port: 8000
pinned: false
---

# MAMA-AI API

FastAPI backend for the MAMA-AI maternal health platform. See the main repo at
https://github.com/ZziemWellu/mama-ai-platform for source, docs and issue tracking — this Space is a
deploy target, not the place to read or edit the code.

Required Space secrets (Settings → Repository secrets): `DATABASE_URL`, `JWT_SECRET`, `ALLOWED_ORIGINS`.

Health check: `GET /health`. Interactive API docs: `/docs`.
