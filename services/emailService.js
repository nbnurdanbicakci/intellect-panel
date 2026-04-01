const nodemailer = require('nodemailer');

function createTransporter() {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD
    }
  });
}

function generateDigestHTML(data) {
  const { news, finance, content } = data;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #0f172a; color: #e2e8f0; margin: 0; padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; background: #1e293b; border-radius: 12px; overflow: hidden; }
    .header { background: linear-gradient(135deg, #6366f1, #8b5cf6); padding: 30px; text-align: center; }
    .header h1 { color: white; margin: 0; font-size: 24px; }
    .header p { color: rgba(255,255,255,0.8); margin: 8px 0 0; }
    .section { padding: 20px; border-bottom: 1px solid #334155; }
    .section-title { color: #a78bfa; font-size: 16px; font-weight: bold; margin-bottom: 12px; display: flex; align-items: center; gap: 8px; }
    .news-item { margin-bottom: 12px; padding: 10px; background: #293548; border-radius: 8px; }
    .news-item h3 { margin: 0 0 4px; font-size: 14px; color: #f1f5f9; }
    .news-item p { margin: 0; font-size: 12px; color: #94a3b8; }
    .news-item a { color: #818cf8; text-decoration: none; font-size: 12px; }
    .finance-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
    .finance-item { background: #293548; padding: 10px; border-radius: 8px; text-align: center; }
    .finance-item .value { font-size: 18px; font-weight: bold; color: #10b981; }
    .finance-item .label { font-size: 11px; color: #94a3b8; }
    .book-card { background: #293548; padding: 15px; border-radius: 8px; }
    .book-card h3 { margin: 0 0 4px; color: #f1f5f9; }
    .book-card .author { color: #a78bfa; font-size: 13px; }
    .book-card p { font-size: 13px; color: #94a3b8; margin: 8px 0 0; }
    .history-card { background: #293548; padding: 15px; border-radius: 8px; margin-top: 10px; }
    .quiz-item { background: #293548; padding: 10px; border-radius: 8px; margin-bottom: 8px; }
    .quiz-item .question { font-size: 13px; color: #f1f5f9; }
    .quiz-item .answer { font-size: 12px; color: #10b981; margin-top: 4px; }
    .footer { padding: 20px; text-align: center; color: #64748b; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Gunluk Entelektuel Ozet</h1>
      <p>${new Date().toLocaleDateString('tr-TR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
    </div>

    ${finance ? `
    <div class="section">
      <div class="section-title">📊 Ekonomi</div>
      <div class="finance-grid">
        ${Object.entries(finance.currencies || {}).map(([key, val]) => `
          <div class="finance-item">
            <div class="label">${val.label}</div>
            <div class="value">${val.value ? val.value.toFixed(2) : 'N/A'}</div>
          </div>
        `).join('')}
      </div>
    </div>` : ''}

    ${news && news.length > 0 ? `
    <div class="section">
      <div class="section-title">📰 Onemli Haberler</div>
      ${news.slice(0, 5).map(item => `
        <div class="news-item">
          <h3>${item.title}</h3>
          <p>${(item.description || '').substring(0, 120)}...</p>
          ${item.url && item.url !== '#' ? `<a href="${item.url}">Devamini oku →</a>` : ''}
        </div>
      `).join('')}
    </div>` : ''}

    ${content?.book ? `
    <div class="section">
      <div class="section-title">📚 Gunun Kitabi</div>
      <div class="book-card">
        <h3>${content.book.title}</h3>
        <div class="author">${content.book.author} (${content.book.year})</div>
        <p>${content.book.summary}</p>
      </div>
    </div>` : ''}

    ${content?.historyItem ? `
    <div class="section">
      <div class="section-title">🏛️ Tarihten Bir Sayfa</div>
      <div class="history-card">
        <h3>${content.historyItem.person} (${content.historyItem.years})</h3>
        <p>${content.historyItem.summary}</p>
        <p style="color: #a78bfa; margin-top: 8px; font-style: italic;">"${content.historyItem.famous_quote}"</p>
      </div>
    </div>` : ''}

    ${content?.quiz && content.quiz.length > 0 ? `
    <div class="section">
      <div class="section-title">🧠 Mini Quiz</div>
      ${content.quiz.map(q => `
        <div class="quiz-item">
          <div class="question">❓ ${q.question}</div>
          <div class="answer">✅ ${q.options[q.correct]}</div>
        </div>
      `).join('')}
    </div>` : ''}

    <div class="footer">
      <p>Intellect Panel - Gunluk Entelektuel Gelisim</p>
      <p>Bu mail otomatik olarak gonderilmistir.</p>
    </div>
  </div>
</body>
</html>`;
}

async function sendDailyDigest(digestData) {
  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD;
  const recipient = process.env.DIGEST_RECIPIENT;

  if (!user || !pass || !recipient ||
      user === 'your_email@gmail.com' ||
      pass === 'your_app_password_here') {
    console.log('Email yapılandırması eksik - günlük özet gönderilemedi');
    return { success: false, reason: 'Email yapılandırması eksik' };
  }

  const transporter = createTransporter();
  const html = generateDigestHTML(digestData);

  const mailOptions = {
    from: `Intellect Panel <${user}>`,
    to: recipient,
    subject: `🧠 Günlük Entelektüel Özet - ${new Date().toLocaleDateString('tr-TR')}`,
    html
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Günlük özet gönderildi:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (err) {
    console.error('Email gönderim hatası:', err.message);
    return { success: false, reason: err.message };
  }
}

module.exports = { sendDailyDigest, generateDigestHTML };
