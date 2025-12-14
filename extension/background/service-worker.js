// Claude Assistant - Background Service Worker

const CLAUDE_API_URL = 'https://api.anthropic.com/v1/messages';
const CLAUDE_MODEL = 'claude-sonnet-4-20250514';

// APIキーを取得
async function getApiKey() {
  const result = await chrome.storage.sync.get(['claudeApiKey']);
  return result.claudeApiKey;
}

// Claude APIにメッセージを送信
async function sendToClaude(messages, systemPrompt = '') {
  const apiKey = await getApiKey();

  if (!apiKey) {
    throw new Error('APIキーが設定されていません。設定ページでAPIキーを入力してください。');
  }

  const requestBody = {
    model: CLAUDE_MODEL,
    max_tokens: 4096,
    messages: messages
  };

  if (systemPrompt) {
    requestBody.system = systemPrompt;
  }

  const response = await fetch(CLAUDE_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true'
    },
    body: JSON.stringify(requestBody)
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'API呼び出しに失敗しました');
  }

  const data = await response.json();
  return data.content[0].text;
}

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

// タブを操作
async function manageTab(action, params) {
  switch (action) {
    case 'create':
      return await chrome.tabs.create({ url: params.url });
    case 'close':
      await chrome.tabs.remove(params.tabId);
      return { success: true };
    case 'activate':
      await chrome.tabs.update(params.tabId, { active: true });
      await chrome.windows.update(params.windowId, { focused: true });
      return { success: true };
    case 'reload':
      await chrome.tabs.reload(params.tabId);
      return { success: true };
    default:
      throw new Error('不明なタブ操作: ' + action);
  }
}

// ブックマークを操作
async function manageBookmark(action, params) {
  switch (action) {
    case 'create':
      return await chrome.bookmarks.create({
        title: params.title,
        url: params.url
      });
    case 'delete':
      await chrome.bookmarks.remove(params.id);
      return { success: true };
    case 'search':
      return await chrome.bookmarks.search(params.query);
    default:
      throw new Error('不明なブックマーク操作: ' + action);
  }
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

        // テキストを制限（トークン節約）
        const truncatedText = bodyText.substring(0, 15000);

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
        case 'chat':
          const response = await sendToClaude(request.messages, request.systemPrompt);
          sendResponse({ success: true, response });
          break;

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

        case 'manageTab':
          const tabResult = await manageTab(request.tabAction, request.params);
          sendResponse({ success: true, data: tabResult });
          break;

        case 'manageBookmark':
          const bookmarkResult = await manageBookmark(request.bookmarkAction, request.params);
          sendResponse({ success: true, data: bookmarkResult });
          break;

        case 'getPageContent':
          const content = await getPageContent(request.tabId);
          sendResponse({ success: true, data: content });
          break;

        case 'checkApiKey':
          const apiKey = await getApiKey();
          sendResponse({ success: true, hasApiKey: !!apiKey });
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
  console.log('Claude Assistant がインストールされました');
});
