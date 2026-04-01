require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { startDailyDigest } = require('./cron/dailyDigest');
const newsApi = require('./services/newsApi');
const financeApi = require('./services/financeApi');
const contentBank = require('./services/contentBank');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// --- API Routes ---

// Haber endpoints
app.get('/api/news/:category', async (req, res) => {
  try {
    const { category } = req.params;
    const data = await newsApi.getNews(category);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Haberler alınamadı', details: err.message });
  }
});

// Ekonomi endpoint
app.get('/api/finance', async (req, res) => {
  try {
    const data = await financeApi.getFinanceData();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Ekonomi verileri alınamadı', details: err.message });
  }
});

// Statik içerik endpoints (kitaplar, tarih, kültür)
app.get('/api/content/:type', (req, res) => {
  try {
    const { type } = req.params;
    const count = parseInt(req.query.count) || 4;
    const data = contentBank.getRandomContent(type, count);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'İçerik alınamadı', details: err.message });
  }
});

// Quiz endpoint
app.get('/api/quiz', (req, res) => {
  try {
    const { category, count } = req.query;
    const questions = contentBank.getQuizQuestions(category, parseInt(count) || 5);
    res.json(questions);
  } catch (err) {
    res.status(500).json({ error: 'Quiz soruları alınamadı', details: err.message });
  }
});

// Bugün tarihte ne oldu
app.get('/api/today-in-history', (req, res) => {
  try {
    const data = contentBank.getTodayInHistory();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Tarih verisi alınamadı', details: err.message });
  }
});

// Mail digest onizleme - icerik toplama
app.get('/api/digest-preview', async (req, res) => {
  try {
    const { collectDigestData } = require('./cron/dailyDigest');
    const data = await collectDigestData();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Onizleme verisi alinamadi', details: err.message });
  }
});

// Mail digest gonder (secili konularla)
app.post('/api/send-digest', async (req, res) => {
  try {
    const { sendDigestWithData } = require('./cron/dailyDigest');
    const selectedData = req.body;
    await sendDigestWithData(selectedData);
    res.json({ success: true, message: 'Gunluk ozet gonderildi!' });
  } catch (err) {
    res.status(500).json({ error: 'Mail gonderilemedi', details: err.message });
  }
});

// Start cron job for daily digest
startDailyDigest();

app.listen(PORT, () => {
  console.log(`Intellect Panel çalışıyor: http://localhost:${PORT}`);
});
