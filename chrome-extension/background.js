chrome.commands.onCommand.addListener(function (command) {
  if (command !== 'toggle-feedback') return;

  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    if (!tabs[0]) return;
    var tabId = tabs[0].id;

    chrome.scripting.executeScript({
      target: { tabId: tabId },
      func: function () {
        return typeof window.__enpiceFeedback__ !== 'undefined';
      },
    }, function (results) {
      var alreadyLoaded = results && results[0] && results[0].result;

      if (alreadyLoaded) {
        chrome.scripting.executeScript({
          target: { tabId: tabId },
          func: function () { window.__enpiceFeedback__.toggle(); },
        });
      } else {
        chrome.scripting.executeScript({
          target: { tabId: tabId },
          files: ['feedback.js'],
        });
      }
    });
  });
});
