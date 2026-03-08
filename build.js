#!/usr/bin/env node
/**
 * Build script — génère le bookmarklet depuis feedback.js
 * Usage: node build.js
 */
const fs   = require('fs');
const path = require('path');
const { minify } = require('terser');

(async () => {
  const src = fs.readFileSync(path.join(__dirname, 'feedback.js'), 'utf8');

  const result = await minify(src, {
    compress: { drop_console: false },
    mangle: true,
    format: { semicolons: false },
  });

  if (result.error) { console.error('Erreur terser:', result.error); process.exit(1); }

  const min = result.code.replace(/;\s*$/, ''); // enlever ; final
  const bookmarklet = 'javascript:void(' + encodeURIComponent(min) + ')';
  fs.writeFileSync(path.join(__dirname, 'feedback.bookmarklet.txt'), bookmarklet);

  console.log(`✅ feedback.bookmarklet.txt généré (${bookmarklet.length} chars)`);
})();
