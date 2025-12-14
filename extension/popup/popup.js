// Claude Assistant - Popup Script

let conversationHistory = [];

// DOM要素
const messagesContainer = document.getElementById('messages');
const userInput = document.getElementById('userInput');
const sendBtn = document.getElementById('sendBtn');
const settingsBtn = document.getElementById('settingsBtn');
const apiKeyWarning = document.getElementById('apiKeyWarning');
const openSettingsLink = document.getElementById('openSettings');

// 初期化
document.addEventListener('DOMContentLoaded', async () => {
  await checkApiKey();
  setupEventListeners();
});

// APIキー確認
async function checkApiKey() {
  const response = await chrome.runtime.sendMessage({ action: 'checkApiKey' });
  if (!response.hasApiKey) {
    apiKeyWarning.classList.remove('hidden');
  }
}

// イベントリスナー設定
function setupEventListeners() {
  sendBtn.addEventListener('click', handleSend);

  userInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  });

  settingsBtn.addEventListener('click', () => {
    chrome.runtime.openOptionsPage();
  });

  openSettingsLink.addEventListener('click', (e) => {
    e.preventDefault();
    chrome.runtime.openOptionsPage();
  });

  // クイックアクションボタン
  document.querySelectorAll('.action-btn').forEach(btn => {
    btn.addEventListener('click', () => handleQuickAction(btn.dataset.action));
  });
}

// メッセージ送信処理
async function handleSend() {
  const text = userInput.value.trim();
  if (!text) return;

  addMessage(text, 'user');
  userInput.value = '';
  sendBtn.disabled = true;

  // ローディング表示
  const loadingId = showLoading();

  try {
    // コンテキスト情報を収集
    const context = await gatherContext(text);

    // システムプロンプトを構築
    const systemPrompt = buildSystemPrompt(context);

    // 会話履歴に追加
    conversationHistory.push({
      role: 'user',
      content: text
    });

    // Claudeに送信
    const response = await chrome.runtime.sendMessage({
      action: 'chat',
      messages: conversationHistory,
      systemPrompt: systemPrompt
    });

    hideLoading(loadingId);

    if (response.success) {
      conversationHistory.push({
        role: 'assistant',
        content: response.response
      });
      addMessage(response.response, 'assistant');
    } else {
      addMessage('エラー: ' + response.error, 'assistant');
    }
  } catch (error) {
    hideLoading(loadingId);
    addMessage('エラーが発生しました: ' + error.message, 'assistant');
  }

  sendBtn.disabled = false;
  userInput.focus();
}

// クイックアクション処理
async function handleQuickAction(action) {
  let message = '';

  switch (action) {
    case 'analyzePage':
      message = '現在開いているページの内容を分析して、要約と主要なポイントを教えてください。';
      break;
    case 'listTabs':
      message = '現在開いているタブの一覧を表示してください。';
      break;
    case 'searchBookmarks':
      message = 'ブックマークの一覧を表示してください。';
      break;
    case 'showHistory':
      message = '最近の閲覧履歴を表示してください。';
      break;
  }

  userInput.value = message;
  await handleSend();
}

// コンテキスト情報を収集
async function gatherContext(userMessage) {
  const context = {
    currentPage: null,
    tabs: null,
    bookmarks: null,
    history: null
  };

  const lowerMessage = userMessage.toLowerCase();

  // ページ分析が必要な場合
  if (lowerMessage.includes('ページ') || lowerMessage.includes('page') ||
      lowerMessage.includes('分析') || lowerMessage.includes('要約') ||
      lowerMessage.includes('内容') || lowerMessage.includes('このサイト')) {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab) {
      const response = await chrome.runtime.sendMessage({
        action: 'getPageContent',
        tabId: tab.id
      });
      if (response.success) {
        context.currentPage = response.data;
      }
    }
  }

  // タブ情報が必要な場合
  if (lowerMessage.includes('タブ') || lowerMessage.includes('tab')) {
    const response = await chrome.runtime.sendMessage({ action: 'getTabs' });
    if (response.success) {
      context.tabs = response.data;
    }
  }

  // ブックマーク情報が必要な場合
  if (lowerMessage.includes('ブックマーク') || lowerMessage.includes('bookmark') ||
      lowerMessage.includes('お気に入り')) {
    const response = await chrome.runtime.sendMessage({ action: 'getBookmarks' });
    if (response.success) {
      context.bookmarks = response.data.slice(0, 50); // 最大50件
    }
  }

  // 履歴情報が必要な場合
  if (lowerMessage.includes('履歴') || lowerMessage.includes('history') ||
      lowerMessage.includes('最近')) {
    const response = await chrome.runtime.sendMessage({ action: 'getHistory', maxResults: 30 });
    if (response.success) {
      context.history = response.data;
    }
  }

  return context;
}

// システムプロンプトを構築
function buildSystemPrompt(context) {
  let prompt = `あなたはChromeブラウザのアシスタント「Claude Assistant」です。
ユーザーのブラウジングを支援し、ページの分析、タブ管理、ブックマーク検索、履歴検索などを行います。
回答は日本語で、簡潔かつ親切に行ってください。

`;

  if (context.currentPage) {
    prompt += `## 現在のページ情報
- タイトル: ${context.currentPage.title}
- URL: ${context.currentPage.url}
- 説明: ${context.currentPage.metaDescription}
- ページ内容:
${context.currentPage.content}

`;
  }

  if (context.tabs) {
    prompt += `## 開いているタブ (${context.tabs.length}個)
${context.tabs.map((t, i) => `${i + 1}. [ID:${t.id}] ${t.title} - ${t.url}`).join('\n')}

`;
  }

  if (context.bookmarks) {
    prompt += `## ブックマーク (${context.bookmarks.length}件)
${context.bookmarks.map((b, i) => `${i + 1}. ${b.title} - ${b.url}`).join('\n')}

`;
  }

  if (context.history) {
    prompt += `## 閲覧履歴 (最近${context.history.length}件)
${context.history.map((h, i) => `${i + 1}. ${h.title} - ${h.url} (訪問回数: ${h.visitCount})`).join('\n')}

`;
  }

  return prompt;
}

// メッセージを追加
function addMessage(text, role) {
  const messageDiv = document.createElement('div');
  messageDiv.className = `message ${role}`;

  // マークダウン風の簡易変換
  let html = text
    .replace(/```(\w*)\n([\s\S]*?)```/g, '<pre><code>$2</code></pre>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\n/g, '<br>');

  messageDiv.innerHTML = `<p>${html}</p>`;
  messagesContainer.appendChild(messageDiv);
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// ローディング表示
function showLoading() {
  const id = 'loading-' + Date.now();
  const loadingDiv = document.createElement('div');
  loadingDiv.id = id;
  loadingDiv.className = 'loading';
  loadingDiv.innerHTML = '<span></span><span></span><span></span>';
  messagesContainer.appendChild(loadingDiv);
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
  return id;
}

// ローディング非表示
function hideLoading(id) {
  const loadingDiv = document.getElementById(id);
  if (loadingDiv) {
    loadingDiv.remove();
  }
}
