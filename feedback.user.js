// ==UserScript==
// @name         Feedback Tool
// @namespace    feedback-tool
// @version      1.0
// @description  Outil de feedback visuel — chargement automatique en dev
// @author       ENPICE
// @match        http://localhost:*/*
// @match        http://127.0.0.1:*/*
// @grant        none
// @run-at       document-idle
// ==/UserScript==

(function () {
  var SCRIPT_URL = 'http://localhost:8877/feedback.js';
  var s = document.createElement('script');
  s.src = SCRIPT_URL + '?t=' + Date.now();
  document.body.appendChild(s);
})();
