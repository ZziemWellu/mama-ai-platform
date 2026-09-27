// Generates real Twi audio for the voice-assessment flow via GhanaNLP's Khaya TTS API
// (https://developer.khaya.ai — confirmed request/response shape from the open-source
// Ghana-NLP-Python-Library SDK, since the API docs portal is JS-rendered and not independently
// verifiable here). This is a one-time/occasional content-generation step, not something the app
// calls at runtime — the app is offline-first, so these files are generated once, committed, and
// served as static assets the service worker precaches (see public/sw.js).
//
// Usage: KHAYA_API_KEY=... node scripts/generate-twi-audio.mjs
//
// Every phrase here is a machine-generated placeholder, not a substitute for a real Twi speaker —
// see shared/voice-assessment-phrases.json's own note and the app's "machine-generated audio" label
// wherever these play. Swap in real recordings by replacing files under public/audio/tw/ with the
// same filenames; nothing else needs to change.
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PHRASES_PATH = path.join(__dirname, "..", "..", "..", "shared", "voice-assessment-phrases.json");
const OUT_DIR = path.join(__dirname, "..", "public", "audio", "tw");

const API_KEY = process.env.KHAYA_API_KEY;
if (!API_KEY) {
  console.error("KHAYA_API_KEY is not set. Get a subscription key from https://developer.khaya.ai and re-run:");
  console.error("  KHAYA_API_KEY=... node scripts/generate-twi-audio.mjs");
  process.exit(1);
}

const phrases = JSON.parse(readFileSync(PHRASES_PATH, "utf-8"));
mkdirSync(OUT_DIR, { recursive: true });

async function synthesize({ id, en }) {
  const res = await fetch("https://translation-api.ghananlp.org/tts/v1/tts", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-cache",
      "Ocp-Apim-Subscription-Key": API_KEY,
    },
    body: JSON.stringify({ text: en, language: "tw" }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`TTS failed for "${id}": ${res.status} ${body}`);
  }

  const contentType = res.headers.get("content-type") || "";
  const ext = contentType.includes("wav") ? "wav" : "mp3";
  const buffer = Buffer.from(await res.arrayBuffer());
  const outPath = path.join(OUT_DIR, `${id}.${ext}`);
  writeFileSync(outPath, buffer);
  console.log(`ok - ${id}.${ext} (${buffer.length} bytes)`);
}

let failures = 0;
for (const phrase of phrases) {
  try {
    await synthesize(phrase);
  } catch (err) {
    failures++;
    console.error(err.message);
  }
}

console.log(`\n${phrases.length - failures}/${phrases.length} phrases synthesized to ${OUT_DIR}`);
if (failures > 0) process.exit(1);
