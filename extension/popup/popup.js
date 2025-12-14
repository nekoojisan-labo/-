// Claude Assistant - Popup Script (No API Version)

const CLAUDE_URL = 'https://claude.ai/new';

// DOM要素
const pageTitleEl = document.getElementById('pageTitle');
const pageUrlEl = document.getElementById('pageUrl');
const customPromptEl = document.getElementById('customPrompt');
const customBtn = document.getElementById('customBtn');
const includeContentEl = document.getElementById('includeContent');
const statusEl = document.getElementById('status');

// 現在のページ情報
let currentPageInfo = null;

// 初期化
document.addEventListener('DOMContentLoaded', async () => {
  await loadCurrentPage();
  setupEventListeners();
});

// 現在のページ情報を取得
async function loadCurrentPage() {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    if (tab) {
      pageTitleEl.textContent = tab.title || 'タイトルなし';
      pageUrlEl.textContent = tab.url || '';

      // ページコンテンツを取得
      if (tab.url && !tab.url.startsWith('chrome://') && !tab.url.startsWith('chrome-extension://')) {
        const response = await chrome.runtime.sendMessage({
          action: 'getPageContent',
          tabId: tab.id
        });

        if (response.success) {
          currentPageInfo = response.data;
        }
      }
    }
  } catch (error) {
    console.error('ページ情報取得エラー:', error);
    pageTitleEl.textContent = 'ページ情報を取得できません';
  }
}

// イベントリスナー設定
function setupEventListeners() {
  // アクションボタン
  document.querySelectorAll('.action-btn[data-action]').forEach(btn => {
    btn.addEventListener('click', () => handleAction(btn.dataset.action));
  });

  // カスタム質問ボタン
  customBtn.addEventListener('click', handleCustomPrompt);

  // Enterキーで送信
  customPromptEl.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleCustomPrompt();
    }
  });
}

// アクション処理
async function handleAction(action) {
  let prompt = '';
  let context = '';

  switch (action) {
    case 'summarize':
      prompt = '以下のWebページの内容を簡潔に要約してください。重要なポイントを箇条書きでまとめてください。';
      context = await getPageContext();
      break;

    case 'explain':
      prompt = '以下のWebページの内容を分かりやすく解説してください。専門用語があれば説明を加えてください。';
      context = await getPageContext();
      break;

    case 'translate':
      prompt = '以下のWebページの内容を日本語に翻訳してください（すでに日本語の場合は英語に翻訳してください）。';
      context = await getPageContext();
      break;

    case 'questions':
      prompt = '以下のWebページの内容について、理解を深めるための質問を5つ作成してください。';
      context = await getPageContext();
      break;

    case 'tabs':
      prompt = '以下は現在開いているブラウザのタブ一覧です。整理のアドバイスをください。関連するタブをグループ化したり、不要そうなタブを提案してください。';
      context = await getTabsContext();
      break;

    case 'bookmarks':
      prompt = '以下は私のブックマーク一覧です。カテゴリ分けや整理のアドバイスをください。';
      context = await getBookmarksContext();
      break;

    case 'history':
      prompt = '以下は最近の閲覧履歴です。私の興味関心を分析して、おすすめのトピックや関連情報を提案してください。';
      context = await getHistoryContext();
      break;
  }

  await sendToClaude(prompt, context);
}

// カスタムプロンプト処理
async function handleCustomPrompt() {
  const prompt = customPromptEl.value.trim();
  if (!prompt) {
    showStatus('質問を入力してください', 'error');
    return;
  }

  let context = '';
  if (includeContentEl.checked) {
    context = await getPageContext();
  }

  await sendToClaude(prompt, context);
}

// ページコンテキスト取得
async function getPageContext() {
  if (!currentPageInfo) {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    return `## ページ情報\n- タイトル: ${tab?.title || '不明'}\n- URL: ${tab?.url || '不明'}`;
  }

  let context = `## ページ情報\n`;
  context += `- タイトル: ${currentPageInfo.title}\n`;
  context += `- URL: ${currentPageInfo.url}\n`;

  if (currentPageInfo.metaDescription) {
    context += `- 説明: ${currentPageInfo.metaDescription}\n`;
  }

  if (includeContentEl.checked && currentPageInfo.content) {
    context += `\n## ページ内容\n${currentPageInfo.content}`;
  }

  return context;
}

// タブコンテキスト取得
async function getTabsContext() {
  const response = await chrome.runtime.sendMessage({ action: 'getTabs' });
  if (!response.success) return '';

  let context = '## 開いているタブ一覧\n';
  response.data.forEach((tab, i) => {
    context += `${i + 1}. ${tab.title}\n   URL: ${tab.url}\n`;
  });

  return context;
}

// ブックマークコンテキスト取得
async function getBookmarksContext() {
  const response = await chrome.runtime.sendMessage({ action: 'getBookmarks' });
  if (!response.success) return '';

  let context = '## ブックマーク一覧\n';
  response.data.slice(0, 50).forEach((bookmark, i) => {
    context += `${i + 1}. ${bookmark.title}\n   URL: ${bookmark.url}\n`;
  });

  return context;
}

// 履歴コンテキスト取得
async function getHistoryContext() {
  const response = await chrome.runtime.sendMessage({ action: 'getHistory', maxResults: 30 });
  if (!response.success) return '';

  let context = '## 最近の閲覧履歴\n';
  response.data.forEach((item, i) => {
    const date = new Date(item.lastVisitTime).toLocaleString('ja-JP');
    context += `${i + 1}. ${item.title}\n   URL: ${item.url}\n   最終訪問: ${date}\n`;
  });

  return context;
}

// Claudeに送信
async function sendToClaude(prompt, context) {
  try {
    // プロンプトを構築
    let fullPrompt = prompt;
    if (context) {
      fullPrompt += '\n\n---\n\n' + context;
    }

    // クリップボードにコピー
    await navigator.clipboard.writeText(fullPrompt);

    showStatus('コピーしました！Claude.aiを開きます...', 'success');

    // 少し待ってからClaude.aiを開く
    setTimeout(() => {
      chrome.tabs.create({ url: CLAUDE_URL });
      window.close();
    }, 800);

  } catch (error) {
    console.error('エラー:', error);
    showStatus('エラーが発生しました: ' + error.message, 'error');
  }
}

// ステータス表示
function showStatus(message, type) {
  statusEl.textContent = message;
  statusEl.className = 'status ' + type;

  if (type !== 'success') {
    setTimeout(() => {
      statusEl.className = 'status';
    }, 3000);
  }
}
