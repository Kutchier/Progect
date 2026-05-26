'use strict';

const path = require('path');
const fs = require('fs');

const DB_PATH = path.join(__dirname, '..', 'data');
const SCORES_FILE = path.join(DB_PATH, 'scores.json');
const STATS_FILE = path.join(DB_PATH, 'stats.json');

if (!fs.existsSync(DB_PATH)) fs.mkdirSync(DB_PATH, { recursive: true });

function readJSON(file) {
  try {
    if (!fs.existsSync(file)) return [];
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch {
    return [];
  }
}

function writeJSON(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf8');
}

function saveScore(entry) {
  const scores = readJSON(SCORES_FILE);
  scores.push({
    ...entry,
    timestamp: new Date().toISOString()
  });
  scores.sort((a, b) => b.score - a.score);
  if (scores.length > 100) scores.splice(100);
  writeJSON(SCORES_FILE, scores);
}

function getTopScores(limit = 10) {
  const scores = readJSON(SCORES_FILE);
  return scores.slice(0, limit);
}

function savePlayerStats(playerName, stats) {
  const allStats = readJSON(STATS_FILE);
  const existing = allStats.find(s => s.name === playerName);
  if (existing) {
    existing.gamesPlayed = (existing.gamesPlayed || 0) + 1;
    existing.totalKills = (existing.totalKills || 0) + (stats.kills || 0);
    existing.totalGold = (existing.totalGold || 0) + (stats.gold || 0);
    existing.maxLevel = Math.max(existing.maxLevel || 1, stats.level || 1);
    existing.wins = (existing.wins || 0) + (stats.won ? 1 : 0);
    existing.lastPlayed = new Date().toISOString();
  } else {
    allStats.push({
      name: playerName,
      gamesPlayed: 1,
      totalKills: stats.kills || 0,
      totalGold: stats.gold || 0,
      maxLevel: stats.level || 1,
      wins: stats.won ? 1 : 0,
      lastPlayed: new Date().toISOString()
    });
  }
  writeJSON(STATS_FILE, allStats);
}

function getPlayerStats(playerName) {
  const allStats = readJSON(STATS_FILE);
  return allStats.find(s => s.name === playerName) || null;
}

module.exports = { saveScore, getTopScores, savePlayerStats, getPlayerStats };
