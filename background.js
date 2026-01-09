// Create right-click menu item when extension is installed
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "copyCite",
    title: "Copy & Cite",
    contexts: ["selection"]
  });
});

// Handle right-click menu clicks
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "copyCite") {
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      function: () => {
        const text = window.getSelection().toString();
        return text;
      }
    }).then(results => {
      const text = results[0].result;
      if (text) {
        const today = new Date();
        const year = today.getFullYear();
        const month = today.toLocaleString('default', { month: 'long' });
        const day = today.getDate();

        const citation = `${text}\n\nCitation:\n${tab.title} (${year}) Available at: ${info.pageUrl} (Accessed: ${day} ${month} ${year})`;

        // First, save the citation for the current user
        chrome.storage.local.get(['currentUser', 'users'], (result) => {
          if (result.currentUser && result.users) {
            const users = result.users;
            if (!users[result.currentUser].citations) {
              users[result.currentUser].citations = [];
            }
            users[result.currentUser].citations.push(citation);
            chrome.storage.local.set({ users }, () => {
              console.log('Citation saved for user:', result.currentUser);
            });
          }
        });

        // Then copy to clipboard
        chrome.scripting.executeScript({
          target: { tabId: tab.id },
          func: (textToCopy) => {
            const textarea = document.createElement('textarea');
            textarea.value = textToCopy;
            document.body.appendChild(textarea);
            textarea.select();
            navigator.clipboard.writeText(textarea.value).then(() => {
              document.body.removeChild(textarea);
            }).catch(() => {
              document.body.removeChild(textarea);
            });
          },
          args: [citation]
        }).then(() => {
          chrome.notifications.create({
            type: 'basic',
            iconUrl: 'icons/icon128.png',
            title: 'Citation Saved and Copied!',
            message: 'Citation has been saved to your account and copied to clipboard',
            priority: 2,
            requireInteraction: true
          });
        });
      }
    }).catch(err => {
      console.error('Error:', err);
    });
  }
});