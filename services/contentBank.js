const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, '..', 'data');

function loadJSON(filename) {
  const filePath = path.join(dataDir, filename);
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  } catch (err) {
    console.error(`${filename} yuklenemedi:`, err.message);
    return [];
  }
}

// Tum veri dosyalarini yukle
const dataSets = {
  books: loadJSON('books.json'),
  history: loadJSON('history.json'),
  culture: loadJSON('culture.json'),
  quizzes: loadJSON('quizzes.json'),
  art: loadJSON('art.json'),
  geography: loadJSON('geography.json'),
  leaders: loadJSON('leaders.json'),
  philosophy: loadJSON('philosophy.json')
};

function shuffleArray(arr) {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function getRandomContent(type, count = 4) {
  const pool = dataSets[type];
  if (!pool || pool.length === 0) {
    return { error: `Gecersiz icerik tipi veya veri bulunamadi: ${type}`, type, items: [], total: 0 };
  }

  const items = shuffleArray(pool).slice(0, Math.min(count, pool.length));
  return {
    type,
    items,
    total: pool.length,
    lastUpdated: new Date().toISOString()
  };
}

function getQuizQuestions(category, count = 5) {
  let pool = dataSets.quizzes;
  if (category && category !== 'all') {
    pool = dataSets.quizzes.filter(q => q.category === category);
  }

  if (pool.length === 0) {
    return { questions: [], total: 0, category };
  }

  const selected = shuffleArray(pool).slice(0, Math.min(count, pool.length));
  return {
    questions: selected,
    total: selected.length,
    category: category || 'all',
    availableCategories: [...new Set(dataSets.quizzes.map(q => q.category))]
  };
}

function getTodayInHistory() {
  const today = new Date();
  const month = today.getMonth() + 1;
  const day = today.getDate();

  const randomEvent = dataSets.history[Math.floor(Math.random() * dataSets.history.length)];

  return {
    date: `${day} ${getMonthName(month)}`,
    featured: randomEvent,
    dailyFact: getDailyFact(month, day),
    lastUpdated: new Date().toISOString()
  };
}

function getMonthName(month) {
  const months = ['Ocak', 'Subat', 'Mart', 'Nisan', 'Mayis', 'Haziran', 'Temmuz', 'Agustos', 'Eylul', 'Ekim', 'Kasim', 'Aralik'];
  return months[month - 1];
}

function getDailyFact(month, day) {
  const facts = {
    '1-1': 'Yilbasi - Gregoryen takviminin ilk gunu',
    '3-8': 'Dunya Kadinlar Gunu',
    '3-14': 'Pi Gunu (3.14)',
    '3-18': 'Canakkale Zaferi ve Sehitleri Anma Gunu',
    '4-23': 'Ulusal Egemenlik ve Cocuk Bayrami & Dunya Kitap Gunu',
    '5-1': 'Emek ve Dayanisma Gunu',
    '5-19': 'Ataturku Anma, Genclik ve Spor Bayrami',
    '6-5': 'Dunya Cevre Gunu',
    '7-20': 'Aya ilk adim (1969)',
    '8-30': 'Zafer Bayrami',
    '10-29': 'Cumhuriyet Bayrami',
    '11-10': 'Ataturku Anma Gunu',
    '12-10': 'Insan Haklari Gunu'
  };

  return facts[`${month}-${day}`] || `${day} ${getMonthName(month)} - Bugun tarihte neler oldu? Yenile butonuna basarak yeni bilgiler kesfet!`;
}

function getAllContentSummary() {
  return {
    book: dataSets.books[Math.floor(Math.random() * dataSets.books.length)],
    historyItem: dataSets.history[Math.floor(Math.random() * dataSets.history.length)],
    cultureItem: dataSets.culture[Math.floor(Math.random() * dataSets.culture.length)],
    quiz: shuffleArray(dataSets.quizzes).slice(0, 3)
  };
}

module.exports = {
  getRandomContent,
  getQuizQuestions,
  getTodayInHistory,
  getAllContentSummary
};
