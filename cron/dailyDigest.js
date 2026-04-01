const cron = require('node-cron');
const { sendDailyDigest } = require('../services/emailService');
const newsApi = require('../services/newsApi');
const financeApi = require('../services/financeApi');
const contentBank = require('../services/contentBank');

async function collectDigestData() {
  const [aiNews, turkeyNews, worldNews, eventsNews, artsNews, trendingNews, finance] = await Promise.all([
    newsApi.getNews('ai'),
    newsApi.getNews('turkey_politics'),
    newsApi.getNews('world_politics'),
    newsApi.getNews('events'),
    newsApi.getNews('arts'),
    newsApi.getNews('trending'),
    financeApi.getFinanceData()
  ]);

  const content = contentBank.getAllContentSummary();

  return {
    sections: [
      { id: 'finance', title: 'Ekonomi & Piyasalar', type: 'finance', data: finance, enabled: true },
      { id: 'ai', title: 'Yapay Zeka & Dijital', type: 'news', data: aiNews.articles.slice(0, 3), enabled: true },
      { id: 'turkey', title: 'Turkiye Siyaseti', type: 'news', data: turkeyNews.articles.slice(0, 3), enabled: true },
      { id: 'world', title: 'Dunya Siyaseti', type: 'news', data: worldNews.articles.slice(0, 3), enabled: true },
      { id: 'events', title: 'Etkinlikler', type: 'news', data: eventsNews.articles.slice(0, 2), enabled: true },
      { id: 'arts', title: 'Sanat & Film', type: 'news', data: artsNews.articles.slice(0, 2), enabled: true },
      { id: 'trending', title: 'Dunyaca Konusulanlar', type: 'news', data: trendingNews.articles.slice(0, 2), enabled: true },
      { id: 'book', title: 'Gunun Kitabi', type: 'book', data: content.book, enabled: true },
      { id: 'history', title: 'Tarihten Bir Sayfa', type: 'history', data: content.historyItem, enabled: true },
      { id: 'quiz', title: 'Mini Quiz', type: 'quiz', data: content.quiz, enabled: true }
    ]
  };
}

async function sendDigestWithData(filteredData) {
  // filteredData contains { sections: [...] } with enabled flags
  const data = filteredData || await collectDigestData();
  const enabledSections = data.sections ? data.sections.filter(s => s.enabled) : [];

  // Convert to old format for email service
  const news = [];
  let finance = null;
  let content = { book: null, historyItem: null, quiz: [] };

  enabledSections.forEach(s => {
    if (s.type === 'news' && s.data) news.push(...(Array.isArray(s.data) ? s.data : []));
    if (s.type === 'finance') finance = s.data;
    if (s.type === 'book') content.book = s.data;
    if (s.type === 'history') content.historyItem = s.data;
    if (s.type === 'quiz') content.quiz = s.data;
  });

  return await sendDailyDigest({ news: news.slice(0, 8), finance, content });
}

async function sendDigestNow() {
  console.log('Gunluk ozet hazirlaniyor...');
  const data = await collectDigestData();
  return await sendDigestWithData(data);
}

function startDailyDigest() {
  cron.schedule('0 8 * * *', async () => {
    console.log('Gunluk digest cron calistirildi:', new Date().toISOString());
    await sendDigestNow();
  }, { timezone: 'Europe/Istanbul' });

  console.log('Gunluk digest cron job baslatildi (Her gun 08:00 Istanbul saati)');
}

module.exports = { startDailyDigest, sendDigestNow, collectDigestData, sendDigestWithData };
