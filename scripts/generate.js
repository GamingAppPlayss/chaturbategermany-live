import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, "..");
const API_URL = "https://chaturbate.com/affiliates/api/onlinerooms/?format=json&wm=XhJGW";
const CANONICAL_DOMAIN = "https://www.chaturbategermany.live";

function ensureDir(p) {
  fs.mkdirSync(p, { recursive: true });
}

function writeFileSafe(p, content) {
  ensureDir(path.dirname(p));
  fs.writeFileSync(p, content, "utf8");
}

function slugify(s) {
  return String(s)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function metaHead({ title, description, canonical, ogType = "website", jsonLd = "" }) {
  const canonicalUrl = canonical.startsWith("http") ? canonical : CANONICAL_DOMAIN + canonical;
  return `
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <title>${escapeHtml(title)}</title>
    <meta name="description" content="${escapeHtml(description)}">
    <link rel="canonical" href="${escapeHtml(canonicalUrl)}">
    <link rel="preconnect" href="https://chaturbate.com">
    <link rel="dns-prefetch" href="https://chaturbate.com">
    <meta property="og:type" content="${escapeHtml(ogType)}">
    <meta property="og:title" content="${escapeHtml(title)}">
    <meta property="og:description" content="${escapeHtml(description)}">
    <meta property="og:url" content="${escapeHtml(canonicalUrl)}">
    <meta property="og:site_name" content="Chaturbate Germany">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${escapeHtml(title)}">
    <meta name="twitter:description" content="${escapeHtml(description)}">
    <link rel="stylesheet" href="/assets/style.css">
    ${jsonLd ? `<script type="application/ld+json">${jsonLd}</script>` : ""}
  `;
}

function headerNav() {
  return `
    <header class="site-header">
      <div class="container">
        <a class="brand" href="/">Chaturbate Germany</a>
        <nav class="nav">
          <a href="/">Startseite</a>
          <a href="/tags/">Tags</a>
        </nav>
      </div>
    </header>
  `;
}

function footer() {
  return `
    <footer class="site-footer">
      <div class="container">
        <p>© ${new Date().getFullYear()} Chaturbate Germany</p>
      </div>
    </footer>
  `;
}

function pageShell({ lang = "de", head, body }) {
  return `
    <!doctype html>
    <html lang="${lang}">
      <head>
        ${head}
      </head>
      <body>
        ${body}
      </body>
    </html>
  `.trim();
}

function homepage({ descriptionText }) {
  const jsonLd = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Chaturbate Germany",
    "url": CANONICAL_DOMAIN + "/",
    "inLanguage": "de",
  });
  const head = metaHead({
    title: "Best Chaturbate Models – Chaturbate Germany",
    description: "Entdecke die besten Chaturbate-Modelle. Live-Cams, deutsche Übersichten und komfortable Navigation.",
    canonical: "/",
    ogType: "website",
    jsonLd,
  });
  const body = `
    ${headerNav()}
    <main class="container">
      <h1>Best Chaturbate Models</h1>
      <div id="models-grid" class="grid"></div>
      <div class="actions">
        <button id="loadMore">Mehr laden</button>
      </div>
      <section class="about">
        <h2>Chaturbate</h2>
        <p>${escapeHtml(descriptionText)}</p>
      </section>
    </main>
    ${footer()}
    <script>
      const API_URL = "${API_URL}";
      const PAGE_SIZE = 40;
      let allRooms = [];
      let rendered = 0;
      function roomCard(room) {
        const username = room.username || room.name || "";
        const displayName = room.display_name || username;
        const path = "/models/" + encodeURIComponent(username) + "/";
        const tags = Array.isArray(room.tags) ? room.tags : [];
        const tagHtml = tags.slice(0, 5).map(t => "<span class=\\"tag\\">" + t + "</span>").join("");
        return \`
          <article class="card">
            <div class="card-body">
              <h3><a href="\${path}">\${displayName}</a></h3>
              <div class="tags">\${tagHtml}</div>
            </div>
          </article>
        \`;
      }
      function renderMore() {
        const target = document.getElementById("models-grid");
        const next = allRooms.slice(rendered, rendered + PAGE_SIZE);
        next.forEach(r => {
          const div = document.createElement("div");
          div.className = "grid-item";
          div.innerHTML = roomCard(r);
          target.appendChild(div);
        });
        rendered += next.length;
        if (rendered >= allRooms.length) {
          document.getElementById("loadMore").disabled = true;
        }
      }
      fetch(API_URL).then(r => r.json()).then(data => {
        const rooms = data.rooms || data || [];
        allRooms = rooms;
        renderMore();
      }).catch(() => {
        const target = document.getElementById("models-grid");
        target.innerHTML = "<p>Fehler beim Laden der Daten.</p>";
        document.getElementById("loadMore").disabled = true;
      });
      document.getElementById("loadMore").addEventListener("click", renderMore);
    </script>
  `;
  return pageShell({ head, body });
}

function modelDescriptionGerman(name) {
  return `Das Modell ${name} bietet einen lebendigen Live-Stream mit authentischer Interaktion. Entdecke spannende Momente, individuelle Vorlieben und eine freundliche Atmosphäre für erwachsene Zuschauer.`;
}

function tagDescriptionGerman(tag) {
  return `Kategorie ${tag}: Finde Live-Cam-Performances, die genau zu diesem Thema passen. Entdecke abwechslungsreiche Shows, individuelle Stile und Inhalte für erwachsene Nutzer.`;
}

function modelPage(room) {
  const username = room.username || room.name || "";
  const displayName = room.display_name || username;
  const canonical = `/models/${encodeURIComponent(username)}/`;
  const description = modelDescriptionGerman(displayName);
  const jsonLd = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "Person",
    "name": displayName,
    "url": CANONICAL_DOMAIN + canonical,
    "inLanguage": "de",
  });
  const head = metaHead({
    title: `Live Cam – ${displayName} | Chaturbate Germany`,
    description,
    canonical,
    ogType: "profile",
    jsonLd,
  });
  const tags = Array.isArray(room.tags) ? room.tags : [];
  const tagLinks = tags.map(t => `<a class="tag" href="/tags/${encodeURIComponent(slugify(t))}/">${escapeHtml(t)}</a>`).join("");
  const embedSrc = `https://chaturbate.com/in/?track=embed&room=${encodeURIComponent(username)}`;
  const body = `
    ${headerNav()}
    <main class="container">
      <h1>${escapeHtml(displayName)}</h1>
      <p class="lead">${escapeHtml(description)}</p>
      <div class="player">
        <iframe src="${embedSrc}" allowfullscreen loading="lazy"></iframe>
      </div>
      <section>
        <h2>Daten</h2>
        <div class="data-table">
          ${Object.keys(room).map(key => {
            const val = typeof room[key] === "object" ? JSON.stringify(room[key]) : String(room[key]);
            return `<div class="row"><div class="cell key">${escapeHtml(key)}</div><div class="cell val">${escapeHtml(val)}</div></div>`;
          }).join("")}
        </div>
      </section>
      <section>
        <h2>Tags</h2>
        <div class="tags">${tagLinks || "<span>Keine Tags</span>"}</div>
      </section>
      <section class="links">
        <a href="/">Zurück zur Startseite</a>
        <a href="/tags/">Alle Tags</a>
      </section>
    </main>
    ${footer()}
  `;
  return pageShell({ head, body });
}

function tagPage(tag, rooms) {
  const slug = slugify(tag);
  const canonical = `/tags/${encodeURIComponent(slug)}/`;
  const description = tagDescriptionGerman(tag);
  const jsonLd = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": `Tag: ${tag}`,
    "url": CANONICAL_DOMAIN + canonical,
    "inLanguage": "de",
  });
  const head = metaHead({
    title: `Tag ${tag} – Chaturbate Germany`,
    description,
    canonical,
    ogType: "website",
    jsonLd,
  });
  const items = rooms.map(room => {
    const username = room.username || room.name || "";
    const displayName = room.display_name || username;
    const path = `/models/${encodeURIComponent(username)}/`;
    return `<li><a href="${path}">${escapeHtml(displayName)}</a></li>`;
  }).join("");
  const body = `
    ${headerNav()}
    <main class="container">
      <h1>Tag: ${escapeHtml(tag)}</h1>
      <p class="lead">${escapeHtml(description)}</p>
      <ul class="list">${items || "<li>Keine Modelle mit diesem Tag</li>"}</ul>
      <section class="links">
        <a href="/tags/">Alle Tags</a>
        <a href="/">Startseite</a>
      </section>
    </main>
    ${footer()}
  `;
  return pageShell({ head, body });
}

function tagsIndexPage(tagsAlphabetical) {
  const canonical = `/tags/`;
  const description = "Alphabetische Liste aller Tags der Chaturbate-Modelle.";
  const jsonLd = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": "Tags",
    "url": CANONICAL_DOMAIN + canonical,
    "inLanguage": "de",
  });
  const head = metaHead({
    title: "Tags – Chaturbate Germany",
    description,
    canonical,
    ogType: "website",
    jsonLd,
  });
  const items = tagsAlphabetical.map(t => `<li><a href="/tags/${encodeURIComponent(slugify(t.name))}/">${escapeHtml(t.name)} (${t.count})</a></li>`).join("");
  const body = `
    ${headerNav()}
    <main class="container">
      <h1>Tags</h1>
      <ul class="list">${items || "<li>Keine Tags</li>"}</ul>
      <section class="links">
        <a href="/">Startseite</a>
      </section>
    </main>
    ${footer()}
  `;
  return pageShell({ head, body });
}

function robotsTxt() {
  return `User-agent: *
Allow: /
Sitemap: ${CANONICAL_DOMAIN}/sitemap.xml
`.trim();
}

function sitemapXml(urls) {
  const now = new Date().toISOString();
  return `
    <?xml version="1.0" encoding="UTF-8"?>
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
      ${urls.map(u => `
        <url>
          <loc>${CANONICAL_DOMAIN}${u}</loc>
          <lastmod>${now}</lastmod>
          <changefreq>hourly</changefreq>
          <priority>0.8</priority>
        </url>
      `).join("")}
    </urlset>
  `.trim();
}

async function fetchJson(url) {
  const res = await fetch(url, { headers: { "accept": "application/json" } });
  if (!res.ok) throw new Error("Failed to fetch API");
  return await res.json();
}

async function main() {
  ensureDir(path.join(ROOT, "assets"));
  ensureDir(path.join(ROOT, "models"));
  ensureDir(path.join(ROOT, "tags"));
  const homepageText = "Chaturbate ist ein interaktiver Live-Videochat für Erwachsene, in dem Performer in Echtzeit streamen. Nutzer können Shows entdecken, mit Modellen interagieren und eine vielfältige Auswahl an Kategorien genießen.";
  const homeHtml = homepage({ descriptionText: homepageText });
  writeFileSafe(path.join(ROOT, "index.html"), homeHtml);
  const data = await fetchJson(API_URL);
  const rooms = Array.isArray(data.rooms) ? data.rooms : Array.isArray(data) ? data : [];
  const urls = ["/", "/tags/"];
  const tagMap = new Map();
  for (const room of rooms) {
    const username = room.username || room.name;
    if (!username) continue;
    const html = modelPage(room);
    const modelDir = path.join(ROOT, "models", username);
    writeFileSafe(path.join(modelDir, "index.html"), html);
    urls.push(`/models/${encodeURIComponent(username)}/`);
    const tags = Array.isArray(room.tags) ? room.tags : [];
    for (const t of tags) {
      const key = slugify(t);
      const prev = tagMap.get(key) || { name: t, rooms: [] };
      prev.rooms.push(room);
      tagMap.set(key, prev);
    }
  }
  const tagsList = [...tagMap.values()].sort((a, b) => a.name.localeCompare(b.name, "de"));
  const tagsIndex = tagsIndexPage(tagsList.map(t => ({ name: t.name, count: t.rooms.length })));
  writeFileSafe(path.join(ROOT, "tags", "index.html"), tagsIndex);
  for (const entry of tagsList) {
    const dir = path.join(ROOT, "tags", slugify(entry.name));
    const html = tagPage(entry.name, entry.rooms);
    writeFileSafe(path.join(dir, "index.html"), html);
    urls.push(`/tags/${encodeURIComponent(slugify(entry.name))}/`);
  }
  writeFileSafe(path.join(ROOT, "robots.txt"), robotsTxt());
  writeFileSafe(path.join(ROOT, "sitemap.xml"), sitemapXml(urls));
  console.log("Generated pages:", urls.length, "URLs");
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
