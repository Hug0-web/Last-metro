"use strict";
const express = require("express");
const dotenv = require("dotenv");
const app = express();
const PORT = process.env.PORT || 3000;
const postgres = require('pg');

app.use(express.json());
dotenv.config();

const { Pool } = postgres;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function pdo(query, params = []) {
  const client = await pool.connect();
  try {
    const result = await client.query(query, params);
    client.release();
    return result;
  } catch (err) {
    client.release();
    throw err;
  }
}

app.get('/test-db', async (req, res) => {
  try {
    const result = await pdo('SELECT NOW() AS now');
    res.json({ success: true, time: result.rows[0].now });
  } catch (err) {
  console.error('Erreur lors de la requête', err);  
  res.status(500).json({
    success: false,
    error: err.message || err  
  });
 }
});

// Logger minimal: méthode, chemin, status, durée
app.use((req, res, next) => {
  const t0 = Date.now();
  res.on('finish', () => {
    const dt = Date.now() - t0;
    console.log(`${req.method} ${req.path} -> ${res.statusCode} ${dt}ms`);
  });
  next();
});

// Santé
app.get('/health', (_req, res) => res.status(200).json({ status: 'ok', service: 'dernier-metro-api' }));

// Utilitaire pour simuler un horaire HH:MM
function nextTimeFromNow(headwayMin = 3) {
  const now = new Date();
  const next = new Date(now.getTime() + headwayMin * 60 * 1000);
  const hh = String(next.getHours()).padStart(2, '0');
  const mm = String(next.getMinutes()).padStart(2, '0');
  return `${hh}:${mm}`;
}

// Endpoint métier minimal
app.get('/next-metro', (req, res) => {
  const station = (req.query.station || '').toString().trim();
  if (!station) return res.status(400).json({ error: "missing station" });
  return res.status(200).json({ station, line: 'M1', headwayMin: 3, nextArrival: nextTimeFromNow(3) });
});

// 404 JSON
app.use((_req, res) => res.status(404).json({ error: 'not found' }));

app.listen(PORT, () => console.log(`API ready on http://localhost:${PORT}`));
