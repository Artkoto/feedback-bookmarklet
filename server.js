const http = require('http');
const fs   = require('fs');
const path = require('path');
const PORT = 8877;

http.createServer((req, res) => {
  res.writeHead(200, {
    'Content-Type': 'application/javascript',
    'Access-Control-Allow-Origin': '*',
    'Cache-Control': 'no-cache',
  });
  res.end(fs.readFileSync(path.join(__dirname, 'feedback.js'), 'utf8'));
}).listen(PORT, () => {
  console.log(`✅ Feedback script disponible sur http://localhost:${PORT}/feedback.js`);
  console.log(`   Bookmarklet: javascript:void((s=document.createElement('script'),s.src='http://localhost:${PORT}/feedback.js?t='+Date.now(),document.body.appendChild(s)))`);
});
