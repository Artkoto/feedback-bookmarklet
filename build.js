#!/usr/bin/env node
/**
 * Build script — génère le bookmarklet depuis feedback.js
 * Usage: node build.js
 */
const fs = require('fs');
const path = require('path');

const src = fs.readFileSync(path.join(__dirname, 'feedback.js'), 'utf8');

const min = src
  .replace(/^\s*\/\/.*$/gm, '')   // commentaires // seuls sur leur ligne
  .replace(/\/\*[\s\S]*?\*\//g, '') // commentaires /* */
  .replace(/\n+/g, ' ')
  .replace(/\s{2,}/g, ' ')
  .trim();

const bookmarklet = 'javascript:void(' + encodeURIComponent(min) + ')';
fs.writeFileSync(path.join(__dirname, 'feedback.bookmarklet.txt'), bookmarklet);

console.log(`✅ feedback.bookmarklet.txt généré (${bookmarklet.length} chars)`);
