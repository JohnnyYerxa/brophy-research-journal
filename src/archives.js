async function loadArchives() {
  const container = document.getElementById('archives');
  try {
    const res = await fetch('data/articles.json', { cache: 'no-store' });
    let articles = await res.json();

    // Group by edition
    const editions = {};
    for (const a of articles) {
      const ed = a.edition || 'Unsorted';
      if (!editions[ed]) editions[ed] = [];
      editions[ed].push(a);
    }

    // Build HTML
    // Build HTML (sort editions newest first)
let html = '';

const sortedEditions = Object.keys(editions).sort((a, b) => {
  // Extract year + season if possible
  const [seasonA, yearA] = a.split(' ');
  const [seasonB, yearB] = b.split(' ');

  const yrA = parseInt(yearA) || 0;
  const yrB = parseInt(yearB) || 0;

  // Sort by year desc first
  if (yrA !== yrB) return yrB - yrA;

  // If same year, put Spring before Fall
  const seasonOrder = { 'Spring': 1, 'Fall': 2 };
  const ordA = seasonOrder[seasonA] || 99;
  const ordB = seasonOrder[seasonB] || 99;
  return ordA - ordB;
});

for (const edition of sortedEditions) {
  const items = editions[edition];
  html += `<section><h2>${escapeHtml(edition)}</h2><ul>`;
  items.forEach(item => {
    const title = escapeHtml(item.title || '');
    const abstract = escapeHtml(item.abstract || '');
    const link = item.url
      ? `<a href="${escapeAttr(item.url)}" target="_blank" rel="noopener">${title}</a>`
      : title;
    html += `<li><strong>${link}</strong>${abstract ? ` — ${abstract}` : ''}</li>`;
  });
  html += `</ul><p class="back-top"><a href="#top">Back to top ↑</a></p></section>`;
}
container.innerHTML = html;

    container.innerHTML = html;
  } catch (e) {
    container.innerHTML = `<p>Failed to load archives.</p>`;
    console.error(e);
  }
}

function escapeHtml(s = '') {
  return String(s).replace(/[&<>"]/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;'
  }[c]));
}

function escapeAttr(s = '') {
  return String(s).replace(/"/g, '&quot;');
}

loadArchives();

