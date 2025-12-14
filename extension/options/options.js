// Claude Assistant - Options Script

const apiKeyInput = document.getElementById('apiKey');
const saveBtn = document.getElementById('saveBtn');
const testBtn = document.getElementById('testBtn');
const statusDiv = document.getElementById('status');

// 初期化
document.addEventListener('DOMContentLoaded', async () => {
  await loadSettings();
  setupEventListeners();
});

// 設定を読み込む
async function loadSettings() {
  const result = await chrome.storage.sync.get(['claudeApiKey']);
  if (result.claudeApiKey) {
    // APIキーの一部だけ表示（セキュリティ）
    const maskedKey = result.claudeApiKey.substring(0, 10) + '...' + result.claudeApiKey.slice(-4);
    apiKeyInput.placeholder = maskedKey;
  }
}

// イベントリスナー設定
function setupEventListeners() {
  saveBtn.addEventListener('click', saveSettings);
  testBtn.addEventListener('click', testConnection);
}

// 設定を保存
async function saveSettings() {
  const apiKey = apiKeyInput.value.trim();

  if (!apiKey) {
    showStatus('APIキーを入力してください', 'error');
    return;
  }

  if (!apiKey.startsWith('sk-ant-')) {
    showStatus('有効なAnthropicのAPIキーを入力してください（sk-ant-で始まります）', 'error');
    return;
  }

  try {
    await chrome.storage.sync.set({ claudeApiKey: apiKey });
    showStatus('APIキーを保存しました', 'success');
    apiKeyInput.value = '';

    // プレースホルダーを更新
    const maskedKey = apiKey.substring(0, 10) + '...' + apiKey.slice(-4);
    apiKeyInput.placeholder = maskedKey;
  } catch (error) {
    showStatus('保存に失敗しました: ' + error.message, 'error');
  }
}

// 接続テスト
async function testConnection() {
  testBtn.disabled = true;
  testBtn.textContent = 'テスト中...';

  try {
    const result = await chrome.storage.sync.get(['claudeApiKey']);

    if (!result.claudeApiKey) {
      showStatus('APIキーが設定されていません。まずAPIキーを保存してください。', 'error');
      return;
    }

    // シンプルなテストメッセージを送信
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': result.claudeApiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 10,
        messages: [
          { role: 'user', content: 'Hi' }
        ]
      })
    });

    if (response.ok) {
      showStatus('接続テスト成功！APIキーは有効です。', 'success');
    } else {
      const error = await response.json();
      showStatus('接続テスト失敗: ' + (error.error?.message || 'Unknown error'), 'error');
    }
  } catch (error) {
    showStatus('接続テスト失敗: ' + error.message, 'error');
  } finally {
    testBtn.disabled = false;
    testBtn.textContent = '接続テスト';
  }
}

// ステータス表示
function showStatus(message, type) {
  statusDiv.textContent = message;
  statusDiv.className = 'status ' + type;

  // 5秒後に非表示
  setTimeout(() => {
    statusDiv.className = 'status';
  }, 5000);
}
