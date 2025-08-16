async function loadArticles() {
  const container = document.getElementById('articles');
  try {
    const res = await fetch('data/articles.json', { cache: 'no-store' });
    let articles = await res.json();

    // Sort newest first by published date (fallback to 1970-01-01 if missing)
    articles.sort((a, b) => {
      const da = parseYMDLocal(a.published || '1970-01-01')?.getTime() ?? 0;
      const db = parseYMDLocal(b.published || '1970-01-01')?.getTime() ?? 0;
      return db - da;
    });

    container.innerHTML = articles.map(renderArticle).join('');
  } catch (e) {
    container.innerHTML = `<p>Failed to load articles.</p>`;
    console.error(e);
  }
}

function renderArticle(a) {
  const authorFull = `${a.authorFirst} ${a.authorLast}`;
  const byline = a.titleCredit ? `By ${authorFull} ‘${a.gradYear}` : authorFull;

  // Bold the **first** occurrence of each Brophy name across all paragraphs
  const paragraphs = (a.paragraphs || []).slice();
  const used = new Set();
  (a.brophyNamesToBold || []).forEach((name) => {
    if (used.has(name)) return;
    for (let i = 0; i < paragraphs.length; i++) {
      const idx = paragraphs[i].indexOf(name);
      if (idx !== -1) {
        paragraphs[i] =
          paragraphs[i].slice(0, idx) +
          `<strong>${escapeHtml(name)}</strong>` +
          paragraphs[i].slice(idx + name.length);
        used.add(name);
        break;
      }
    }
  });

  const dateLine = a.published
    ? `<p class="pubdate">${formatDate(a.published)}</p>`
    : '';

  const tags = (a.tags || [])
    .map((t) => `<span class="tag">${escapeHtml(t)}</span>`)
    .join(' ');

  return `
  <article>
    <figure class="featured">
      <img src="${escapeAttr(a.image || 'assets/sjb-logo.jpg')}" alt="Featured image">
      <figcaption>${escapeHtml(a.caption || 'Courtesy of Brophy Research Journal')}</figcaption>
    </figure>

    <div class="byline">
      <h2>${escapeHtml(a.title || (a.titleCredit ? `By ${a.authorFirst} ${a.authorLast} ‘${a.gradYear}` : `${a.authorFirst} ${a.authorLast}`))}</h2>
      ${dateLine}
    </div>

    ${a.abstract ? `<p class="abstract">${escapeHtml(a.abstract)}</p>` : ''}

    <p class="meta">
      <em>${escapeHtml(a.titleCredit ? `By ${a.authorFirst} ${a.authorLast} ‘${a.gradYear}` : `${a.authorFirst} ${a.authorLast}`)}</em>
      ${a.edition ? ` · <span class="edition">${escapeHtml(a.edition)}</span>` : ''}
    </p>

    ${
      a.url
        ? `<p class="actions"><a class="btn" href="${escapeAttr(a.url)}" target="_blank" rel="noopener">Read full article</a></p>`
        : ''
    }

    <p class="tags"><strong>Tags:</strong> ${tags}</p>
  </article>
`;

}

/* ---------- Helpers ---------- */

// Parse "YYYY-MM-DD" as a LOCAL date (avoids UTC shifting)
function parseYMDLocal(dateStr = '') {
  const [y, m, d] = String(dateStr).split('-').map(Number);
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d);
}

// Format a "YYYY-MM-DD" date as "Month D, YYYY"
function formatDate(dateStr) {
  const date = parseYMDLocal(dateStr);
  if (!date) return escapeHtml(dateStr || '');
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

// Escape HTML text nodes
function escapeHtml(s = '') {
  return String(s).replace(/[&<>"]/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;'
  }[c]));
}

// Escape attribute values
function escapeAttr(s = '') {
  return String(s).replace(/"/g, '&quot;');
}

loadArticles();

