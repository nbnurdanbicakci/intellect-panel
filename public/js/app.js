// Ana uygulama - Intellect Panel v3

document.addEventListener('DOMContentLoaded', () => {
  initTodayBar();
  loadTheme();

  const isGuncelPage = !!document.getElementById('news-section');
  const isBilgiPage = !!document.getElementById('knowledge-section');

  if (isGuncelPage) {
    refreshFinance();
    refreshCategory('ai');
    refreshCategory('turkey_politics');
    refreshCategory('world_politics');
    refreshCategory('events');
    refreshCategory('arts');
    refreshCategory('trending');
  }

  if (isBilgiPage) {
    refreshContent('history');
    refreshContent('art');
    refreshContent('books');
    refreshContent('culture');
    refreshContent('geography');
    refreshContent('leaders');
    refreshContent('philosophy');
  }
});

function initTodayBar() {
  const now = new Date();
  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  document.getElementById('todayDate').textContent = now.toLocaleDateString('tr-TR', options);

  fetch('/api/today-in-history')
    .then(r => r.json())
    .then(data => {
      document.getElementById('todayFact').textContent = data.dailyFact || '';
    })
    .catch(() => {});
}

// === Haber kategorisi yenile ===
async function refreshCategory(category) {
  const contentEl = document.getElementById(`${category}Content`) ||
                    document.getElementById(`${category.replace('_', '')}Content`);

  const card = contentEl?.closest('.card');
  const refreshBtn = card?.querySelector('.btn-refresh');
  if (refreshBtn) refreshBtn.classList.add('spinning');

  try {
    const res = await fetch(`/api/news/${category}`);
    const data = await res.json();
    if (contentEl) contentEl.innerHTML = renderNewsItems(data.articles);
  } catch (err) {
    if (contentEl) contentEl.innerHTML = '<div class="empty-state"><p>Veriler yuklenemedi</p></div>';
  } finally {
    if (refreshBtn) setTimeout(() => refreshBtn.classList.remove('spinning'), 700);
  }
}

// === Bilgi icerik yenile (4 item) ===
async function refreshContent(type) {
  const contentEl = document.getElementById(`${type}Content`);
  const card = contentEl?.closest('.card');
  const refreshBtn = card?.querySelector('.btn-refresh');
  if (refreshBtn) refreshBtn.classList.add('spinning');

  try {
    const res = await fetch(`/api/content/${type}?count=4`);
    const data = await res.json();

    if (contentEl && data.items) {
      contentEl.innerHTML = renderKnowledgeItems(data.items, type);
    }
  } catch (err) {
    if (contentEl) contentEl.innerHTML = '<div class="empty-state"><p>Icerik yuklenemedi</p></div>';
  } finally {
    if (refreshBtn) setTimeout(() => refreshBtn.classList.remove('spinning'), 700);
  }
}

// === Ekonomi - kompakt bar ===
async function refreshFinance() {
  const barItems = document.getElementById('financeBarItems');
  try {
    const res = await fetch('/api/finance');
    const data = await res.json();
    if (barItems) barItems.innerHTML = renderFinanceBar(data);
  } catch (err) {
    if (barItems) barItems.innerHTML = '<span class="fb-loading">Veri alinamadi</span>';
  }
}

// === Mail Digest - Onizleme sistemi ===
let mailDigestData = null;

async function sendDigest() {
  // Onizleme modalini ac, icerik yukle
  document.getElementById('mailModal').classList.add('active');
  const container = document.getElementById('mailPreviewContent');
  container.innerHTML = '<div class="skeleton-list"><div class="skeleton-item"></div><div class="skeleton-item"></div><div class="skeleton-item"></div></div>';

  try {
    const res = await fetch('/api/digest-preview');
    mailDigestData = await res.json();
    renderMailPreview();
  } catch (err) {
    container.innerHTML = '<div class="empty-state"><p>Onizleme yuklenemedi</p></div>';
  }
}

function renderMailPreview() {
  if (!mailDigestData || !mailDigestData.sections) return;

  const container = document.getElementById('mailPreviewContent');
  let html = '';

  mailDigestData.sections.forEach((section, idx) => {
    const isEnabled = section.enabled !== false;
    const contentHtml = renderMailSectionContent(section);

    html += `
      <div class="mail-section ${isEnabled ? '' : 'mail-section-disabled'}" data-section-idx="${idx}">
        <div class="mail-section-header">
          <label class="mail-toggle">
            <input type="checkbox" ${isEnabled ? 'checked' : ''} onchange="toggleMailSection(${idx}, this.checked)">
            <span class="mail-toggle-slider"></span>
          </label>
          <h4>${escapeHtml(section.title)}</h4>
          <span class="mail-section-type">${section.type === 'news' ? 'Haber' : section.type === 'finance' ? 'Piyasa' : section.type === 'book' ? 'Kitap' : section.type === 'history' ? 'Tarih' : 'Quiz'}</span>
        </div>
        <div class="mail-section-body">${contentHtml}</div>
      </div>
    `;
  });

  container.innerHTML = html;
}

function renderMailSectionContent(section) {
  if (!section.data) return '<p class="mail-empty">Veri yok</p>';

  switch (section.type) {
    case 'finance':
      if (!section.data.currencies) return '<p class="mail-empty">Piyasa verisi yok</p>';
      return Object.entries(section.data.currencies)
        .filter(([,v]) => v.value)
        .map(([,v]) => `<span class="mail-finance-chip">${escapeHtml(v.label)}: <strong>${v.value.toFixed(2)}</strong></span>`)
        .join(' ');

    case 'news':
      if (!Array.isArray(section.data) || section.data.length === 0) return '<p class="mail-empty">Haber yok</p>';
      return section.data.map(a => `
        <div class="mail-news-item">
          <span class="mail-news-title">${escapeHtml(a.title)}</span>
          <span class="mail-news-source">${escapeHtml(a.source || '')}</span>
        </div>
      `).join('');

    case 'book':
      return `<div class="mail-book"><strong>${escapeHtml(section.data.title)}</strong> - ${escapeHtml(section.data.author)} (${section.data.year})</div>`;

    case 'history':
      return `<div class="mail-book"><strong>${escapeHtml(section.data.person)}</strong> (${escapeHtml(section.data.years)}) - ${escapeHtml(section.data.title)}</div>`;

    case 'quiz':
      if (!Array.isArray(section.data)) return '<p class="mail-empty">Quiz yok</p>';
      return section.data.map(q => `<div class="mail-quiz-item">${escapeHtml(q.question)}</div>`).join('');

    default:
      return '<p class="mail-empty">Icerik</p>';
  }
}

function toggleMailSection(idx, enabled) {
  if (!mailDigestData || !mailDigestData.sections[idx]) return;
  mailDigestData.sections[idx].enabled = enabled;

  const sectionEl = document.querySelector(`.mail-section[data-section-idx="${idx}"]`);
  if (sectionEl) {
    sectionEl.classList.toggle('mail-section-disabled', !enabled);
  }
}

function closeMailModal() {
  document.getElementById('mailModal').classList.remove('active');
  mailDigestData = null;
}

async function confirmSendDigest() {
  if (!mailDigestData) return;

  const btn = document.getElementById('mailSendBtn');
  btn.textContent = 'Gonderiliyor...';
  btn.disabled = true;

  try {
    const res = await fetch('/api/send-digest', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(mailDigestData)
    });
    const data = await res.json();

    if (data.success) {
      showToast('Gunluk ozet mailinize gonderildi!', 'success');
      closeMailModal();
    } else {
      showToast('Mail gonderilemedi. .env ayarlarini kontrol edin.', 'error');
    }
  } catch (err) {
    showToast('Mail servisi hatasi.', 'error');
  } finally {
    btn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg> Gonder';
    btn.disabled = false;
  }
}

// === Tema ===
function toggleTheme() {
  const html = document.documentElement;
  const current = html.getAttribute('data-theme');
  const next = current === 'light' ? 'dark' : 'light';
  html.setAttribute('data-theme', next);
  localStorage.setItem('theme', next);
  updateThemeIcon(next);
}

function loadTheme() {
  const saved = localStorage.getItem('theme') || 'light';
  document.documentElement.setAttribute('data-theme', saved);
  updateThemeIcon(saved);
}

function updateThemeIcon(theme) {
  const btn = document.getElementById('themeToggle');
  if (!btn) return;
  if (theme === 'light') {
    btn.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>';
  } else {
    btn.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>';
  }
}

// === Toast ===
function showToast(message, type = 'info') {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.className = `toast ${type} show`;
  setTimeout(() => toast.classList.remove('show'), 3500);
}
