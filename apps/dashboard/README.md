# MAMA-AI Dashboard

Streamlit dashboard for the MAMA-AI maternal health platform. See the main repo at
https://github.com/ZziemWellu/mama-ai-platform for source, docs and issue tracking.

Deployed on Render (see `render.yaml` at the repo root) — Hugging Face's Streamlit SDK is deprecated
in favor of its Docker SDK, which now requires a paid PRO plan to create (as of mid-2026), so this
stays on Render's free web service tier instead.

Required environment variable: `API_URL` — set automatically from the `mama-ai-api` Render service's
own URL (see `render.yaml`).
