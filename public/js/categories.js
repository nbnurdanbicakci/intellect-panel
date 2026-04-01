// Kategori render fonksiyonlari

function renderNewsItems(articles) {
  if (!articles || articles.length === 0) {
    return '<div class="empty-state"><p>Haber bulunamadi. Yenile butonuna basin.</p></div>';
  }

  return articles.map(article => `
    <div class="news-item">
      <h4>${escapeHtml(article.title)}</h4>
      <p>${escapeHtml(article.description || '')}</p>
      <div class="meta">
        <span>${escapeHtml(article.source || '')} ${article.publishedAt ? '· ' + formatDate(article.publishedAt) : ''}</span>
        ${article.url && article.url !== '#' ? `<a href="${escapeHtml(article.url)}" target="_blank" rel="noopener">Kaynak</a>` : ''}
      </div>
    </div>
  `).join('');
}

// Generic knowledge card renderer - used by all knowledge categories
function renderKnowledgeItems(items, type) {
  if (!items || items.length === 0) {
    return '<div class="empty-state"><p>Icerik yukleniyor...</p></div>';
  }

  switch (type) {
    case 'books': return renderBookItems(items);
    case 'history': return renderHistoryItems(items);
    case 'culture': return renderCultureItems(items);
    case 'art': return renderArtItems(items);
    case 'geography': return renderGeoItems(items);
    case 'leaders': return renderLeaderItems(items);
    case 'philosophy': return renderPhilosophyItems(items);
    default: return renderGenericItems(items);
  }
}

function renderBookItems(items) {
  return items.map(book => `
    <div class="k-item">
      <div class="k-item-header">
        <h4>${escapeHtml(book.title)}</h4>
        <span class="k-tag">${formatBookCategory(book.category)}</span>
      </div>
      <div class="k-sub">${escapeHtml(book.author)} · ${book.year} · ${escapeHtml(book.country)}</div>
      <p>${escapeHtml(book.summary)}</p>
      <div class="k-detail"><strong>Neden onemli:</strong> ${escapeHtml(book.why_important)}</div>
      <div class="k-funfact">${escapeHtml(book.fun_fact)}</div>
    </div>
  `).join('');
}

function renderHistoryItems(items) {
  return items.map(item => `
    <div class="k-item">
      <div class="k-item-header">
        <h4>${escapeHtml(item.person)}</h4>
        <span class="k-tag">${formatHistoryCategory(item.category)}</span>
      </div>
      <div class="k-sub">${escapeHtml(item.years)} · ${escapeHtml(item.title)}</div>
      <p>${escapeHtml(item.summary)}</p>
      <div class="k-detail"><strong>Gunumuze yansimasi:</strong> ${escapeHtml(item.modern_relevance)}</div>
      ${item.famous_quote ? `<div class="k-quote">"${escapeHtml(item.famous_quote)}"</div>` : ''}
    </div>
  `).join('');
}

function renderCultureItems(items) {
  return items.map(item => `
    <div class="k-item">
      <div class="k-item-header">
        <h4>${escapeHtml(item.title)}</h4>
        <span class="k-tag">${formatCultureCategory(item.category)}</span>
      </div>
      <p>${escapeHtml(item.summary)}</p>
      ${item.key_facts ? `<ul class="k-facts">${item.key_facts.map(f => `<li>${escapeHtml(f)}</li>`).join('')}</ul>` : ''}
      <div class="k-funfact">${escapeHtml(item.fun_fact)}</div>
    </div>
  `).join('');
}

function renderArtItems(items) {
  return items.map(item => `
    <div class="k-item">
      <div class="k-item-header">
        <h4>${escapeHtml(item.title)}</h4>
        <span class="k-tag">${escapeHtml(item.type || '')}</span>
      </div>
      ${item.artist ? `<div class="k-sub">${escapeHtml(item.artist)} · ${escapeHtml(item.year || '')}</div>` : `<div class="k-sub">${escapeHtml(item.year || '')}</div>`}
      <p>${escapeHtml(item.summary)}</p>
      <div class="k-detail"><strong>Onemi:</strong> ${escapeHtml(item.why_important)}</div>
      <div class="k-funfact">${escapeHtml(item.fun_fact)}</div>
      ${item.source ? `<a class="k-source" href="${escapeHtml(item.source)}" target="_blank" rel="noopener">Kaynak</a>` : ''}
    </div>
  `).join('');
}

function renderGeoItems(items) {
  return items.map(item => `
    <div class="k-item">
      <div class="k-item-header">
        <h4>${escapeHtml(item.title)}</h4>
        <span class="k-tag">${item.region === 'turkiye' ? 'Turkiye' : 'Dunya'}</span>
      </div>
      <p>${escapeHtml(item.summary)}</p>
      ${item.key_facts ? `<ul class="k-facts">${item.key_facts.map(f => `<li>${escapeHtml(f)}</li>`).join('')}</ul>` : ''}
      <div class="k-funfact">${escapeHtml(item.fun_fact)}</div>
      ${item.source ? `<a class="k-source" href="${escapeHtml(item.source)}" target="_blank" rel="noopener">Kaynak</a>` : ''}
    </div>
  `).join('');
}

function renderLeaderItems(items) {
  return items.map(item => `
    <div class="k-item">
      <div class="k-item-header">
        <h4>${escapeHtml(item.name)}</h4>
        <span class="k-tag">${escapeHtml(item.field || '')}</span>
      </div>
      <div class="k-sub">${escapeHtml(item.years)} · ${escapeHtml(item.title)}</div>
      <p>${escapeHtml(item.summary)}</p>
      ${item.achievements ? `<div class="k-detail"><strong>Basarilari:</strong> ${item.achievements.map(a => escapeHtml(a)).join(', ')}</div>` : ''}
      ${item.famous_quote ? `<div class="k-quote">"${escapeHtml(item.famous_quote)}"</div>` : ''}
      ${item.source ? `<a class="k-source" href="${escapeHtml(item.source)}" target="_blank" rel="noopener">Kaynak</a>` : ''}
    </div>
  `).join('');
}

function renderPhilosophyItems(items) {
  return items.map(item => `
    <div class="k-item">
      <div class="k-item-header">
        <h4>${escapeHtml(item.title)}</h4>
        <span class="k-tag">${escapeHtml(item.type || '')}</span>
      </div>
      <div class="k-sub">${escapeHtml(item.period || '')}</div>
      <p>${escapeHtml(item.summary)}</p>
      ${item.key_ideas ? `<ul class="k-facts">${item.key_ideas.map(i => `<li>${escapeHtml(i)}</li>`).join('')}</ul>` : ''}
      <div class="k-detail"><strong>Gunumuze etkisi:</strong> ${escapeHtml(item.modern_relevance)}</div>
      ${item.famous_quote ? `<div class="k-quote">"${escapeHtml(item.famous_quote)}"</div>` : ''}
      ${item.source ? `<a class="k-source" href="${escapeHtml(item.source)}" target="_blank" rel="noopener">Kaynak</a>` : ''}
    </div>
  `).join('');
}

function renderGenericItems(items) {
  return items.map(item => `
    <div class="k-item">
      <h4>${escapeHtml(item.title || item.name || item.person || '')}</h4>
      <p>${escapeHtml(item.summary || item.description || '')}</p>
    </div>
  `).join('');
}

function renderFinanceBar(data) {
  if (!data || !data.currencies) return '<span class="fb-loading">Veri alinamadi</span>';

  let html = '';
  Object.entries(data.currencies).forEach(([key, info]) => {
    if (info.value) {
      html += `<div class="fb-item"><span class="fb-label">${escapeHtml(info.label)}</span><span class="fb-value">${info.value.toFixed(2)}</span></div>`;
    }
  });

  if (data.commodities?.gold?.value) {
    html += `<div class="fb-item"><span class="fb-label">Altin (ons)</span><span class="fb-value">$${data.commodities.gold.value.toFixed(0)}</span></div>`;
  }

  return html;
}

// Helpers
function escapeHtml(text) {
  if (!text) return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function formatDate(dateStr) {
  try {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now - date;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours < 1) return 'Az once';
    if (hours < 24) return `${hours}s once`;
    if (hours < 48) return 'Dun';
    return date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' });
  } catch { return ''; }
}

function formatBookCategory(cat) {
  return { 'dunya_klasik': 'Dunya Klasigi', 'turk_edebiyat': 'Turk Edebiyati', 'modern': 'Modern' }[cat] || cat;
}

function formatHistoryCategory(cat) {
  return { 'lider': 'Lider', 'bilim_sanat': 'Bilim & Sanat', 'olay': 'Tarihi Olay' }[cat] || cat;
}

function formatCultureCategory(cat) {
  return { 'etkinlik': 'Etkinlik', 'spor': 'Spor', 'genel_kultur': 'Genel Kultur', 'donem': 'Donem' }[cat] || cat;
}
