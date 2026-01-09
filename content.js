// Listen for messages from background.js
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('Content script received message:', request.action);
  
  if (request.action === "getSelection") {
    const selectedText = window.getSelection().toString();
    console.log('Sending selected text:', selectedText);
    sendResponse({ text: selectedText });
    return true;
  }
  
  if (request.action === "copyToClipboard") {
    console.log('Attempting to copy to clipboard:', request.text);
    
    // Try execCommand as fallback if clipboard API fails
    const copyToClipboard = async (text) => {
      try {
        await navigator.clipboard.writeText(text);
        console.log('Copied using Clipboard API');
        return true;
      } catch (err) {
        console.log('Clipboard API failed, trying execCommand');
        try {
          const textarea = document.createElement('textarea');
          textarea.value = text;
          textarea.style.position = 'fixed';
          document.body.appendChild(textarea);
          textarea.select();
          const success = document.execCommand('copy');
          document.body.removeChild(textarea);
          return success;
        } catch (err2) {
          console.error('All clipboard methods failed:', err2);
          return false;
        }
      }
    };

    copyToClipboard(request.text).then(success => {
      console.log('Copy success:', success);
      sendResponse({ success: success });
    });
    return true;
  }
});

// Log when content script loads
console.log('Citation Manager content script loaded');