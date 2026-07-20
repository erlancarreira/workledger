import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { mkdir, writeFile } from 'node:fs/promises';

function productionUrl() {
  const configured = process.env.PUBLIC_SITE_URL || process.env.VERCEL_PROJECT_PRODUCTION_URL || 'https://workledger.vercel.app';
  return `${configured.startsWith('http') ? configured : `https://${configured}`}`.replace(/\/$/, '');
}

function seoFiles() {
  const siteUrl = productionUrl();
  return {
    name: 'workledger-seo-files',
    transformIndexHtml(html) {
      return html
        .replace('<link rel="canonical" href="/" />', `<link rel="canonical" href="${siteUrl}/" />`)
        .replace('<meta property="og:url" content="/" />', `<meta property="og:url" content="${siteUrl}/" />`)
        .replace('<meta property="og:image" content="/social-card.png" />', `<meta property="og:image" content="${siteUrl}/social-card.png" />`)
        .replace('<meta name="twitter:image" content="/social-card.png" />', `<meta name="twitter:image" content="${siteUrl}/social-card.png" />`);
    },
    async closeBundle() {
      await mkdir('dist', { recursive: true });
      await writeFile('dist/sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url><loc>${siteUrl}/</loc><changefreq>monthly</changefreq><priority>1.0</priority></url>\n</urlset>\n`);
      await writeFile('dist/robots.txt', `User-agent: *\nAllow: /\nDisallow: /*?client_portal=\nDisallow: /*?reset_token=\nDisallow: /*?github_\n\nUser-agent: GPTBot\nAllow: /\n\nUser-agent: ChatGPT-User\nAllow: /\n\nUser-agent: PerplexityBot\nAllow: /\n\nUser-agent: ClaudeBot\nAllow: /\n\nSitemap: ${siteUrl}/sitemap.xml\n`);
    }
  };
}

export default defineConfig({
  plugins: [react(), tailwindcss(), seoFiles()]
});
