// Claude Assistant - Background Service Worker (No API Version)

// タブ情報を取得
async function getTabs() {
  const tabs = await chrome.tabs.query({});
  return tabs.map(tab => ({
    id: tab.id,
    title: tab.title,
    url: tab.url,
    active: tab.active,
    windowId: tab.windowId
  }));
}

// ブックマークを取得
async function getBookmarks() {
  const bookmarks = await chrome.bookmarks.getTree();
  return flattenBookmarks(bookmarks);
}

function flattenBookmarks(nodes, result = []) {
  for (const node of nodes) {
    if (node.url) {
      result.push({
        id: node.id,
        title: node.title,
        url: node.url
      });
    }
    if (node.children) {
      flattenBookmarks(node.children, result);
    }
  }
  return result;
}

// 履歴を取得
async function getHistory(maxResults = 100) {
  const history = await chrome.history.search({
    text: '',
    maxResults: maxResults,
    startTime: Date.now() - (7 * 24 * 60 * 60 * 1000) // 過去7日間
  });
  return history.map(item => ({
    title: item.title,
    url: item.url,
    visitCount: item.visitCount,
    lastVisitTime: item.lastVisitTime
  }));
}

// ページコンテンツを取得
async function getPageContent(tabId) {
  try {
    const results = await chrome.scripting.executeScript({
      target: { tabId: tabId },
      func: () => {
        // ページの主要なテキストコンテンツを抽出
        const getText = (element) => {
          const tagName = element.tagName.toLowerCase();
          if (['script', 'style', 'noscript', 'iframe'].includes(tagName)) {
            return '';
          }

          let text = '';
          for (const child of element.childNodes) {
            if (child.nodeType === Node.TEXT_NODE) {
              text += child.textContent.trim() + ' ';
            } else if (child.nodeType === Node.ELEMENT_NODE) {
              text += getText(child);
            }
          }
          return text;
        };

        const title = document.title;
        const url = window.location.href;
        const metaDescription = document.querySelector('meta[name="description"]')?.content || '';
        const bodyText = getText(document.body).replace(/\s+/g, ' ').trim();

        // テキストを制限（長すぎるとクリップボードが大変）
        const truncatedText = bodyText.substring(0, 10000);

        return {
          title,
          url,
          metaDescription,
          content: truncatedText
        };
      }
    });

    return results[0].result;
  } catch (error) {
    console.error('ページコンテンツ取得エラー:', error);
    return null;
  }
}

// メッセージハンドラー
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  (async () => {
    try {
      switch (request.action) {
        case 'getTabs':
          const tabs = await getTabs();
          sendResponse({ success: true, data: tabs });
          break;

        case 'getBookmarks':
          const bookmarks = await getBookmarks();
          sendResponse({ success: true, data: bookmarks });
          break;

        case 'getHistory':
          const history = await getHistory(request.maxResults);
          sendResponse({ success: true, data: history });
          break;

        case 'getPageContent':
          const content = await getPageContent(request.tabId);
          sendResponse({ success: true, data: content });
          break;

        default:
          sendResponse({ success: false, error: '不明なアクション' });
      }
    } catch (error) {
      sendResponse({ success: false, error: error.message });
    }
  })();

  return true; // 非同期レスポンスを示す
});

// インストール時の処理
chrome.runtime.onInstalled.addListener(() => {
  console.log('Claude Assistant がインストールされました（APIキー不要版）');
});
