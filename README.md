# MAMA-AI Platform

## AI-Powered Maternal Emergency, Referral, and Safe Birth Ecosystem for Rural Ghana

### Overview

MAMA-AI addresses the **Three Delays Model**:
1. **Delay in seeking care** — Voice education and danger sign awareness
2. **Delay in reaching care** — Referral intelligence and maternal waiting homes
3. **Delay in receiving care** — Midwife AI and clinical decision support

### Features

- 🚨 **Emergency Risk Assessment** — PPH, pre-eclampsia, obstructed labour, sepsis
- 🏥 **Referral Intelligence** — Nearest facility locator with travel time
- 🏠 **Safe Birth Centers** — AI-powered waiting home recommendation
- 📊 **Health Economics** — Real-time cost savings and DALY calculation
- 📱 **Offline-First PWA** — Works on 2G/no internet with Twi/English voice

### Quick Start

```bash
# Create conda environment
conda create -n mama-ai python=3.11 -y
conda activate mama-ai

# Install dependencies
pip install fastapi uvicorn sqlalchemy psycopg2-binary redis celery python-dotenv pydantic
License
MIT
